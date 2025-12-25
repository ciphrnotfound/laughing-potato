import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase Admin
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        // 1. Get total users
        const { count: totalUsers, error: usersError } = await supabaseAdmin
            .from("users")
            .select("*", { count: "exact", head: true });

        // 2. Get total developers (from profiles)
        const { count: totalDevelopers, error: devsError } = await supabaseAdmin
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
            .eq("role", "developer")
            .eq("onboarding_completed", true);

        // 3. Get total bots
        const { count: totalBots, error: botsError } = await supabaseAdmin
            .from("bots")
            .select("*", { count: "exact", head: true });

        // 4. Get total revenue (sum of amounts in user_integration_purchases)
        const { data: revenueData, error: revenueError } = await supabaseAdmin
            .from("user_integration_purchases")
            .select("amount_paid");

        const totalRevenue = (revenueData || []).reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);

        // 5. Get active users (users with activity in last 30 days)
        // This is a rough estimation based on updated_at or sessions if we had them.
        // For now, let's use a mock or simpler metric.
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: activeUsers } = await supabaseAdmin
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
            .gt("updated_at", thirtyDaysAgo.toISOString());

        if (usersError || devsError || botsError || revenueError) {
            console.error("Stats fetching error:", { usersError, devsError, botsError, revenueError });
        }

        return NextResponse.json({
            stats: {
                totalUsers: totalUsers || 0,
                totalDevelopers: totalDevelopers || 0,
                totalBots: totalBots || 0,
                totalRevenue: totalRevenue / 100, // Convert from kobo to Naira
                activeUsers: activeUsers || 0,
                pendingApprovals: 0 // Placeholder
            }
        });

    } catch (error: any) {
        console.error("Admin stats error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
