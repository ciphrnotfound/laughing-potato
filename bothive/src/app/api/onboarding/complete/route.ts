import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { EmailService } from "@/lib/email";

// Initialize Supabase Admin for sensitive operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, firstName, lastName, teamName, role } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        // 1. Count existing developers to check promotion eligibility
        // We count only those who are developers and have completed onboarding
        const { count, error: countError } = await supabaseAdmin
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "developer")
            .eq("onboarding_completed", true);

        if (countError) {
            console.error("Count error:", countError);
        }

        const devCount = count || 0;
        const isEligibleForPromo = role === "developer" && devCount < 50;

        console.log(`[ONBOARDING] Dev Count: ${devCount}, Eligible: ${isEligibleForPromo}`);

        // 2. Perform Onboarding Update
        const { error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .upsert({
                user_id: userId,
                first_name: firstName,
                last_name: lastName,
                team_name: teamName,
                preferred_name: teamName || firstName,
                role: role,
                onboarding_completed: true,
                onboarding_completed_at: new Date().toISOString()
            }, { onConflict: "user_id" });

        if (profileError) {
            console.error("Profile update error:", profileError);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        // 4. Check for pending workspace invitations and create notifications
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (userData?.user?.email) {
            const userEmail = userData.user.email;

            // Find pending invitations for this email
            const { data: invitations } = await supabaseAdmin
                .from("workspace_invitations")
                .select("*, bot_workspaces(name, slug)")
                .eq("email", userEmail)
                .eq("status", "pending");

            if (invitations && invitations.length > 0) {
                console.log(`[ONBOARDING] Found ${invitations.length} pending invitations for ${userEmail}`);

                for (const invite of invitations) {
                    const workspace = invite.bot_workspaces as any;
                    if (!workspace) continue;

                    // Get inviter name
                    const { data: inviterProfile } = await supabaseAdmin
                        .from("user_profiles")
                        .select("first_name, last_name, team_name")
                        .eq("user_id", invite.invited_by)
                        .single();

                    const inviterName = inviterProfile
                        ? (inviterProfile.first_name ? `${inviterProfile.first_name} ${inviterProfile.last_name || ""}` : inviterProfile.team_name)
                        : "Someone";

                    const ws = (Array.isArray(invite.bot_workspaces) ? invite.bot_workspaces[0] : invite.bot_workspaces) as any;
                    if (!ws) continue;

                    const workspaceSlug = ws.slug || invite.workspace_id;
                    // Create notification for the invited user
                    await supabaseAdmin
                        .from("notifications")
                        .insert({
                            user_id: userId,
                            type: "workspace_invite",
                            title: "Team Invitation",
                            message: `${inviterName} invited you to join "${ws.name}"`,
                            metadata: {
                                workspace_id: invite.workspace_id,
                                workspace_name: ws.name,
                                workspace_slug: workspaceSlug,
                                invited_by: invite.invited_by,
                                inviter_name: inviterName
                            },
                            action_link: `/join/${workspaceSlug}`,
                            read: false
                        });
                }
            }

            // 5. Grant Promotion if eligible
            if (isEligibleForPromo) {
                const oneMonthFromNow = new Date();
                oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

                // Update user tier and expiration
                const { error: userError } = await supabaseAdmin
                    .from("users")
                    .update({
                        tier: "developer",
                        tier_expires_at: oneMonthFromNow.toISOString(),
                    })
                    .eq("id", userId);

                if (userError) {
                    console.error("User tier update error:", userError);
                } else {
                    await EmailService.sendEarlyBirdEmail(userEmail, firstName || "there");
                }
            }
        }

        return NextResponse.json({
            success: true,
            promoGranted: isEligibleForPromo,
            devCount: devCount + (isEligibleForPromo ? 1 : 0)
        });

    } catch (error: any) {
        console.error("Complete onboarding error:", error);
        return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 });
    }
}
