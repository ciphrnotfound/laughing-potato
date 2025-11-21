// @ts-nocheck
// Supabase Edge Function: auto-publish scheduled social posts
// Deploy with: supabase functions deploy auto-publish
// Schedule with: supabase cron deploy auto-publish --schedule "*/15 * * * *"

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

interface SocialPostRow {
  id: string;
  platform: "twitter" | "linkedin";
  content: string;
  scheduled_for: string | null;
}


const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const BOT_RUN_URL = Deno.env.get("BOTHIVE_RUN_ENDPOINT");
const BOT_VERSION_ID = Deno.env.get("BOTHIVE_PUBLISHER_VERSION_ID");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase credentials. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
}

if (!BOT_RUN_URL) {
  console.error("Missing BOTHIVE_RUN_ENDPOINT. Set to your app's /api/run URL.");
}

if (!BOT_VERSION_ID) {
  console.error("Missing BOTHIVE_PUBLISHER_VERSION_ID. Set to the deployed publisher bot version id.");
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  global: {
    headers: { "Content-Type": "application/json" },
  },
});

serve(async () => {
  if (!BOT_RUN_URL || !BOT_VERSION_ID) {
    return new Response("Missing BOTHIVE configuration", { status: 500 });
  }

  const nowIso = new Date().toISOString();
  const { data: rows, error } = await supabase
    .from("social_posts")
    .select("id, platform, content, scheduled_for")
    .eq("status", "scheduled")
    .lte("scheduled_for", nowIso)
    .limit(10);

  if (error) {
    console.error("Failed to load scheduled posts", error);
    return new Response("Error querying social_posts", { status: 500 });
  }

  if (!rows || rows.length === 0) {
    return new Response("No posts due", { status: 200 });
  }

  type PublishResult = { id: string; ok: boolean; error?: string };

  const publishResults: PublishResult[] = await Promise.all(
    rows.map(async (post: SocialPostRow): Promise<PublishResult> => {
      try {
        const response = await fetch(BOT_RUN_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({
            botVersionId: BOT_VERSION_ID,
            steps: [
              {
                agentId: "HiveAutoBroadcaster",
                input: {
                  platform: post.platform,
                  content: post.content,
                  postId: post.id,
                },
              },
            ],
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error("Run request failed", response.status, text);
          return { id: post.id, ok: false, error: text };
        }

        return { id: post.id, ok: true };
      } catch (publishError) {
        console.error("Failed to publish post", post.id, publishError);
        return { id: post.id, ok: false, error: String(publishError) };
      }
    })
  );

  const successes = publishResults.filter((result) => result.ok).map((result) => result.id);
  const failures = publishResults.filter((result) => !result.ok);

  if (successes.length > 0) {
    const { error: updateError } = await supabase
      .from("social_posts")
      .update({ status: "published", published_at: nowIso })
      .in("id", successes);

    if (updateError) {
      console.error("Failed to update published posts", updateError);
    }
  }

  return new Response(
    JSON.stringify({
      processed: rows.length,
      published: successes.length,
      failures,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
});
