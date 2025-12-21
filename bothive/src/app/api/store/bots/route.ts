import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        let query = supabase
            .from("bots")
            .select(`
                *,
                user:user_id (
                    full_name,
                    avatar_url
                )
            `)
            .eq("is_public", true);

        if (category && category !== "all") {
            query = query.eq("category", category);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }

        const { data: bots, error } = await query.order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching marketplace bots:", error);
            return NextResponse.json({ error: "Failed to fetch bots" }, { status: 500 });
        }

        // Map to expected interface
        const mappedBots = bots?.map(bot => ({
            id: bot.id,
            name: bot.name,
            description: bot.description,
            icon_url: bot.icon_url,
            category: bot.category,
            install_count: bot.install_count || 0,
            rating: bot.rating || 4.5, // Default for now
            creator_name: bot.user?.full_name || "Unknown Creator",
            type: "bot",
            price: bot.metadata?.price || 0,
            isFree: (bot.metadata?.pricing_model === "free" || !bot.metadata?.price),
            isInstalled: false // This will be checked on client if needed
        })) || [];

        return NextResponse.json({ bots: mappedBots });

    } catch (error: any) {
        console.error("Marketplace API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
