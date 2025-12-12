import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TIER_CONFIG, SubscriptionTier } from "@/lib/subscription-tiers";

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                    set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
                    remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
                },
            }
        );

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Admin Override helpers
        const ADMIN_EMAIL = "akinlorinjeremiah@gmail.com";
        const currentMonthKey = new Date().toISOString().slice(0, 7);

        if (user.email === ADMIN_EMAIL) {
            return NextResponse.json({
                tier: "business",
                tierExpires: null,
                limits: TIER_CONFIG.business,
                usage: { aiMessagesUsed: 0, botsCreated: 0, integrationsUsed: 0 },
                remaining: { aiMessages: -1, bots: -1 },
                canUseAI: true,
                currentMonth: currentMonthKey,
                isAdmin: true
            });
        }

        // Get user's tier
        const { data: userData } = await supabase
            .from("users")
            .select("tier, tier_expires_at")
            .eq("id", user.id)
            .single();

        const tier: SubscriptionTier = userData?.tier || "free";
        const tierLimits = TIER_CONFIG[tier];

        // Get current month's usage
        const { data: usageData } = await supabase
            .from("usage_tracking")
            .select("ai_messages_used, bots_created, integrations_used")
            .eq("user_id", user.id)
            .eq("month_year", currentMonthKey)
            .single();

        const usage = {
            aiMessagesUsed: usageData?.ai_messages_used || 0,
            botsCreated: usageData?.bots_created || 0,
            integrationsUsed: usageData?.integrations_used || 0,
        };

        // Calculate remaining
        const remaining = {
            aiMessages: tierLimits.aiMessagesPerMonth === -1
                ? -1 // unlimited
                : Math.max(0, tierLimits.aiMessagesPerMonth - usage.aiMessagesUsed),
            bots: tierLimits.botsAllowed === -1
                ? -1
                : Math.max(0, tierLimits.botsAllowed - usage.botsCreated),
        };

        // Check if can use AI
        const canUseAI = tierLimits.aiMessagesPerMonth === -1 || remaining.aiMessages > 0;

        return NextResponse.json({
            tier,
            tierExpires: userData?.tier_expires_at,
            limits: tierLimits,
            usage,
            remaining,
            canUseAI,
            currentMonth: currentMonthKey,
        });

    } catch (error) {
        console.error("Usage check error:", error);
        return NextResponse.json({ error: "Failed to check usage" }, { status: 500 });
    }
}
