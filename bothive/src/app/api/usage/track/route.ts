import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { TIER_CONFIG, SubscriptionTier } from "@/lib/subscription-tiers";

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { type = "ai_message" } = body; // ai_message, bot_created, integration_used

        // Admin Override
        const ADMIN_EMAIL = "akinlorinjeremiah@gmail.com";
        if (user.email === ADMIN_EMAIL) {
            return NextResponse.json({
                success: true,
                type,
                used: 0,
                limit: -1,
                remaining: -1,
                tier: "business",
                isAdmin: true
            });
        }

        // Get user's tier
        const { data: userData } = await supabase
            .from("users")
            .select("tier")
            .eq("id", user.id)
            .single();

        const tier: SubscriptionTier = userData?.tier || "free";
        const tierLimits = TIER_CONFIG[tier];

        // Get current month
        const currentMonth = new Date().toISOString().slice(0, 7);

        // Check current usage first
        const { data: usageData } = await supabase
            .from("usage_tracking")
            .select("ai_messages_used, bots_created, integrations_used")
            .eq("user_id", user.id)
            .eq("month_year", currentMonth)
            .single();

        const currentUsage = usageData?.ai_messages_used || 0;
        const limit = tierLimits.aiMessagesPerMonth;

        // Check if over limit (unless unlimited)
        if (limit !== -1 && currentUsage >= limit) {
            return NextResponse.json({
                error: "Usage limit reached",
                limit,
                used: currentUsage,
                tier,
                upgradeRequired: true,
            }, { status: 429 });
        }

        // Increment usage
        const updateField = type === "ai_message" ? "ai_messages_used"
            : type === "bot_created" ? "bots_created"
                : "integrations_used";

        const { data: updated, error: updateError } = await supabase
            .from("usage_tracking")
            .upsert({
                user_id: user.id,
                month_year: currentMonth,
                [updateField]: (usageData?.[updateField] || 0) + 1,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: "user_id,month_year",
            })
            .select()
            .single();

        if (updateError) {
            console.error("Usage update error:", updateError);
            // Don't block the user, just log
        }

        const newUsage = usageData?.[updateField] + 1 || 1;
        const remaining = limit === -1 ? -1 : Math.max(0, limit - newUsage);

        return NextResponse.json({
            success: true,
            type,
            used: newUsage,
            limit,
            remaining,
            tier,
        });

    } catch (error) {
        console.error("Usage track error:", error);
        return NextResponse.json({ error: "Failed to track usage" }, { status: 500 });
    }
}
