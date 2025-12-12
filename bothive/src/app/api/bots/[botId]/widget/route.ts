import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/bots/[botId]/widget - Get widget configuration
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

        // Fetch the bot
        const { data: bot, error } = await supabase
            .from("bots")
            .select("id, name, description, avatar_url, is_public, welcome_message")
            .eq("id", botId)
            .single();

        if (error || !bot) {
            return NextResponse.json(
                { error: "Bot not found" },
                { status: 404 }
            );
        }

        if (!bot.is_public) {
            return NextResponse.json(
                { error: "Bot is not public" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            id: bot.id,
            name: bot.name,
            description: bot.description,
            avatarUrl: bot.avatar_url,
            welcomeMessage: bot.welcome_message || `Hi! I'm ${bot.name}. How can I help you today?`,
            theme: {
                primaryColor: "#8B5CF6",
                backgroundColor: "#0A0A0A",
                textColor: "#FFFFFF",
            },
        }, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=60",
            },
        });

    } catch (error: any) {
        console.error("Error in GET /api/bots/[botId]/widget:", error);
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
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
