import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/bots - List all bots (for dashboard)
export async function GET(request: NextRequest) {
    try {
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

        // Fetch user's bots
        const { data: bots, error } = await supabase
            .from("bots")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching bots:", error);
            return NextResponse.json(
                { error: "Failed to fetch bots" },
                { status: 500 }
            );
        }

        return NextResponse.json({ bots: bots || [] });

    } catch (error: any) {
        console.error("Error in GET /api/bots:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// POST /api/bots - Create a new bot
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, code, system_prompt, is_public } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Bot name is required" },
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

        // Create bot
        const { data: bot, error } = await supabase
            .from("bots")
            .insert({
                name,
                description: description || "",
                code: code || "",
                system_prompt: system_prompt || "You are a helpful assistant.",
                is_public: is_public || false,
                user_id: user.id,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating bot:", error);
            return NextResponse.json(
                { error: "Failed to create bot" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            bot,
            botId: bot.id
        });

    } catch (error: any) {
        console.error("Error in POST /api/bots:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
