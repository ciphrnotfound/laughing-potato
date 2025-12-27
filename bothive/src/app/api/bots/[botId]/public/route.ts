import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { aiClient, AI_MODEL } from "@/lib/ai-client";

// Initialize Supabase Admin for authoritative lookups
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ botId: string }> }
) {
    try {
        const { botId } = await params;
        const body = await req.json();
        const { message, context } = body;

        // 1. Fetch Bot Configuration (Using Admin to bypass RLS for public access)
        const { data: bot, error: botError } = await supabaseAdmin
            .from("bots")
            .select("*")
            .eq("id", botId)
            .single();

        if (botError || !bot) {
            return NextResponse.json({ error: "Bot not found or inactive" }, { status: 404 });
        }

        if (!bot.is_public) {
            return NextResponse.json({ error: "Access denied. Bot is not public." }, { status: 403 });
        }

        let responseText = "";
        let executionLogs: any[] = [];
        const isHivelang = !!(bot.hivelang_code || bot.source_code);

        if (isHivelang) {
            // 2. Hivelang Swarm Execution
            const { executeHiveLangProgram } = await import("@/lib/agents/hivelang-executor");
            const { allTools } = await import("@/lib/tools/all-tools");
            const { createSharedMemory } = await import("@/lib/sharedMemory");

            const executionId = crypto.randomUUID();
            const sharedMemory = createSharedMemory(executionId);

            const toolContext = {
                metadata: {
                    botId: bot.id,
                    runId: executionId,
                    userId: bot.user_id,
                    botSystemPrompt: bot.system_prompt,
                },
                sharedMemory,
            };

            const result = await executeHiveLangProgram(
                bot.hivelang_code || bot.source_code || '',
                { input: message, ...body }, // Pass whole body as context
                allTools,
                toolContext
            );

            responseText = result.output;
            executionLogs = result.transcript;

        } else {
            // 3. Standard AI Execution (Groq Cloud Fallback)
            const systemPrompt = bot.system_prompt || "You are a helpful assistant.";

            const response = await aiClient.chat.completions.create({
                model: bot.model || AI_MODEL,
                messages: [
                    { role: "system" as const, content: systemPrompt },
                    ...(context ? [{ role: "assistant" as const, content: context }] : []),
                    { role: "user" as const, content: message },
                ],
                temperature: 0.7,
            });

            responseText = response.choices[0]?.message?.content || "";
        }

        // 4. Log the interaction as a real execution
        await supabaseAdmin.from("bot_executions").insert({
            bot_id: botId,
            input_data: message,
            output_data: responseText,
            source: body.event_type ? "event" : "api", // Support proactive events
            status: "completed",
            created_at: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            bot: {
                name: bot.name,
                avatar_url: bot.avatar_url,
            },
            response: responseText,
            logs: executionLogs,
            timestamp: new Date().toISOString()
        });


    } catch (error: any) {
        console.error("Public Bot API Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ botId: string }> }
) {
    try {
        const { botId } = await params;

        // Fetch public-safe bot info
        const { data: bot, error: botError } = await supabaseAdmin
            .from("bots")
            .select("id, name, description, avatar_url")
            .eq("id", botId)
            .single();

        if (botError || !bot) {
            return NextResponse.json({ error: "Bot not found" }, { status: 404 });
        }

        return NextResponse.json({ bot });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Handle CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
