import { supabase } from "@/lib/supabase";


export type SocialPlatform = 'twitter' | 'linkedin' | 'facebook' | 'instagram';

export interface SocialPostRecord {
    id: string;
    user_id: string;
    platform: SocialPlatform;
    content: string;
    status: 'draft' | 'scheduled' | 'published' | 'failed';
    scheduled_for: string | null;
    published_at: string | null;
    external_id: string | null;
    external_url: string | null;
    media_urls: string[];
    analytics: any;
    created_at: string;
    updated_at: string;
}

/**
 * List social posts for a user
 */
export async function listSocialPosts(userId: string): Promise<SocialPostRecord[]> {
    const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error listing social posts:', error);
        return [];
    }

    return (data || []) as SocialPostRecord[];
}

/**
 * Get all scheduled posts across all users (for cron jobs)
 */
export async function getAllScheduledPosts(): Promise<SocialPostRecord[]> {
    const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('status', 'scheduled')
        .order('scheduled_for', { ascending: true });

    if (error) {
        console.error('Error getting scheduled posts:', error);
        return [];
    }

    return (data || []) as SocialPostRecord[];
}

/**
 * Create a new social post
 */
export async function createSocialPost(
    userId: string,
    platform: SocialPostRecord['platform'],
    content: string,
    scheduledFor?: string
): Promise<SocialPostRecord | null> {
    const { data, error } = await supabase
        .from('social_posts')
        .insert({
            user_id: userId,
            platform,
            content,
            status: scheduledFor ? 'scheduled' : 'draft',
            scheduled_for: scheduledFor || null,
            media_urls: [],
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating social post:', error);
        return null;
    }

    return data as SocialPostRecord;
}

/**
 * Update social post status
 */
export async function updateSocialPostStatus(
    postId: string,
    status: SocialPostRecord['status'],
    metadata?: {
        externalId?: string;
        externalUrl?: string;
        publishedAt?: string;
        analytics?: any;
    }
): Promise<boolean> {
    const updates: any = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (metadata?.externalId) updates.external_id = metadata.externalId;
    if (metadata?.externalUrl) updates.external_url = metadata.externalUrl;
    if (metadata?.publishedAt) updates.published_at = metadata.publishedAt;
    if (metadata?.analytics) updates.analytics = metadata.analytics;

    const { error } = await supabase
        .from('social_posts')
        .update(updates)
        .eq('id', postId);

    if (error) {
        console.error('Error updating social post:', error);
        return false;
    }

    return true;
}

/**
 * Delete a social post
 */
export async function deleteSocialPost(postId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);

    if (error) {
        console.error('Error deleting social post:', error);
        return false;
    }

    return true;
}

/**
 * Get post by ID
 */
export async function getSocialPost(postId: string): Promise<SocialPostRecord | null> {
    const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('id', postId)
        .single();

    if (error) {
        console.error('Error getting social post:', error);
        return null;
    }

    return data as SocialPostRecord;
}
