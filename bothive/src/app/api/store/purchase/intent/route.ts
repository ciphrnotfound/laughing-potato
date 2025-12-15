import { NextRequest, NextResponse } from "next/server";
import { PaystackMarketplaceService } from "@/lib/services/paystack-marketplace.service";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const { botId, amount } = await req.json();

        if (!botId || !amount) {
            return NextResponse.json({ error: "Missing botId or amount" }, { status: 400 });
        }

        // 1. Get User
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

        if (authError || !user || !user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Initialize Purchase
        const transaction = await PaystackMarketplaceService.initializePurchase({
            userEmail: user.email,
            botId,
            amount,
            metadata: {
                userId: user.id
            }
        });

        return NextResponse.json({
            access_code: transaction.access_code,
            reference: transaction.reference,
            authorization_url: transaction.authorization_url
        });

    } catch (error: any) {
        console.error("Purchase Intent Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
