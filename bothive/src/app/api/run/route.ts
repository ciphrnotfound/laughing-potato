import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import {
  agentTools,
  integrationTools,
  generalTools,
  crmTools,
  messagingTools,
  contentTools,
  codingTools,
  studyTools
} from "@/lib/tools";
import { ToolDescriptor, ToolContext, RunResult, SharedMemory } from "@/lib/agentTypes";
import { generateText } from "@/lib/ai-client";

// Aggregate all tools into a map for O(1) lookup
const ALL_TOOLS = [
  ...agentTools,
  ...integrationTools,
  ...generalTools,
  ...crmTools,
  ...messagingTools,
  ...contentTools,
  ...codingTools,
  ...studyTools
];

const TOOL_MAP = new Map<string, ToolDescriptor>(
  ALL_TOOLS.map(t => [t.name, t])
);

// Helper to create ephemeral shared memory for the run
// In a future version, this should persist to Supabase 'memories' table
function createEphemeralMemory(): SharedMemory {
  const store = new Map<string, unknown>();
  return {
    get: async (key) => store.get(key),
    set: async (key, val) => { store.set(key, val); },
    append: async (key, val) => {
      const existing = store.get(key);
      if (Array.isArray(existing)) {
        existing.push(val);
      } else if (existing) {
        store.set(key, [existing, val]);
      } else {
        store.set(key, [val]);
      }
    }
  };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // 1. Authenticate
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    // Note: In an edge case where api/run is called server-to-server without cookie, 
    // we might need to check headers. For now, assume session cookie exists.

    const body = await req.json();
    const { botId, steps } = body;

    // Guardrails
    const MAX_STEPS = 25;
    const STEP_TIMEOUT_MS = 30_000;

    if (!steps || !Array.isArray(steps)) {
      return NextResponse.json({ error: "Invalid request body: 'steps' array required" }, { status: 400 });
    }
    if (steps.length > MAX_STEPS) {
      return NextResponse.json({ error: `Too many steps. Max allowed is ${MAX_STEPS}.` }, { status: 400 });
    }

    const transcript: any[] = [];
    let lastOutput = "";
    const runId = crypto.randomUUID();

    // 2. Prepare Context
    const memory = createEphemeralMemory();

    // 3. Execution Loop
    for (const step of steps) {
      const { agentId, input } = step || {};

      if (!agentId) {
        transcript.push({
          role: "system",
          agentId: "system",
          content: "Missing agentId for step",
          timestamp: Date.now()
        });
        continue;
      }

      const stepInput = typeof input === "string" ? { prompt: input } : (input || {});

      let result: any;
      let executedToolName = agentId;

      // Strategy A: Direct Tool Match
      const runWithTimeout = async <T>(fn: () => Promise<T>): Promise<T | { success: false; output: string }> => {
        return Promise.race([
          fn(),
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: false, output: `Step timed out after ${STEP_TIMEOUT_MS / 1000}s` }), STEP_TIMEOUT_MS)
          ),
        ]) as Promise<T | { success: false; output: string }>;
      };

      if (TOOL_MAP.has(agentId)) {
        const tool = TOOL_MAP.get(agentId)!;
        const ctx: ToolContext = {
          metadata: {
            botId: botId || "anonymous",
            runId,
            userId: user?.id,
          },
          sharedMemory: memory,
          // Tenant would need to be loaded from DB based on user
          tenant: {}
        };

        try {
          result = await runWithTimeout(() => tool.run(stepInput, ctx));
        } catch (e: any) {
          result = { success: false, output: `Tool execution failed: ${e.message}` };
        }
      }
      // Strategy B: Agent ID (UUID) -> Load Persona -> Run General Responder
      else if (agentId.includes("-") && user?.id) { // Simple heuristic for UUID
        // Fetch agent details
        const { data: agentData } = await supabase
          .from("agents")
          .select("*")
          .eq("id", agentId)
          .single();

        if (agentData) {
          // Use general.respond with the agent's system prompt
          const tool = TOOL_MAP.get("general.respond");
          if (tool) {
            const ctx: ToolContext = {
              metadata: {
                botId: botId,
                runId,
                userId: user.id,
                botSystemPrompt: agentData.system_prompt
              },
              sharedMemory: memory
            };
            try {
              // Pass the input prompt + context of who they are
              result = await runWithTimeout(() => tool.run(stepInput, ctx));
            } catch (e: any) {
              result = { success: false, output: `Agent execution failed: ${e.message}` };
            }
          } else {
            result = { error: "General responder capability missing" };
          }
        } else {
          result = { error: `Agent ${agentId} not found` };
        }
      } else {
        result = { error: `Unknown capability or agent: ${agentId}` };
      }

      transcript.push({
        role: "agent",
        agentId,
        content: JSON.stringify(result),
        timestamp: Date.now()
      });

      lastOutput = result?.output || JSON.stringify(result);
    }

    const response: RunResult = {
      transcript,
      output: lastOutput
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("Run API Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
