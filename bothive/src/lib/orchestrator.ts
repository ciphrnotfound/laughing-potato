import { supabase } from "@/lib/supabase";
import {
  AgentMessage,
  RunRequest,
  RunResult,
  ToolDescriptor,
  ToolContext,
  ToolManifestEntry,
} from "@/lib/agentTypes";
import { generalTools, codingTools, studyTools } from "@/lib/tools";
import { createSharedMemory } from "@/lib/sharedMemory";

const TOOLSETS: ToolDescriptor[] = [...generalTools, ...codingTools, ...studyTools];
const TOOL_MAP = TOOLSETS.reduce<Record<string, ToolDescriptor>>((acc, tool) => {
  acc[tool.capability] = tool;
  return acc;
}, {});
const TOOL_NAME_MAP = TOOLSETS.reduce<Record<string, ToolDescriptor>>((acc, tool) => {
  acc[tool.name] = tool;
  return acc;
}, {});

type BotRecord = {
  id: string;
  capabilities: unknown;
  default_version_id?: string | null;
  system_prompt?: string | null;
  tool_manifest?: unknown;
  memory_strategy?: string | null;
};

type RunRecord = {
  bot_id: string;
  triggered_by: string | null;
  bot_version_id: string | null;
};

type BotVersionRecord = {
  id: string;
  version: number;
  system_prompt?: string | null;
  tool_manifest?: unknown;
  memory_strategy?: string | null;
  metadata?: unknown;
};

const POSTGRES_UNDEFINED_COLUMN = "42703";
const POSTGREST_MISSING_COLUMN = "PGRST204";

const isMissingColumnError = (error: unknown): error is { code?: string } =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (((error as { code?: string }).code === POSTGRES_UNDEFINED_COLUMN) || (error as { code?: string }).code === POSTGREST_MISSING_COLUMN);

const isToolManifestEntry = (value: unknown): value is ToolManifestEntry => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return typeof entry.capability === "string" && typeof entry.tool === "string";
};

export async function runBotPipeline(runId: string, payload: RunRequest): Promise<RunResult> {
  const transcript: AgentMessage[] = [];
  let latestOutput = "";

  const { data: initialRunRecord, error: runError } = await supabase
    .from("bot_runs")
    .select("bot_id, triggered_by, bot_version_id")
    .eq("id", runId)
    .maybeSingle<RunRecord>();

  let runRecord = initialRunRecord;

  if (runError) {
    if (isMissingColumnError(runError)) {
      const { data: fallbackRun, error: fallbackRunError } = await supabase
        .from("bot_runs")
        .select("bot_id")
        .eq("id", runId)
        .maybeSingle<RunRecord>();

      if (fallbackRunError || !fallbackRun) {
        throw fallbackRunError ?? new Error("Run record not found");
      }

      runRecord = { bot_id: fallbackRun.bot_id, triggered_by: null, bot_version_id: null };
    } else {
      throw runError;
    }
  }

  if (!runRecord) {
    throw new Error("Run record not found");
  }

  const { data: initialBotRecord, error: botError } = await supabase
    .from("bots")
    .select("id, capabilities, default_version_id, system_prompt, tool_manifest, memory_strategy")
    .eq("id", runRecord.bot_id)
    .maybeSingle<BotRecord>();

  let botRecord = initialBotRecord;

  if (botError) {
    if (isMissingColumnError(botError)) {
      const { data: fallbackBot, error: fallbackError } = await supabase
        .from("bots")
        .select("id, capabilities, system_prompt, tool_manifest, memory_strategy")
        .eq("id", runRecord.bot_id)
        .maybeSingle<BotRecord>();

      if (fallbackError || !fallbackBot) {
        throw fallbackError ?? new Error("Bot record not found");
      }

      botRecord = { ...fallbackBot, default_version_id: null };
    } else {
      throw botError;
    }
  }

  if (!botRecord) {
    throw new Error("Bot record not found");
  }

  const baseCapabilities = Array.isArray(botRecord.capabilities)
    ? (botRecord.capabilities as unknown[]).filter((entry): entry is string => typeof entry === "string")
    : [];

  const resolvedVersionId = payload.botVersionId ?? runRecord.bot_version_id ?? botRecord.default_version_id ?? null;

  let versionRecord: BotVersionRecord | null = null;

  if (resolvedVersionId) {
    const { data: fetchedVersion, error: versionError } = await supabase
      .from("bot_versions")
      .select("id, version, system_prompt, tool_manifest, memory_strategy, metadata")
      .eq("id", resolvedVersionId)
      .maybeSingle<BotVersionRecord>();

    if (versionError) {
      throw versionError;
    }

    versionRecord = fetchedVersion ?? null;
  } else {
    const { data: latestVersion, error: latestError } = await supabase
      .from("bot_versions")
      .select("id, version, system_prompt, tool_manifest, memory_strategy, metadata")
      .eq("bot_id", botRecord.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle<BotVersionRecord>();

    if (latestError) {
      throw latestError;
    }

    versionRecord = latestVersion ?? null;
  }

  const manifestSource = versionRecord?.tool_manifest ?? botRecord.tool_manifest;
  const manifestEntries = Array.isArray(manifestSource)
    ? (manifestSource as unknown[]).filter(isToolManifestEntry)
    : [];

  const enabledManifestEntries = manifestEntries.filter((entry) => entry.enabled !== false);

  const allowedCapabilities = enabledManifestEntries.length > 0
    ? Array.from(new Set(enabledManifestEntries.map((entry) => entry.capability)))
    : baseCapabilities;

  const systemPrompt = versionRecord?.system_prompt ?? botRecord.system_prompt ?? undefined;
  const memoryStrategy = versionRecord?.memory_strategy ?? botRecord.memory_strategy ?? undefined;

  if (systemPrompt) {
    transcript.push({
      role: "system",
      content: `Loaded persona: ${systemPrompt}`,
      timestamp: Date.now(),
    });
  }

  const sharedMemory = createSharedMemory(runId);

  const toolCtx: ToolContext = {
    metadata: {
      botId: botRecord.id,
      runId,
      userId: runRecord.triggered_by ?? undefined,
      botVersionId: versionRecord?.id ?? undefined,
      botVersion: versionRecord?.version,
      botSystemPrompt: systemPrompt,
      memoryStrategy,
    },
    sharedMemory,
  };

  let anyStepSucceeded = false;

  for (const step of payload.steps) {
    const capability = step.agentId;
    const manifestTools = enabledManifestEntries.filter((entry) => entry.capability === capability);

    if (!allowedCapabilities.includes(capability)) {
      transcript.push({
        role: "system",
        content: `Capability ${capability} is not enabled for this bot`,
        timestamp: Date.now(),
      });
      continue;
    }

    const args =
      typeof step.input === "string"
        ? { prompt: step.input }
        : (step.input as Record<string, unknown>);

    const candidateTools = manifestTools.length > 0 ? manifestTools : [{ capability, tool: TOOL_MAP[capability]?.name ?? capability }];

    let stepSucceeded = false;

    for (const entry of candidateTools) {
      const descriptor = TOOL_NAME_MAP[entry.tool] ?? TOOL_MAP[capability];

      if (!descriptor) {
        transcript.push({
          role: "system",
          content: `No tool registered for capability ${capability}`,
          timestamp: Date.now(),
        });
        continue;
      }

      transcript.push({
        role: "agent",
        agentId: capability,
        content: `Executing ${descriptor.name}`,
        timestamp: Date.now(),
      });

      try {
        const result = await descriptor.run(args ?? {}, toolCtx);
        latestOutput = result.output;
        stepSucceeded = true;
        transcript.push({
          role: "agent",
          agentId: capability,
          content: result.output,
          timestamp: Date.now(),
        });
      } catch (toolError) {
        const message = toolError instanceof Error ? toolError.message : "Unknown tool execution error";
        transcript.push({
          role: "system",
          content: `Tool ${descriptor.name} failed: ${message}`,
          timestamp: Date.now(),
        });
      }
    }

    anyStepSucceeded = anyStepSucceeded || stepSucceeded;

    if (!stepSucceeded) {
      transcript.push({
        role: "system",
        content: `All tools for capability ${capability} failed or were unavailable`,
        timestamp: Date.now(),
      });
    }
  }

  if (!anyStepSucceeded) {
    await supabase
      .from("bot_runs")
      .update({ status: "failed", completed_at: new Date().toISOString() })
      .eq("id", runId);

    return { transcript, output: latestOutput };
  }

  await supabase
    .from("bot_runs")
    .update({ status: "succeeded", completed_at: new Date().toISOString() })
    .eq("id", runId);

  return { transcript, output: latestOutput };
}
