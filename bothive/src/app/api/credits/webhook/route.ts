import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/lib/paystack-service';
import { addCredits } from '@/lib/services/credits.service';
import { createClient } from '@supabase/supabase-js';

// Use service role for webhook processing
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/credits/webhook
 * Handles Paystack webhook for successful purchases
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-paystack-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // Verify webhook signature
        const isValid = PaystackService.verifyWebhookSignature(body, signature);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(body);

        // Only process successful charges
        if (event.event === 'charge.success') {
            const { data } = event;
            const metadata = data.metadata || {};

            if (metadata.type === 'credit_purchase') {
                const userId = metadata.user_id;
                const hcAmount = metadata.hc_amount;
                const packageId = metadata.package_id;

                if (userId && hcAmount) {
                    // Add credits to user's wallet
                    await addCredits(
                        userId,
                        hcAmount,
                        'purchase',
                        `Purchased ${hcAmount} HiveCredits`,
                        {
                            package_id: packageId,
                            paystack_reference: data.reference,
                            amount_ngn: data.amount / 100 // Convert from kobo
                        }
                    );

                    console.log(`Added ${hcAmount} HC to user ${userId}`);
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
