
import { NextRequest, NextResponse } from "next/server";
import { PaystackService } from "@/lib/paystack-service";
import { EmailService } from "@/lib/email";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { reference, plan, couponCode } = await req.json();

        if (!reference) {
            return NextResponse.json({ error: "No reference provided" }, { status: 400 });
        }

        // 1. Verify with Paystack
        // Note: In mock mode (no key), verify might fail if we don't handle it.
        // PaystackService throws error if key missing.
        let verifiedData;
        if (process.env.PAYSTACK_SECRET_KEY) {
            verifiedData = await PaystackService.verifyTransaction(reference);
        } else {
            // Mock verification
            console.log("⚠️ Mock Verifying:", reference);
            verifiedData = { status: "success", customer: { email: "mock@user.com" }, amount: 990000 };
        }

        if (verifiedData.status !== "success") {
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        // 2. Get User via Supabase Auth (using headers/cookies)
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

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            // Fallback: Try to find user by email from Paystack transaction
            console.log("⚠️ No active session found, attempting to find user by email:", verifiedData.customer.email);

            // We need service role to search by email if auth fails
            const supabaseAdmin = createServerClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { cookies: {} as any } // No cookies needed for admin
            );

            // Search user by email would be complex as email is in auth.users not public.users directly usually
            // For now, let's assume session exists or fail
            return NextResponse.json({ error: "User session required for plan update" }, { status: 401 });
        }

        // 3. Update User Subscription in DB using Admin privileges
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const updates = { billing_plan: plan };

        let targetRole = 'developer';
        if (plan.toLowerCase().includes('business')) targetRole = 'business';
        if (plan.toLowerCase().includes('student')) targetRole = 'student';
        if (plan.toLowerCase().includes('enterprise')) targetRole = 'enterprise';

        const roleUpdate = { role: targetRole };

        const updateOps: any[] = [
            supabaseAdmin.from('users').update({
                billing_plan: plan,
                updated_at: new Date().toISOString()
            }).eq('id', user.id),
            supabaseAdmin.from('user_profiles').update({
                role: targetRole,
                updated_at: new Date().toISOString()
            }).eq('user_id', user.id)
        ];

        // Invalidate coupon if used
        if (couponCode) {
            updateOps.push(
                supabaseAdmin.from('coupons')
                    .update({ is_active: false })
                    .eq('code', couponCode.toUpperCase())
            );
            console.log(`[VERIFY] Invalidating coupon: ${couponCode}`);
        }

        await Promise.all(updateOps);

        console.log(`✅ Plan and Role updated for user ${user.id} to ${plan}`);

        // 4. Send Receipt Email
        await EmailService.sendPaymentSuccessEmail(
            verifiedData.customer.email,
            verifiedData.amount,
            plan
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
