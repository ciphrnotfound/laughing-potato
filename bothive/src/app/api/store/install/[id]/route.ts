import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const botId = params.id;
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
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        // 1. Check if bot exists and get its metadata (price, etc.)
        const { data: bot, error: botError } = await supabase
            .from("bots")
            .select("*")
            .eq("id", botId)
            .single();

        if (botError || !bot) {
            return NextResponse.json({ error: "Bot not found" }, { status: 404 });
        }

        // 2. TODO: Handle payment if bot is paid
        // For now, we assume it's free or handled by the frontend before calling this
        const isPaid = bot.metadata?.pricing_model === "paid";
        const price = bot.metadata?.price || 0;

        // 3. Create installation record
        const { data: install, error: installError } = await supabase
            .from("user_bot_installs")
            .upsert({
                user_id: user.id,
                bot_id: botId,
                status: 'active',
                installed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (installError) {
            console.error("Installation Error:", installError);
            return NextResponse.json({ error: "Failed to install bot" }, { status: 500 });
        }

        // 4. Increment bot's install count
        await supabase
            .from("bots")
            .update({ install_count: (bot.install_count || 0) + 1 })
            .eq("id", botId);

        return NextResponse.json({
            success: true,
            install,
            message: `Successfully installed ${bot.name}`
        });

    } catch (error: any) {
        console.error("Store Install API Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
