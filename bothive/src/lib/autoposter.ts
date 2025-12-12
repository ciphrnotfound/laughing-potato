import { supabase } from "@/lib/supabase";

export type AutoposterPayload = {
  industry?: string;
  audience?: string;
  tone?: string;
  region?: string;
  publishMode?: "post" | "schedule";
  publishAt?: string;
  trend?: string;
};

export async function getPublisherBot() {
  const { data, error } = await supabase
    .from("bots")
    .select("id, default_version_id, metadata")
    .eq("metadata->>templateId", "publisher")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("X autoposter bot not deployed yet.");

  const versionId =
    data.default_version_id ??
    ((data.metadata as Record<string, unknown> | null)?.lastVersionId as string | undefined);

  if (!versionId) {
    throw new Error("Publisher bot does not have a default version. Deploy it once in the Builder.");
  }

  return { botId: data.id, botVersionId: versionId };
}

/**
 * Publish due scheduled posts
 * This function is called by the cron job to publish scheduled social media posts
 */
export async function publishScheduledPosts(): Promise<{
  published: string[];
  failed: string[];
}> {
  const now = new Date().toISOString();

  const { data: duePosts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true });

  if (error) {
    console.error('Error fetching due posts:', error);
    return { published: [], failed: [] };
  }

  const published: string[] = [];
  const failed: string[] = [];

  for (const post of (duePosts || [])) {
    try {
      // Here you would integrate with actual social media APIs
      // For now, just mark as published
      const { error: updateError } = await supabase
        .from('scheduled_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      if (updateError) {
        failed.push(post.id);
      } else {
        published.push(post.id);
      }
    } catch (error) {
      console.error(`Failed to publish post ${post.id}:`, error);
      failed.push(post.id);
    }
  }

  return { published, failed };
}