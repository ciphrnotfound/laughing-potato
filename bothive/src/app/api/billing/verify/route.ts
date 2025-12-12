
import { NextRequest, NextResponse } from "next/server";
import { PaystackService } from "@/lib/paystack-service";
import { EmailService } from "@/lib/email";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { reference, plan } = await req.json();

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

        // 2. Get User
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

        // 3. Update User Subscription in DB
        // TODO: Update 'users' or 'subscriptions' table
        // For now, we assume success 

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
