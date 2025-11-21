import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { AutoposterPayload } from "@/lib/autoposter";
import { getPublisherBot } from "@/lib/autoposter";
import { sessionsStorage, usersStorage } from "@/lib/storage";
import { createSocialPost, updateSocialPostStatus } from "@/lib/social-posts";
import { getConnectedAccount } from "@/lib/connected-accounts";
import { publishTweet } from "@/lib/integrations/twitter";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;
    if (!sessionId) {
      return Response.json({ error: "Sign in to run the autoposter." }, { status: 401 });
    }

    const sessions = (await sessionsStorage.read()) as Record<string, { userId?: string; expiresAt?: string }>;
    const session = sessions[sessionId];

    if (!session?.userId || !session.expiresAt || new Date(session.expiresAt) < new Date()) {
      if (session && (!session.expiresAt || new Date(session.expiresAt) < new Date())) {
        delete sessions[sessionId];
        await sessionsStorage.write(sessions);
      }
      return Response.json({ error: "Session expired. Sign in again." }, { status: 401 });
    }

    const users = await usersStorage.read();
    const hasUser = Object.values(users).some(
      (entry) => typeof entry === "object" && entry && (entry as { id?: string }).id === session.userId
    );

    if (!hasUser) {
      return Response.json({ error: "Sign in to run the autoposter." }, { status: 401 });
    }

    const userId = session.userId;

    const input = (await req.json()) as AutoposterPayload;
    const { botId, botVersionId } = await getPublisherBot();

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_BASE_URL ?? new URL(req.url).origin;
    const runUrl = `${baseUrl.replace(/\/$/, "")}/api/run`;

    const autoposterPrompt = `You are HiveAutoScheduler, a trend-savvy Twitter autoposter. Use the latest industry inputs to craft one premium tweet.

Inputs:
- Industry: ${input.industry ?? ""}
- Audience: ${input.audience ?? ""}
- Region: ${input.region ?? ""}
- Tone: ${input.tone ?? ""}
- Publish mode: ${input.publishMode ?? "post"}
- Preferred publish time: ${input.publishAt ?? "not scheduled"}
- User-provided trend/topic: ${input.trend ?? "none"}

Instructions:
1. If a trend/topic is provided, lean on it. Otherwise infer a likely hot topic for the industry.
2. Produce exactly one tweet (<= 240 characters) with:
   • Confident, futuristic tone
   • At most one emoji
   • Exactly one CTA at the end
3. Do not include hashtags, quoted text, or explanations. Respond with the tweet copy only.`;

    const response = await fetch(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        botId,
        botVersionId,
        triggeredBy: userId,
        steps: [
          {
            agentId: "general.respond",
            input: { prompt: autoposterPrompt },
          },
        ],
        context: { autoposter: input },
      }),
    });

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw new Error(details?.error ?? "Autoposter run failed");
    }

    const result = (await response.json()) as { runId?: string; output?: string };

    const copy = result.output?.trim();

    if (!copy) {
      return Response.json({ error: "Autoposter finished without usable copy." }, { status: 500 });
    }

    const publishMode = input.publishMode ?? "post";
    const publishSummary: Record<string, unknown> = { mode: publishMode };

    if (publishMode === "post") {
      const account = await getConnectedAccount(userId, "twitter");
      if (!account) {
        return Response.json({ error: "Connect your X account before posting." }, { status: 400 });
      }

      const publishResult = await publishTweet({ account, text: copy });
      const created = await createSocialPost({
        userId,
        platform: "twitter",
        content: copy,
        status: "published",
        scheduledFor: null,
        source: "trend_bot",
        meta: {
          autoposterRunId: result.runId ?? null,
          autoposterInputs: input,
          publishResult,
        },
      });

      if (created) {
        await updateSocialPostStatus(created.id, "published", {
          externalId: publishResult.externalId,
          publishedAt: new Date().toISOString(),
        });
      }

      publishSummary.externalId = publishResult.externalId;
      publishSummary.url = publishResult.url;
    } else {
      const scheduledTime = (() => {
        if (input.publishAt) {
          const parsed = new Date(input.publishAt);
          if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
        }
        return new Date(Date.now() + 60 * 60 * 1000).toISOString();
      })();

      await createSocialPost({
        userId,
        platform: "twitter",
        content: copy,
        status: "scheduled",
        scheduledFor: scheduledTime,
        source: "trend_bot",
        meta: {
          autoposterRunId: result.runId ?? null,
          autoposterInputs: input,
        },
      });

      publishSummary.scheduledFor = scheduledTime;
    }

    const payload = { ...result, output: copy, publish: publishSummary, scheduled: !!publishSummary.scheduledFor };

    return Response.json(payload, { status: 200 });
  } catch (error) {
    console.error("Autoposter error:", error);
    const message = error instanceof Error ? error.message : "Failed to trigger autoposter";

    return Response.json({ error: message }, { status: 500 });
  }
}