
import { NextRequest, NextResponse } from "next/server";
import { PaystackService } from "@/lib/paystack-service";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function POST(req: NextRequest) {
    try {
        const { reference, botId, botName, amount } = await req.json();

        if (!reference || !botId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Verify with Paystack (Bypass if amount is 0 and it's a free coupon)
        const isFreeCoupon = amount === 0 && reference?.startsWith('FREE_COUPON_');
        let verifiedData;

        if (isFreeCoupon) {
            console.log("🎁 Processing Free Hive Purchase:", reference);
            verifiedData = { status: "success", customer: { email: "free-coupon-user@bothive.ai" }, amount: 0 };
        } else if (process.env.PAYSTACK_SECRET_KEY) {
            verifiedData = await PaystackService.verifyTransaction(reference);
        } else {
            console.log("⚠️ Mock Verifying Hive Purchase:", reference);
            verifiedData = { status: "success", customer: { email: "customer@mock.com" }, amount: (amount || 0) * 100 };
        }

        if (verifiedData.status !== "success") {
            return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
        }

        // 2. Setup Supabase
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

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 3. Get Buyer Info
        const { data: { user: buyer }, error: authError } = await supabase.auth.getUser();
        if (authError || !buyer) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const { data: buyerProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('full_name')
            .eq('user_id', buyer.id)
            .single();

        const buyerName = buyerProfile?.full_name || buyer.email || "A customer";

        // 4. Get Bot/Developer Info
        const { data: bot } = await supabaseAdmin
            .from('bots')
            .select('user_id, name')
            .eq('id', botId)
            .single();

        const developerId = bot?.user_id;
        const actualBotName = bot?.name || botName;

        // 5. Update Database (Record Purchase)
        // Check if user_integration_purchases exists, if not use a fallback or skip (demo mode)
        try {
            await supabaseAdmin.from('user_integration_purchases').upsert({
                user_id: buyer.id,
                integration_id: botId,
                purchase_type: 'one_time',
                payment_status: 'completed',
                amount_paid: amount,
                currency: 'NGN',
                is_installed: true,
                installed_at: new Date().toISOString()
            }, { onConflict: 'user_id, integration_id' });
        } catch (dbErr) {
            console.warn("Could not record purchase in user_integration_purchases, might not exist yet.", dbErr);
        }

        // 6. SEND NOTIFICATIONS
        const notifications = [];

        // To Buyer
        notifications.push(
            supabaseAdmin.from('notifications').insert({
                user_id: buyer.id,
                title: "Purchase Successful! 🚀",
                message: `You successfully purchased ${actualBotName}. You can now find it in your workspace.`,
                type: 'success',
                link: '/dashboard/workforce'
            })
        );

        // To Developer (if exists and not the buyer themselves)
        if (developerId && developerId !== buyer.id) {
            notifications.push(
                supabaseAdmin.from('notifications').insert({
                    user_id: developerId,
                    title: "New Sale! 💰",
                    message: `${buyerName} just purchased your bot "${actualBotName}" for ₦${amount.toLocaleString()}.`,
                    type: 'success',
                    link: '/dashboard'
                })
            );
        }

        await Promise.all(notifications);

        console.log(`✅ Purchase verified for ${actualBotName}. Notifications sent to buyer and developer.`);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("HiveStore Purchase Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
