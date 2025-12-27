import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase Admin for authoritative actions
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
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
            return NextResponse.json({ error: "Please sign in to accept the invitation" }, { status: 401 });
        }

        // Find workspace by slug or ID
        let workspace;

        const { data: bySlug } = await supabaseAdmin
            .from("bot_workspaces")
            .select("id, name, slug")
            .eq("slug", id)
            .single();

        if (bySlug) {
            workspace = bySlug;
        } else {
            const { data: byId } = await supabaseAdmin
                .from("bot_workspaces")
                .select("id, name, slug")
                .eq("id", id)
                .single();
            workspace = byId;
        }

        if (!workspace) {
            return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
        }

        // Check if user already has membership
        const { data: existingMember } = await supabaseAdmin
            .from("workspace_members")
            .select("id, status")
            .eq("workspace_id", workspace.id)
            .eq("user_id", user.id)
            .single();

        if (existingMember) {
            if (existingMember.status === "active") {
                return NextResponse.json({ error: "You are already a member of this workspace" }, { status: 400 });
            }

            // Update pending membership to active
            await supabaseAdmin
                .from("workspace_members")
                .update({ status: "active", joined_at: new Date().toISOString() })
                .eq("id", existingMember.id);
        } else {
            // Check for email-based invitation
            const { data: emailInvite } = await supabaseAdmin
                .from("workspace_invitations")
                .select("id, role")
                .eq("workspace_id", workspace.id)
                .eq("email", user.email)
                .eq("status", "pending")
                .single();

            const role = emailInvite?.role || "member";

            // Create new membership
            await supabaseAdmin
                .from("workspace_members")
                .insert({
                    workspace_id: workspace.id,
                    user_id: user.id,
                    role: role,
                    status: "active"
                });

            // Mark email invitation as accepted
            if (emailInvite) {
                await supabaseAdmin
                    .from("workspace_invitations")
                    .update({ status: "accepted" })
                    .eq("id", emailInvite.id);
            }
        }

        // Create notification for the new member
        await supabaseAdmin
            .from("notifications")
            .insert({
                user_id: user.id,
                type: "workspace_joined",
                title: "Workspace Joined",
                message: `You are now a member of "${workspace.name}"`,
                metadata: { workspace_id: workspace.id, workspace_name: workspace.name },
                read: false
            });

        return NextResponse.json({
            success: true,
            message: `Welcome to ${workspace.name}!`,
            workspace
        });

    } catch (error: any) {
        console.error("Accept invitation error:", error);
        return NextResponse.json({ error: error.message || "Failed to join workspace" }, { status: 500 });
    }
}
