import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// POST /api/bots/[botId]/execute - Execute a bot (internal use)
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

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

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

        // Check access - must be owner or bot must be public
        if (!bot.is_public && bot.user_id !== user.id) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
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
            user_id: user.id,
            input: prompt,
            output: responseText,
            source: "dashboard",
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({
            success: true,
            response: responseText,
            botId,
            model: "grok-3-latest",
        });

    } catch (error: any) {
        console.error("Error in POST /api/bots/[botId]/execute:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
