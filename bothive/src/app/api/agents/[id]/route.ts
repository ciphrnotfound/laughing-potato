import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

/**
 * GET /api/agents/[id] - Get agent by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: agent, error } = await supabase
            .from("agents")
            .select("*")
            .eq("id", id)
            .eq("user_id", session.user.id)
            .single();

        if (error || !agent) {
            return NextResponse.json(
                { error: "Agent not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ agent });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/agents/[id] - Update agent
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, model, system_prompt, capabilities, is_public } = body;

        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (model !== undefined) updates.model = model;
        if (system_prompt !== undefined) updates.system_prompt = system_prompt;
        if (capabilities !== undefined) updates.capabilities = capabilities;
        if (is_public !== undefined) updates.is_public = is_public;

        const { data: agent, error } = await supabase
            .from("agents")
            .update(updates)
            .eq("id", id)
            .eq("user_id", session.user.id)
            .select()
            .single();

        if (error || !agent) {
            return NextResponse.json(
                { error: error?.message || "Agent not found" },
                { status: error ? 500 : 404 }
            );
        }

        return NextResponse.json({ agent });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/agents/[id] - Delete agent
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { error } = await supabase
            .from("agents")
            .delete()
            .eq("id", id)
            .eq("user_id", session.user.id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
