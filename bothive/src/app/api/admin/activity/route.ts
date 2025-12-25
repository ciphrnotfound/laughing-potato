import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase Admin
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
        // 1. Get recent notifications (Purchases, System Alerts)
        const { data: notifications, error: notifError } = await supabaseAdmin
            .from("notifications")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);

        // 2. Get recent user signups
        const { data: recentUsers, error: usersError } = await supabaseAdmin
            .from("user_profiles")
            .select("full_name, created_at, role")
            .order("created_at", { ascending: false })
            .limit(5);

        if (notifError || usersError) {
            console.error("Activity fetching error:", { notifError, usersError });
        }

        // 3. Normalize and merge data
        const activityFeed = [
            ...(notifications || []).map((n: any) => ({
                id: n.id,
                type: n.type === 'success' ? 'purchase' : 'alert',
                user: 'System', // or fetch user name if user_id exists
                action: n.message,
                time: n.created_at,
                meta: { title: n.title }
            })),
            ...(recentUsers || []).map((u: any) => ({
                id: `user-${u.created_at}`,
                type: 'signup',
                user: u.full_name || 'New User',
                action: `Joined as ${u.role}`,
                time: u.created_at,
                meta: {}
            }))
        ];

        // Sort by time descending
        activityFeed.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

        return NextResponse.json({
            activity: activityFeed.slice(0, 10) // Return top 10 combined
        });

    } catch (error: any) {
        console.error("Admin activity error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
