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

        // 3. Grant Promotion if eligible
        if (isEligibleForPromo) {
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

            // Update user tier and expiration
            const { error: userError } = await supabaseAdmin
                .from("users")
                .update({
                    tier: "developer", // Assuming "developer" tier is the one for Pro features as per migrations
                    tier_expires_at: oneMonthFromNow.toISOString(),
                })
                .eq("id", userId);

            if (userError) {
                console.error("User tier update error:", userError);
            } else {
                // 4. Send Promotion Email
                // Get user email
                const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
                if (userData?.user?.email) {
                    await EmailService.sendEarlyBirdEmail(userData.user.email, firstName || "there");
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
