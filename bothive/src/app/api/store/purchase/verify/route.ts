import { NextRequest, NextResponse } from "next/server";
import { PaystackMarketplaceService } from "@/lib/services/paystack-marketplace.service";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { reference, botId } = await req.json();

        if (!reference || !botId) {
            return NextResponse.json({ error: "Missing reference or botId" }, { status: 400 });
        }

        // 1. Verify with Paystack
        const verification = await PaystackMarketplaceService.verifyPurchase(reference);

        if (!verification.success) {
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

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 3. Record Purchase / Entitlement
        // We'll insert into a 'purchases' or 'entitlements' table.
        // If table doesn't exist, we might need to create it or reuse 'bot_installs' with a 'paid' flag.
        // For now, let's assume 'bot_purchases' exists or use 'bot_installs' directly if that's the model.
        // Given 'handleInstall' calls '/api/agents', maybe we just want to record it so '/api/agents' knows.

        // Let's create a 'bot_purchases' record
        const { error: dbError } = await supabase
            .from('bot_purchases')
            .insert({
                user_id: user.id,
                bot_id: botId,
                amount_paid: verification.data.amount / 100, // convert kobo back to main unit
                reference: reference,
                status: 'completed',
                provider: 'paystack'
            });

        if (dbError) {
            console.error("Database Error recording purchase:", dbError);
            // Verify if it's already recorded to be idempotent
            // If duplicate, we can ignore 
            if (dbError.code !== '23505') { // unique constraint
                return NextResponse.json({ error: "Failed to record purchase" }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Purchase Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
