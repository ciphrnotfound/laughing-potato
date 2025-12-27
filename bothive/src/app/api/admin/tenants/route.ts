import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseServiceKey) {
            return NextResponse.json({ error: "Service role key missing" }, { status: 500 });
        }

        // Use Service Role Key to bypass RLS and access Auth admin
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            }
        });

        // 1. Fetch Users from Supabase Auth
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

        if (authError) throw authError;

        // 2. Fetch Profiles, Bots, and Runs to aggregate
        const [
            { data: profiles },
            { data: bots },
            { data: runs }
        ] = await Promise.all([
            supabaseAdmin.from('user_profiles').select('*'),
            supabaseAdmin.from('bots').select('user_id'),
            supabaseAdmin.from('workforce_runs').select('user_id')
        ]);

        // 3. Map and Aggregate Data
        const tenants = users.map(user => {
            const profile = profiles?.find(p => p.user_id === user.id);
            const userBots = bots?.filter(b => b.user_id === user.id) || [];
            const userRuns = runs?.filter(r => r.user_id === user.id) || [];

            // Determine Plan (from profile or metadata)
            const plan = (user.user_metadata?.plan || profile?.role || "free").toLowerCase();

            return {
                id: user.id,
                name: profile?.team_name || user.user_metadata?.full_name || "New User",
                slug: user.id.slice(0, 8),
                plan: plan.includes("enterprise") ? "enterprise" : plan.includes("pro") ? "pro" : "free",
                status: user.banned_until ? "suspended" : user.email_confirmed_at ? "active" : "pending",
                owner_email: user.email,
                member_count: 1, // Defaulting to 1 for now if no team/workspace logic is used
                bots_count: userBots.length,
                total_executions: userRuns.length,
                created_at: user.created_at,
                last_active_at: user.last_sign_in_at || user.created_at
            };
        });

        return NextResponse.json({ tenants });

    } catch (error: any) {
        console.error("Admin Tenants API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
