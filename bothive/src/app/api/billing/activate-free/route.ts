import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { EmailService } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { plan, couponCode } = body;

        console.log("[ACTIVATE-FREE] Request:", { plan, couponCode });

        if (!plan) {
            return NextResponse.json({ error: "Missing plan" }, { status: 400 });
        }

        if (!couponCode) {
            return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });
        }

        // 1. Verify Authentication
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                    set(name: string, value: string, options: any) {
                        try { cookieStore.set({ name, value, ...options }); } catch (e) { /* ignore */ }
                    },
                    remove(name: string, options: any) {
                        try { cookieStore.set({ name, value: '', ...options }); } catch (e) { /* ignore */ }
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        console.log("[ACTIVATE-FREE] Auth check:", { userId: user?.id, authError: authError?.message });

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized - please sign in" }, { status: 401 });
        }

        // 2. Verify Coupon (Securely with Service Role)
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error("[ACTIVATE-FREE] Missing SUPABASE_SERVICE_ROLE_KEY");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: coupon, error: couponError } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('is_active', true)
            .single();

        console.log("[ACTIVATE-FREE] Coupon check:", { coupon: coupon?.code, couponError: couponError?.message });

        if (couponError || !coupon) {
            return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
        }

        if (coupon.discount_percent < 100) {
            return NextResponse.json({ error: "Coupon is not 100% off. Payment required." }, { status: 400 });
        }

        // 3. Activate subscription across all relevant tables
        const subscriptionData = {
            user_id: user.id,
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        console.log("[ACTIVATE-FREE] Synchronizing tables for user:", user.id);

        // Map plan to role
        let targetRole = 'developer';
        if (plan.toLowerCase().includes('business')) targetRole = 'business';
        if (plan.toLowerCase().includes('student')) targetRole = 'student';
        if (plan.toLowerCase().includes('enterprise')) targetRole = 'enterprise';

        const updateOps = [
            // 1. Dedicated subscription table
            supabaseAdmin.from('user_subscriptions').upsert(subscriptionData, { onConflict: 'user_id' }),

            // 2. Primary users table (for billing_plan)
            supabaseAdmin.from('users').update({
                billing_plan: plan,
                updated_at: new Date().toISOString()
            }).eq('id', user.id),

            // 3. Profiles table (for role/UI)
            supabaseAdmin.from('user_profiles').update({
                role: targetRole,
                updated_at: new Date().toISOString()
            }).eq('user_id', user.id),

            // 4. INVALIDATE COUPON (Set is_active = false)
            supabaseAdmin.from('coupons').update({ is_active: false }).eq('code', coupon.code)
        ];

        const results = await Promise.all(updateOps);
        const firstError = results.find(r => r.error);

        if (firstError) {
            console.error("[ACTIVATE-FREE] Synchronization error:", firstError.error);
        } else {
            console.log("[ACTIVATE-FREE] All tables updated and coupon invalidated successfully!");
        }

        console.log(`[ACTIVATE-FREE] SUCCESS - User ${user.id} activated ${plan} with coupon ${couponCode}`);

        // 4. Send Confirmation Email (non-blocking)
        if (user.email) {
            EmailService.sendPaymentSuccessEmail(
                user.email,
                0,
                plan,
                `COUPON-${couponCode}`
            ).catch(err => console.error("[ACTIVATE-FREE] Email error:", err));
        }

        return NextResponse.json({
            success: true,
            message: `${plan} plan activated! Your dashboard will reflect the changes immediately.`
        });

    } catch (error: any) {
        console.error("[ACTIVATE-FREE] Error:", error);
        return NextResponse.json({
            error: error?.message || "Unexpected error occurred",
            success: false
        }, { status: 500 });
    }
}
