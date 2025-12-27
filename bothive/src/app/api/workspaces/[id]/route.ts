import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase Admin for authoritative lookups
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch workspace details using Admin to bypass RLS
        const { data: workspace, error: wsError } = await supabaseAdmin
            .from("bot_workspaces")
            .select("*")
            .eq("id", id)
            .single();

        if (wsError || !workspace) {
            return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
        }

        // Verify the requesting user is a member
        const { data: membership, error: memError } = await supabaseAdmin
            .from("workspace_members")
            .select("role")
            .eq("workspace_id", id)
            .eq("user_id", user.id)
            .eq("status", "active")
            .single();

        if (memError || !membership) {
            return NextResponse.json({ error: "You do not have access to this workspace" }, { status: 403 });
        }

        // Fetch all members for this workspace
        // We use supabaseAdmin to get ALL members, including those who might be hidden by RLS
        const { data: rawMembers, error: membersError } = await supabaseAdmin
            .from("workspace_members")
            .select(`
                id,
                user_id,
                role,
                status,
                joined_at,
                users!inner (
                    id,
                    email,
                    first_name,
                    last_name,
                    avatar_url
                )
            `)
            .eq("workspace_id", id);

        // Map the results to the structure expected by the frontend
        const members = rawMembers?.map((m: any) => ({
            ...m,
            user: {
                id: m.users.id,
                email: m.users.email,
                user_metadata: {
                    name: `${m.users.first_name || ""} ${m.users.last_name || ""}`.trim(),
                    avatar_url: m.users.avatar_url
                }
            }
        })) || [];

        return NextResponse.json({
            workspace,
            members,
            userRole: membership.role
        });

    } catch (error: any) {
        console.error("Workspace details fetch error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch workspace details" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Only owner can delete
        const { data: workspace } = await supabaseAdmin
            .from("bot_workspaces")
            .select("owner_id")
            .eq("id", id)
            .single();

        if (!workspace || workspace.owner_id !== user.id) {
            return NextResponse.json({ error: "Only the owner can delete this workspace" }, { status: 403 });
        }

        const { error: deleteError } = await supabaseAdmin
            .from("bot_workspaces")
            .delete()
            .eq("id", id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "Workspace deleted" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete workspace" }, { status: 500 });
    }
}
