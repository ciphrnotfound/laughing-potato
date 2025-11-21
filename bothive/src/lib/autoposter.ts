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