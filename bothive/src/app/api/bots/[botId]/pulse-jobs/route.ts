import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function createSupabaseClient() {
    const cookieStore = await cookies();
    return createServerClient(
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
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ botId: string }> }
) {
    try {
        const { botId } = await params;
        const supabase = await createSupabaseClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { data: bot, error: botError } = await supabase
            .from("bots")
            .select("id, user_id")
            .eq("id", botId)
            .eq("user_id", user.id)
            .single();

        if (botError || !bot) {
            return NextResponse.json(
                { error: "Bot not found or access denied" },
                { status: 404 }
            );
        }

        const { data: jobs, error: jobsError } = await supabase
            .from("pulse_jobs")
            .select("*")
            .eq("bot_id", botId)
            .order("created_at", { ascending: false });

        if (jobsError) {
            return NextResponse.json(
                { error: "Failed to load schedules" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            jobs: jobs ?? [],
        });
    } catch (error: any) {
        console.error("Error in GET /api/bots/[botId]/pulse-jobs:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ botId: string }> }
) {
    try {
        const { botId } = await params;
        const supabase = await createSupabaseClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { data: bot, error: botError } = await supabase
            .from("bots")
            .select("id, user_id")
            .eq("id", botId)
            .eq("user_id", user.id)
            .single();

        if (botError || !bot) {
            return NextResponse.json(
                { error: "Bot not found or access denied" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const triggerType = (body.trigger_type || "schedule") as "schedule" | "event" | "webhook";
        const intervalMinutes = body.interval_minutes as number | undefined;
        const isActive = typeof body.is_active === "boolean" ? body.is_active : true;

        if (triggerType === "schedule" && (!intervalMinutes || intervalMinutes <= 0)) {
            return NextResponse.json(
                { error: "interval_minutes must be a positive number for schedule triggers" },
                { status: 400 }
            );
        }

        let triggerConfig: any = body.trigger_config || {};
        let nextRun: string | null = null;

        if (triggerType === "schedule" && intervalMinutes && intervalMinutes > 0) {
            const intervalSeconds = intervalMinutes * 60;
            triggerConfig = {
                ...triggerConfig,
                interval_seconds: intervalSeconds,
                intervalMinutes: intervalMinutes,
            };

            const base = new Date();
            nextRun = new Date(base.getTime() + intervalSeconds * 1000).toISOString();
        }

        const { data: job, error: insertError } = await supabase
            .from("pulse_jobs")
            .insert({
                bot_id: botId,
                trigger_type: triggerType,
                trigger_config: triggerConfig,
                is_active: isActive,
                next_run: nextRun,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (insertError || !job) {
            return NextResponse.json(
                { error: "Failed to create schedule" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            job,
        });
    } catch (error: any) {
        console.error("Error in POST /api/bots/[botId]/pulse-jobs:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

