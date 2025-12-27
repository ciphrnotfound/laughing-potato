import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      botId,
      scheduleType = "interval",
      intervalMinutes = 60,
      nextRunAt,
      input = {},
      enabled = true,
      timezone = "UTC",
    } = body || {};

    if (!botId) {
      return NextResponse.json({ error: "botId is required" }, { status: 400 });
    }

    // Ensure bot belongs to user
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("id, user_id")
      .eq("id", botId)
      .single();

    if (botError || !bot) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 });
    }
    if (bot.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("bot_schedules")
      .insert({
        user_id: user.id,
        bot_id: botId,
        enabled,
        schedule_type: scheduleType,
        interval_minutes: scheduleType === "interval" ? intervalMinutes : null,
        timezone,
        next_run_at: nextRunAt || new Date().toISOString(),
        input,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Create schedule error:", error);
      return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
    }

    return NextResponse.json({ success: true, schedule: data });
  } catch (e: any) {
    console.error("Create schedule error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
