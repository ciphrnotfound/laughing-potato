import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { aiClient, AI_MODEL } from "@/lib/ai-client";

// Keep pricing centralized here for now (can be moved to DB model_pricing table later)
// NOTE: this should reflect your Groq/OpenAI-compatible model IDs.
const MODEL_PRICING: Record<string, number> = {
  // Groq defaults
  "llama-3.3-70b-versatile": 10,
  "mixtral-8x7b-32768": 6,
  "gemma-7b-it": 2,

  // OpenAI fallback examples (if enabled)
  "gpt-4": 15,
  "gpt-4-turbo": 8,
  "gpt-4o": 10,
  "gpt-4o-mini": 3,
  "gpt-3.5-turbo": 2,

  default: 5,
};

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY for worker"
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function requireWorkerAuth(request: NextRequest) {
  const token = request.headers.get("x-worker-token");
  const expected = process.env.PROACTIVE_WORKER_TOKEN;
  if (!expected) {
    throw new Error(
      "Missing PROACTIVE_WORKER_TOKEN env var. Refusing to run worker unauthenticated."
    );
  }
  if (!token || token !== expected) {
    return false;
  }
  return true;
}

async function runBotOnce(params: {
  systemPrompt: string;
  prompt: string;
  context?: string;
  model: string;
}) {
  const { systemPrompt, prompt, context, model } = params;

  // Groq Cloud is OpenAI-compatible, and this repo already centralizes
  // provider selection/baseURL in ai-client.ts.
  const response = await aiClient.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...(context ? [{ role: "assistant", content: context }] : []),
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
  });

  return {
    text: response.choices?.[0]?.message?.content?.trim?.() || "",
    raw: response,
  };
}

/**
 * POST /api/proactive/worker
 *
 * A trusted endpoint (protected by x-worker-token) that can be hit by:
 * - Vercel Cron
 * - Supabase scheduled function
 * - a long-running worker (Fly/Render/etc)
 *
 * Flow:
 * 1) enqueue due schedules -> bot_jobs
 * 2) claim due jobs (db lock) -> running
 * 3) execute each job
 * 4) charge credits on success (or mark failed)
 */
export async function POST(request: NextRequest) {
  try {
    if (!requireWorkerAuth(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const url = new URL(request.url);

    const limit = Math.max(1, Math.min(25, Number(url.searchParams.get("limit") || 10)));
    const workerId = url.searchParams.get("workerId") || "proactive-worker";

    // 1) enqueue schedules
    const { data: enqueuedCount, error: enqueueError } = await supabase.rpc(
      "enqueue_due_schedules",
      { p_limit: 50 }
    );
    if (enqueueError) {
      // non-fatal: worker can still process already queued jobs
      console.error("enqueue_due_schedules error:", enqueueError);
    }

    // 2) claim jobs
    const { data: claimed, error: claimError } = await supabase.rpc(
      "claim_due_bot_jobs",
      {
        p_limit: limit,
        p_lock_seconds: 300,
        p_worker_id: workerId,
      }
    );

    if (claimError) {
      console.error("claim_due_bot_jobs error:", claimError);
      return NextResponse.json(
        { error: "Failed to claim jobs" },
        { status: 500 }
      );
    }

    const jobs = Array.isArray(claimed) ? claimed : [];
    const results: any[] = [];

    for (const job of jobs) {
      const jobId = job.id as string;
      const botId = job.bot_id as string;
      const userId = job.user_id as string;

      try {
        // Load bot
        const { data: bot, error: botError } = await supabase
          .from("bots")
          .select("id, user_id, name, system_prompt")
          .eq("id", botId)
          .single();

        if (botError || !bot) {
          throw new Error("Bot not found");
        }

        // Security: job must match bot owner
        if (bot.user_id !== userId) {
          throw new Error("Job user mismatch for bot");
        }

        const input = (job.input || {}) as any;
        const prompt: string =
          input.prompt || input.task || input.message || "Run your proactive routine.";
        const context: string | undefined = input.context;

        // Default model comes from ai-client (Groq if GROQ_API_KEY is set)
        const model: string = job.model || input.model || AI_MODEL;
        const creditCost = MODEL_PRICING[model] ?? MODEL_PRICING.default;

        // Pre-check credits (hard fail if insufficient)
        const { data: wallet, error: walletError } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", userId)
          .single();

        if (walletError) {
          throw new Error(`Wallet lookup failed: ${walletError.message}`);
        }
        const balance = Number(wallet?.balance ?? 0);
        if (balance < creditCost) {
          // mark failed (insufficient credits)
          await supabase
            .from("bot_jobs")
            .update({
              status: "failed",
              error: `Insufficient credits: need ${creditCost}, have ${balance}`,
              finished_at: new Date().toISOString(),
            })
            .eq("id", jobId);

          results.push({ jobId, status: "failed", reason: "insufficient_credits" });
          continue;
        }

        // Execute bot
        const systemPrompt = bot.system_prompt || "You are a helpful assistant.";
        const ai = await runBotOnce({ systemPrompt, prompt, context, model });

        // Charge credits (atomic via rpc)
        const { error: spendError } = await supabase.rpc("spend_user_credits", {
          p_user_id: userId,
          p_amount: creditCost,
          p_type: "proactive_job",
          p_description: `Proactive job: ${bot.name || bot.id}`,
          p_metadata: { bot_id: botId, job_id: jobId, model },
        });

        if (spendError) {
          // if charging fails, mark failed so we don't run free
          await supabase
            .from("bot_jobs")
            .update({
              status: "failed",
              error: `Credit charge failed: ${spendError.message}`,
              finished_at: new Date().toISOString(),
            })
            .eq("id", jobId);

          results.push({ jobId, status: "failed", reason: "credit_charge_failed" });
          continue;
        }

        // Persist job output
        await supabase
          .from("bot_jobs")
          .update({
            status: "succeeded",
            output: { text: ai.text },
            credits_used: creditCost,
            model,
            finished_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        // Also log bot_executions for analytics/history
        await supabase.from("bot_executions").insert({
          bot_id: botId,
          input: prompt,
          output: ai.text,
          source: "proactive",
          created_at: new Date().toISOString(),
        });

        results.push({ jobId, status: "succeeded", creditsUsed: creditCost });
      } catch (e: any) {
        const message = e?.message || "Unknown error";
        console.error(`Job ${jobId} failed:`, message);

        await supabase
          .from("bot_jobs")
          .update({
            status: "failed",
            error: message,
            finished_at: new Date().toISOString(),
          })
          .eq("id", jobId);

        results.push({ jobId, status: "failed", reason: message });
      }
    }

    return NextResponse.json({
      success: true,
      enqueued: typeof enqueuedCount === "number" ? enqueuedCount : null,
      claimed: jobs.length,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Worker error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
