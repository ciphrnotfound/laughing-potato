import { NextRequest, NextResponse } from 'next/server';
import { sessionsStorage, usersStorage } from '@/lib/storage';
import { listSocialPosts, updateSocialPostStatus, getAllScheduledPosts } from '@/lib/social-posts';
import { publishTweet } from '@/lib/integrations/twitter';
import { publishLinkedInPost } from '@/lib/integrations/linkedin';
import { getConnectedAccount } from '@/lib/connected-accounts';

type StoredSession = {
  userId: string;
  email?: string;
  createdAt?: string;
  expiresAt?: string;
};

async function verifySession(request: NextRequest): Promise<{ userId: string; email?: string } | null> {
  const sessionId = request.cookies.get("session")?.value;
  
  if (!sessionId) {
    return null;
  }

  const sessions = await sessionsStorage.read();
  const session = sessions[sessionId] as StoredSession | undefined;

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    return null;
  }

  return { userId: session.userId, email: session.email };
}

// This endpoint checks for scheduled posts that are due and publishes them
// It can be called by a cron job or scheduler service
export async function POST(request: NextRequest) {
  try {
    // Verify session for manual triggers (optional for cron jobs)
    const isCron = request.headers.get('x-cron-trigger') === 'true';
    
    // For cron jobs, we need to get all users' scheduled posts  
    let userId: string | undefined;
    if (!isCron) {
      const session = await verifySession(request);
      if (!session) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      userId = session.userId;
    }
    const now = new Date();
    
    // For cron jobs, get all posts (we'll filter by user in the loop)
    const upcomingPosts = userId ? await listSocialPosts(userId) : await getAllScheduledPosts();
    
    // Filter for scheduled posts only
    const scheduledPosts = upcomingPosts.filter(post => post.status === 'scheduled');
    
    const results = {
      published: [] as Array<{id: string; platform: string; scheduledFor: string | null; publishedAt: string}>,
      failed: [] as Array<{id: string; platform: string; error: string}>,
      skipped: [] as Array<{id: string; platform: string; scheduledFor: string | null}>
    };

    for (const post of scheduledPosts) {
      try {
        const scheduledTime = new Date(post.scheduled_for!);
        
        // Check if post is due (within 1 minute buffer)
        if (post.scheduled_for && scheduledTime <= now) {
          try {
            // Get connected account for publishing
            const account = await getConnectedAccount(post.user_id, post.platform);
            
            if (!account) {
              results.failed.push({
                id: post.id,
                platform: post.platform,
                error: 'No connected account found'
              });
              continue;
            }

            // Publish to the appropriate platform
            if (post.platform === 'twitter') {
              await publishTweet({ account, text: post.content });
            } else if (post.platform === 'linkedin') {
              await publishLinkedInPost({ account, text: post.content });
            }

            // Update post status to published
            const success = await updateSocialPostStatus(post.id, 'published', {
              publishedAt: new Date().toISOString()
            });
            
            if (success) {
              results.published.push({
                id: post.id,
                platform: post.platform,
                scheduledFor: post.scheduled_for,
                publishedAt: new Date().toISOString()
              });
            } else {
              results.failed.push({
                id: post.id,
                platform: post.platform,
                error: 'Failed to update post status'
              });
            }
          } catch (publishError) {
            results.failed.push({
              id: post.id,
              platform: post.platform,
              error: publishError instanceof Error ? publishError.message : 'Publishing failed'
            });
          }
        } else {
          results.skipped.push({
            id: post.id,
            platform: post.platform,
            scheduledFor: post.scheduled_for
          });
        }
      } catch (error) {
        results.failed.push({
          id: post.id,
          platform: post.platform,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: upcomingPosts.length,
      results,
      timestamp: now.toISOString()
    });

  } catch (error) {
    console.error('Error in publish-scheduled:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
