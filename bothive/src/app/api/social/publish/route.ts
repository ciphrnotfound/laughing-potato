import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { sessionsStorage, usersStorage } from "@/lib/storage";
import { getConnectedAccount } from "@/lib/connected-accounts";
import { publishTweet } from "@/lib/integrations/twitter";
import { publishLinkedInPost } from "@/lib/integrations/linkedin";
import { updateSocialPostStatus, type SocialPostRecord } from "@/lib/social-posts";

interface PublishRequestBody {
  postId?: string;
}

async function resolveSessionUser(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  if (!sessionId) return null;

  const sessions = (await sessionsStorage.read()) as Record<string, { userId?: string; expiresAt?: string }>;
  const session = sessions[sessionId];

  if (!session?.userId || !session.expiresAt) {
    return null;
  }

  if (new Date(session.expiresAt) < new Date()) {
    delete sessions[sessionId];
    await sessionsStorage.write(sessions);
    return null;
  }

  const users = await usersStorage.read();
  const hasUser = Object.values(users).some(
    (entry) => typeof entry === "object" && entry && (entry as { id?: string }).id === session.userId
  );

  return hasUser ? session.userId : null;
}

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveSessionUser();
    if (!userId) {
      return Response.json({ error: "Sign in to publish posts." }, { status: 401 });
    }

    const body = (await req.json()) as PublishRequestBody;
    if (!body.postId) {
      return Response.json({ error: "postId required" }, { status: 400 });
    }

    const { data: post, error } = await supabase
      .from("social_posts")
      .select("*")
      .eq("id", body.postId)
      .maybeSingle<SocialPostRecord>();

    if (error) {
      throw error;
    }

    if (!post || post.user_id !== userId) {
      return Response.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status === "published") {
      return Response.json({ error: "Post already published" }, { status: 400 });
    }

    const platform = post.platform === "linkedin" ? "linkedin" : "twitter";
    const account = await getConnectedAccount(userId, platform);

    if (!account) {
      return Response.json(
        { error: `Connect your ${platform === "twitter" ? "Twitter/X" : "LinkedIn"} account before publishing.` },
        { status: 400 }
      );
    }

    let publishResult: { externalId: string; url: string };

    if (platform === "twitter") {
      publishResult = await publishTweet({ account, text: post.content });
    } else {
      publishResult = await publishLinkedInPost({ account, text: post.content });
    }

    await updateSocialPostStatus(post.id, "published", {
      externalId: publishResult.externalId,
      publishedAt: new Date().toISOString(),
    });

    return Response.json({ success: true, ...publishResult });
  } catch (error) {
    console.error("Social publish error:", error);
    const message = error instanceof Error ? error.message : "Failed to publish post";
    return Response.json({ error: message }, { status: 500 });
  }
}
