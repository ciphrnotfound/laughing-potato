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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ botId: string; jobId: string }> }
) {
    try {
        const { botId, jobId } = await params;
        const supabase = await createSupabaseClient();

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        const { data: job, error: jobError } = await supabase
            .from("pulse_jobs")
            .select("*")
            .eq("id", jobId)
            .eq("bot_id", botId)
            .single();

        if (jobError || !job) {
            return NextResponse.json(
                { error: "Schedule not found" },
                { status: 404 }
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
        const updates: any = {};

        if (typeof body.is_active === "boolean") {
            updates.is_active = body.is_active;

            if (body.is_active) {
                const cfg = job.trigger_config || {};
                let intervalSeconds = 60;

                if (typeof cfg.interval_seconds === "number") {
                    intervalSeconds = cfg.interval_seconds;
                } else if (typeof cfg.intervalMinutes === "number") {
                    intervalSeconds = cfg.intervalMinutes * 60;
                }

                const base = new Date();
                updates.next_run = new Date(base.getTime() + intervalSeconds * 1000).toISOString();
            } else {
                updates.next_run = null;
            }
        }

        updates.updated_at = new Date().toISOString();

        const { data: updatedJob, error: updateError } = await supabase
            .from("pulse_jobs")
            .update(updates)
            .eq("id", jobId)
            .eq("bot_id", botId)
            .select()
            .single();

        if (updateError || !updatedJob) {
            return NextResponse.json(
                { error: "Failed to update schedule" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            job: updatedJob,
        });
    } catch (error: any) {
        console.error("Error in PATCH /api/bots/[botId]/pulse-jobs/[jobId]:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ botId: string; jobId: string }> }
) {
    try {
        const { botId, jobId } = await params;
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

        const { error: deleteError } = await supabase
            .from("pulse_jobs")
            .delete()
            .eq("id", jobId)
            .eq("bot_id", botId);

        if (deleteError) {
            return NextResponse.json(
                { error: "Failed to delete schedule" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error: any) {
        console.error("Error in DELETE /api/bots/[botId]/pulse-jobs/[jobId]:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

