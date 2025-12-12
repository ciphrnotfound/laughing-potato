import { NextRequest, NextResponse } from "next/server";
import { aiClient, AI_MODEL, FALLBACK_MODELS } from "@/lib/ai-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TIER_CONFIG, SubscriptionTier } from "@/lib/subscription-tiers";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatRequest {
    message: string;
    systemPrompt?: string;
    botName?: string;
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

        // Get current user (optional for public bots, but required for usage tracking)
        const { data: { user } } = await supabase.auth.getUser();

        const body = (await request.json()) as ChatRequest;
        const { message, systemPrompt, botName, conversationHistory = [], temperature = 0.8 } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Apply usage limits if user is logged in
        if (user) {
            const currentMonth = new Date().toISOString().slice(0, 7);

            // Admin Override
            const ADMIN_EMAIL = "akinlorinjeremiah@gmail.com";
            if (user.email === ADMIN_EMAIL) {
                // Admin has unlimited access, skip checks
            } else {
                // Get tier
                const { data: userData } = await supabase
                    .from("users")
                    .select("tier")
                    .eq("id", user.id)
                    .single();

                const tier: SubscriptionTier = userData?.tier || 'free';
                const limit = TIER_CONFIG[tier].aiMessagesPerMonth;

                // Check usage
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

        // Build the messages array
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

        // Add system prompt
        if (systemPrompt) {
            messages.push({
                role: "system",
                content: systemPrompt,
            });
        } else {
            messages.push({
                role: "system",
                content: `You are ${botName || "an AI assistant"}. Be helpful, creative, and engaging.`,
            });
        }

        // Add conversation history
        for (const msg of conversationHistory) {
            messages.push({
                role: msg.role,
                content: msg.content,
            });
        }

        // Add the current user message
        messages.push({
            role: "user",
            content: message,
        });

        // Try models with fallback
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
                    successfulResponse = {
                        response: content,
                        model,
                        usage: response.usage,
                    };
                    break;
                }
            } catch (error) {
                console.warn(`Model ${model} failed:`, error);
                lastError = error instanceof Error ? error : new Error(String(error));
                // Continue to next model
            }
        }

        if (successfulResponse) {
            // Track usage asynchronously if user is logged in
            if (user) {
                const currentMonth = new Date().toISOString().slice(0, 7);
                await supabase.from("usage_tracking").upsert({
                    user_id: user.id,
                    month_year: currentMonth,
                    // We use a raw SQL query typically for increment, but upsert with existing value logic in client is tricky
                    // Simplest is to call the RPC we defined in migration
                }).select().then(async () => {
                    // Call RPC to increment safely
                    await supabase.rpc('increment_ai_usage', { p_user_id: user.id });
                });
            }

            return NextResponse.json(successfulResponse);
        }

        // All models failed
        throw lastError || new Error("All AI models failed to respond");

    } catch (error) {
        console.error("Chat API error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
