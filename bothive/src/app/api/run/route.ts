import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { runBotPipeline } from "@/lib/orchestrator";
import type { RunRequest } from "@/lib/agentTypes";

const POSTGRES_UNDEFINED_COLUMN = "42703";
const POSTGREST_MISSING_COLUMN = "PGRST204";

const isMissingColumnError = (error: unknown): error is { code?: string } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (((error as { code?: string }).code === POSTGRES_UNDEFINED_COLUMN) || (error as { code?: string }).code === POSTGREST_MISSING_COLUMN);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RunRequest & { botId: string; botVersionId?: string; triggeredBy?: string };

    if (!body.botId || !body.steps?.length) {
      return Response.json({ error: "botId and at least one step required" }, { status: 400 });
    }

    let runId: string | null = null;

    const { data: runInsert, error: runInsertError } = await supabase
      .from("bot_runs")
      .insert({
        bot_id: body.botId,
        bot_version_id: body.botVersionId ?? null,
        triggered_by: body.triggeredBy ?? null,
        context: body.context ?? {},
        status: "running",
      })
      .select("id")
      .single();

    if (runInsertError || !runInsert?.id) {
      if (isMissingColumnError(runInsertError)) {
        const { data: fallbackInsert, error: fallbackError } = await supabase
          .from("bot_runs")
          .insert({ bot_id: body.botId })
          .select("id")
          .single();

        if (fallbackError || !fallbackInsert?.id) {
          throw fallbackError ?? new Error("Failed to create run record (legacy schema)");
        }

        runId = fallbackInsert.id;
      } else {
        throw runInsertError ?? new Error("Failed to create run record");
      }
    } else {
      runId = runInsert.id;
    }

    if (!runId) {
      throw new Error("Run record creation did not return an id");
    }
    const result = await runBotPipeline(runId, body);

    const messagesPayload = result.transcript.map((message) => ({
      run_id: runId,
      sender: message.role,
      payload: message,
    }));

    if (messagesPayload.length > 0) {
      const { error: logError } = await supabase.from("bot_run_messages").insert(messagesPayload);
      if (logError) {
        console.error("Failed to log run messages", logError);
      }
    }

    return Response.json({ runId, ...result }, { status: 200 });
  } catch (error) {
    console.error("Run error:", error);
    let message: string;
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      try {
        message = `Failed to execute workflow: ${JSON.stringify(error)}`;
      } catch {
        message = "Failed to execute workflow";
      }
    }
    return Response.json({ error: message }, { status: 500 });
  }
}

