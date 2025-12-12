import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { executeHiveLangProgram } from "@/lib/agents";
import { generalTools, codingTools, studyTools, socialTools, messagingTools, integrationTools, agentTools } from "@/lib/tools";
import { createSharedMemory } from "@/lib/sharedMemory";
import { ToolContext } from "@/lib/agentTypes";

const ALL_TOOLS = [
    ...generalTools,
    ...codingTools,
    ...studyTools,
    ...socialTools,
    ...messagingTools,
    ...integrationTools,
    ...agentTools,
];

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseClient();
        const body = await req.json();
        const { agent_id, input, hivelang_code } = body;

        if ((!agent_id && !hivelang_code) || !input) {
            return NextResponse.json({ error: "agent_id (or hivelang_code) and input required" }, { status: 400 });
        }

        // Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = user.id;

        // Fetch agent
        const { data: agent } = await supabase
            .from("agents")
            .select("*")
            .eq("id", agent_id)
            .single();

        if (!agent && !hivelang_code) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }

        // Execute with HiveLang if available (ephemeral or from DB)
        const codeToExecute = hivelang_code || agent?.hivelang_code;

        if (codeToExecute) {
            const sharedMemory = createSharedMemory("test-run");
            const toolContext: ToolContext = {
                metadata: {
                    botId: agent?.id || "ephemeral-bot",
                    runId: "test-run",
                    userId,
                    botSystemPrompt: agent?.system_prompt,
                },
                sharedMemory,
            };

            const normalizedInput = typeof input === "string" ? { input } : input;

            const result = await executeHiveLangProgram(
                codeToExecute,
                normalizedInput,
                ALL_TOOLS,
                toolContext
            );

            return NextResponse.json({
                success: result.success,
                output: result.output,
                reactSteps: result.steps || [],
                agentic: true,
            });
        }

        // Fallback: Simple OpenAI
        const { aiClient, AI_MODEL } = await import("@/lib/ai-client");
        const openai = aiClient;

        const completion = await openai.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: "system", content: agent?.system_prompt || "You are a helpful AI assistant." },
                { role: "user", content: typeof input === "string" ? input : JSON.stringify(input) },
            ],
            temperature: 0.7,
        });

        return NextResponse.json({
            success: true,
            output: completion.choices[0]?.message?.content || "",
            agentic: false,
        });
    } catch (error: any) {
        console.error("/api/agents/execute error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
