import { supabase } from "@/lib/supabase";

export type SocialPlatform = "twitter" | "linkedin";
export type SocialPostStatus = "draft" | "scheduled" | "published" | "failed";

export interface SocialPostRecord {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  status: SocialPostStatus;
  content: string;
  scheduled_for: string | null;
  published_at: string | null;
  external_id: string | null;
  source: "manual" | "trend_bot";
  meta: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export async function listSocialPosts(userId: string): Promise<SocialPostRecord[]> {
  const { data, error } = await supabase
    .from("social_posts")
    .select("*")
    .eq("user_id", userId)
    .order("scheduled_for", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading social posts", error.message);
    return [];
  }
  return (data ?? []) as SocialPostRecord[];
}

export async function createSocialPost(input: {
  userId: string;
  platform: SocialPlatform;
  content: string;
  status?: SocialPostStatus;
  scheduledFor?: string | null;
  source?: "manual" | "trend_bot";
  meta?: Record<string, unknown>;
}): Promise<SocialPostRecord | null> {
  const payload = {
    user_id: input.userId,
    platform: input.platform,
    content: input.content,
    status: input.status ?? (input.scheduledFor ? "scheduled" : "draft"),
    scheduled_for: input.scheduledFor ?? null,
    source: input.source ?? "manual",
    meta: input.meta ?? {},
  };

  const { data, error } = await supabase
    .from("social_posts")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    console.error("Error creating social post", error?.message);
    return null;
  }
  return data as SocialPostRecord;
}

export async function updateSocialPostStatus(
  id: string,
  status: SocialPostStatus,
  extras?: { externalId?: string | null; publishedAt?: string | null }
): Promise<boolean> {
  const updatePayload: Record<string, unknown> = { status };

  if (Object.prototype.hasOwnProperty.call(extras ?? {}, "externalId")) {
    updatePayload.external_id = extras?.externalId ?? null;
  }

  if (Object.prototype.hasOwnProperty.call(extras ?? {}, "publishedAt")) {
    updatePayload.published_at = extras?.publishedAt ?? null;
  }

  const { error } = await supabase
    .from("social_posts")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    console.error("Error updating social post status", error.message);
    return false;
  }
  return true;
}
