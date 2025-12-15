import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/agents - List user's agents
 */
export async function GET(req: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: agents, error } = await supabase
      .from("agents")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ agents });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents - Create a new agent
 */
export async function POST(req: NextRequest) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, model, system_prompt, capabilities, is_public, source_bot_id } = body;

    // Verify Payment for Paid Bots
    if (source_bot_id) {
      // Check if bot is paid
      const { data: botData } = await supabase
        .from('bots')
        .select('price')
        .eq('id', source_bot_id)
        .single();

      if (botData && botData.price > 0) {
        // Check for valid purchase
        const { data: purchase } = await supabase
          .from('bot_purchases')
          .select('id')
          .eq('user_id', session.user.id)
          .eq('bot_id', source_bot_id)
          .eq('status', 'completed')
          .maybeSingle();

        if (!purchase) {
          return NextResponse.json(
            { error: "Payment required. Please purchase this bot from the store." },
            { status: 402 } // Payment Required
          );
        }
      }
    }

    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    const { data: agent, error } = await supabase
      .from("agents")
      .insert({
        user_id: session.user.id,
        name,
        description,
        model: model || "gpt-4-turbo",
        system_prompt,
        capabilities: capabilities || [],
        is_public: is_public || false,
        source_bot_id: source_bot_id || null
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Award XP for creating agent
    await awardCreationXP(session.user.id);

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error: any) {
    console.error("Agent creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

async function awardCreationXP(user_id: string) {
  try {
    const { data: profile } = await supabase
      .from("user_gamification")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (profile) {
      await supabase
        .from("user_gamification")
        .update({
          xp: profile.xp + 50,
          total_xp: profile.total_xp + 50,
          bots_created: profile.bots_created + 1,
          last_activity_date: new Date().toISOString().split("T")[0],
        })
        .eq("user_id", user_id);
    } else {
      await supabase.from("user_gamification").insert({
        user_id,
        xp: 50,
        total_xp: 50,
        bots_created: 1,
        level: 1,
      });
    }

    // Check for first bot achievement
    await supabase.rpc("check_and_unlock_achievement", {
      p_user_id: user_id,
      p_achievement_slug: "first-bot-created",
    });
  } catch (error) {
    console.error("Failed to award XP:", error);
  }
}
