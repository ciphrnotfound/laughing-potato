import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/bots/[botId]/analytics - Get bot analytics
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ botId: string }> }
) {
    try {
        const { botId } = await params;

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

        // Verify bot ownership
        const { data: bot, error: botError } = await supabase
            .from("bots")
            .select("id, user_id")
            .eq("id", botId)
            .single();

        if (botError || !bot || bot.user_id !== user.id) {
            return NextResponse.json(
                { error: "Bot not found or access denied" },
                { status: 404 }
            );
        }

        // Get execution stats
        const { data: executions, error: execError } = await supabase
            .from("bot_executions")
            .select("id, created_at, source")
            .eq("bot_id", botId)
            .order("created_at", { ascending: false })
            .limit(100);

        const totalExecutions = executions?.length || 0;
        const apiCalls = executions?.filter(e => e.source === "api").length || 0;
        const widgetCalls = executions?.filter(e => e.source === "widget").length || 0;

        return NextResponse.json({
            botId,
            totalExecutions,
            apiCalls,
            widgetCalls,
            recentExecutions: executions || [],
        });

    } catch (error: any) {
        console.error("Error in GET /api/bots/[botId]/analytics:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
