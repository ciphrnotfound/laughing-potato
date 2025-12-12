import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// POST /api/bots/[botId]/run - Execute a bot (for external API access)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ botId: string }> }
) {
    try {
        const { botId } = await params;
        const body = await request.json();
        const { prompt, context } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: "prompt is required" },
                { status: 400 }
            );
        }

        // Check for API key in Authorization header
        const authHeader = request.headers.get("Authorization");
        const apiKey = authHeader?.replace("Bearer ", "");

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );

        // Fetch the bot
        const { data: bot, error: botError } = await supabase
            .from("bots")
            .select("*")
            .eq("id", botId)
            .single();

        if (botError || !bot) {
            return NextResponse.json(
                { error: "Bot not found" },
                { status: 404 }
            );
        }

        // If API key provided, validate it
        if (apiKey) {
            const { data: keyData } = await supabase
                .from("api_keys")
                .select("*")
                .eq("key", apiKey)
                .eq("user_id", bot.user_id)
                .single();

            if (!keyData) {
                return NextResponse.json(
                    { error: "Invalid API key" },
                    { status: 401 }
                );
            }
        } else {
            // Check if bot is public or user is authenticated
            const { data: { user } } = await supabase.auth.getUser();

            if (!bot.is_public && (!user || user.id !== bot.user_id)) {
                return NextResponse.json(
                    { error: "Authentication required. Provide API key or login." },
                    { status: 401 }
                );
            }
        }

        // Execute the bot using AI
        const systemPrompt = bot.system_prompt || "You are a helpful assistant.";

        // Call OpenAI/Grok API
        const aiResponse = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "grok-3-latest",
                messages: [
                    { role: "system", content: systemPrompt },
                    ...(context ? [{ role: "assistant", content: context }] : []),
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
            }),
        });

        if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error("AI API error:", errorText);
            return NextResponse.json(
                { error: "Failed to execute bot" },
                { status: 500 }
            );
        }

        const aiData = await aiResponse.json();
        const responseText = aiData.choices?.[0]?.message?.content || "";

        // Log execution
        await supabase.from("bot_executions").insert({
            bot_id: botId,
            input: prompt,
            output: responseText,
            source: apiKey ? "api" : "widget",
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            response: responseText,
            botId,
            model: "grok-3-latest",
        });

    } catch (error: any) {
        console.error("Error in POST /api/bots/[botId]/run:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    });
}
