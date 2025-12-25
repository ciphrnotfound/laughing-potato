import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { EmailService } from "@/lib/email";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: workspaceId } = await params;
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

        const { email, role = "member" } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Get workspace info
        const { data: workspace, error: wsError } = await supabaseAdmin
            .from("bot_workspaces")
            .select("id, owner_id, name, slug")
            .eq("id", workspaceId)
            .single();

        if (wsError || !workspace) {
            return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
        }

        // Check if user has permission to invite (owner check)
        if (workspace.owner_id !== user.id) {
            // Check if admin
            const { data: membership } = await supabaseAdmin
                .from("workspace_members")
                .select("role")
                .eq("workspace_id", workspaceId)
                .eq("user_id", user.id)
                .single();

            if (membership?.role !== "admin") {
                return NextResponse.json({ error: "Permission denied" }, { status: 403 });
            }
        }

        // Get inviter's name
        const inviterName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Someone";

        // Check if invitee exists in the system
        const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = usersData?.users?.find(u => u.email === email);

        // Create invite link
        const inviteLink = `https://bothive.cloud/join/${workspace.slug}?invite=true&email=${encodeURIComponent(email)}`;

        if (existingUser) {
            // User exists - check if already a member
            const { data: existingMember } = await supabaseAdmin
                .from("workspace_members")
                .select("id, status")
                .eq("workspace_id", workspaceId)
                .eq("user_id", existingUser.id)
                .single();

            if (existingMember) {
                return NextResponse.json({
                    error: existingMember.status === "pending"
                        ? "Invitation already sent"
                        : "User is already a member"
                }, { status: 400 });
            }

            // Add as pending member
            await supabaseAdmin
                .from("workspace_members")
                .insert({
                    workspace_id: workspaceId,
                    user_id: existingUser.id,
                    role: role,
                    status: "pending"
                });

            // Create notification for the invited user
            await supabaseAdmin
                .from("notifications")
                .insert({
                    user_id: existingUser.id,
                    type: "workspace_invite",
                    title: "Team Invitation",
                    message: `${inviterName} invited you to join "${workspace.name}"`,
                    metadata: {
                        workspace_id: workspaceId,
                        workspace_name: workspace.name,
                        workspace_slug: workspace.slug,
                        invited_by: user.id,
                        inviter_name: inviterName
                    },
                    action_url: `/join/${workspace.slug}`,
                    read: false
                });

            console.log(`[INVITE] Notification sent to existing user: ${email}`);

        } else {
            // User doesn't exist - store invitation and send email
            await supabaseAdmin
                .from("workspace_invitations")
                .insert({
                    workspace_id: workspaceId,
                    email: email,
                    invited_by: user.id,
                    role: role,
                    status: "pending",
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                });

            // Send email invitation
            await EmailService.sendWorkspaceInviteEmail(
                email,
                workspace.name,
                inviterName,
                inviteLink
            );

            console.log(`[INVITE] Email sent to non-registered user: ${email}`);
        }

        // Create notification for the inviter (confirmation)
        await supabaseAdmin
            .from("notifications")
            .insert({
                user_id: user.id,
                type: "invite_sent",
                title: "Invitation Sent",
                message: `Invitation sent to ${email} for "${workspace.name}"`,
                metadata: {
                    workspace_id: workspaceId,
                    invited_email: email,
                    is_registered_user: !!existingUser
                },
                read: false
            });

        return NextResponse.json({
            success: true,
            message: existingUser
                ? `${email} has been notified of the invitation.`
                : `Invitation email sent to ${email}.`,
            isRegisteredUser: !!existingUser
        });

    } catch (error: any) {
        console.error("Invite error:", error);
        return NextResponse.json({ error: error.message || "Failed to send invitation" }, { status: 500 });
    }
}
