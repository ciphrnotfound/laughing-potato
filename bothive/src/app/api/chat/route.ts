import { NextRequest, NextResponse } from "next/server";
import { aiClient, AI_MODEL, FALLBACK_MODELS } from "@/lib/ai-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TIER_CONFIG, SubscriptionTier } from "@/lib/subscription-tiers";
import { executeHiveLangProgram } from "@/lib/agents/hivelang-executor";
import { allTools as ALL_TOOLS } from "@/lib/tools";
import { ToolContext } from "@/lib/agentTypes";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatRequest {
    message: string;
    systemPrompt?: string;
    botName?: string;
    botId?: string;
    hivelangCode?: string;
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
    temperature?: number;
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                    set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
                    remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();

        const body = (await request.json()) as ChatRequest;
        const { message, systemPrompt, botName, botId, hivelangCode, conversationHistory = [], temperature = 0.8 } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Apply usage limits if user is logged in
        if (user) {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const ADMIN_EMAIL = "akinlorinjeremiah@gmail.com";
            if (user.email !== ADMIN_EMAIL) {
                const { data: userData } = await supabase
                    .from("users")
                    .select("tier")
                    .eq("id", user.id)
                    .single();

                const tier: SubscriptionTier = userData?.tier || 'free';
                const limit = TIER_CONFIG[tier].aiMessagesPerMonth;

                if (limit !== -1) {
                    const { data: usageData } = await supabase
                        .from("usage_tracking")
                        .select("ai_messages_used")
                        .eq("user_id", user.id)
                        .eq("month_year", currentMonth)
                        .single();

                    const used = usageData?.ai_messages_used || 0;
                    if (used >= limit) {
                        return NextResponse.json({
                            error: "Usage limit reached",
                            upgradeRequired: true,
                            tier,
                            limit,
                            used
                        }, { status: 429 });
                    }
                }
            }
        }

        // 1. HIVELANG EXECUTION (If code is present)
        if (hivelangCode && hivelangCode.trim().length > 0) {
            console.log("Chat: Executing HiveLang Code...");

            // Create context
            const toolContext: ToolContext = {
                metadata: {
                    botId: botId || "ephemeral-chat-bot",
                    runId: "chat-" + Date.now(),
                    userId: user?.id,
                    botSystemPrompt: systemPrompt,
                    botName: botName
                },
                sharedMemory: {
                    get: async () => undefined,
                    set: async () => { },
                    append: async () => { },
                }
            };

            // Execute
            const result = await executeHiveLangProgram(
                hivelangCode,
                // Pass input object so 'input.task' works, but ensure 'input' can be coerced to string 
                // in 'evaluate' if user checks 'input contains'
                { input: message, task: "chat" },
                ALL_TOOLS,
                toolContext
            );

            console.log("HiveLang Input:", JSON.stringify({ input: message, task: "chat" }));
            console.log("HiveLang Result:", JSON.stringify({ success: result.success, output: result.output, error: result.error }));

            // If success and has output, return it
            if (result.success && result.output) {
                return NextResponse.json({
                    response: result.output,
                    model: "HiveLang v2 (Agentic)",
                    agentic: true,
                    steps: result.steps // Optional: return steps if UI supports it
                });
            }

            // If execution FAILED (e.g. tool error, missing credentials), report it!
            if (!result.success) {
                console.warn("HiveLang execution failed:", result.error);
                return NextResponse.json({
                    response: `⚠️ **Agent Execution Failed**\n\nI tried to run your Hivelang code, but encountered an error:\n> ${result.error}\n\n*Check your API credentials in the Configure Panel.*`,
                    model: "HiveLang v2 (Error)",
                    agentic: true
                });
            }
        }

        // 2. LLM FALLBACK (OpenAI/Groq)
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
        if (systemPrompt) {
            messages.push({ role: "system", content: systemPrompt });
        } else {
            messages.push({ role: "system", content: `You are ${botName || "an AI assistant"}. Be helpful, creative, and engaging.` });
        }
        for (const msg of conversationHistory) {
            messages.push({ role: msg.role, content: msg.content });
        }
        messages.push({ role: "user", content: message });

        const models = [AI_MODEL, ...FALLBACK_MODELS];
        let lastError: Error | null = null;
        let successfulResponse: any = null;

        for (const model of models) {
            try {
                const response = await aiClient.chat.completions.create({
                    model,
                    messages,
                    temperature,
                    max_tokens: 1024,
                });
                const content = response.choices[0]?.message?.content?.trim();
                if (content) {
                    successfulResponse = { response: content, model, usage: response.usage };
                    break;
                }
            } catch (error) {
                console.warn(`Model ${model} failed:`, error);
                lastError = error instanceof Error ? error : new Error(String(error));
            }
        }

        if (successfulResponse) {
            if (user) {
                const currentMonth = new Date().toISOString().slice(0, 7);
                await supabase.from("usage_tracking").upsert({
                    user_id: user.id,
                    month_year: currentMonth,
                }).select().then(async () => {
                    await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
                });
            }
            return NextResponse.json(successfulResponse);
        }

        throw lastError || new Error("All AI models failed to respond");

    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}
