import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/lib/paystack-service';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { EmailService } from '@/lib/email';

/**
 * Paystack Webhook Handler
 */
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-paystack-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        // Verify signature
        const isValid = PaystackService.verifyWebhookSignature(
            rawBody,
            signature
        );

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(rawBody);
        const { event: eventType, data } = event;

        console.log(`Paystack Webhook received: ${eventType}`);

        // Initialize Supabase Admin Client (Service Role)
        // Webhooks are unauthenticated requests from Paystack, they don't have user cookies.
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Handle events
        switch (eventType) {
            case 'charge.success':
                await handleChargeSuccess(data, supabase);
                break;

            case 'subscription.create':
                await handleSubscriptionCreate(data, supabase);
                break;

            case 'subscription.disable':
                await handleSubscriptionDisable(data, supabase);
                break;

            default:
                console.log(`Unhandled Paystack event: ${eventType}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

async function handleChargeSuccess(data: any, supabase: any) {
    const { metadata, reference, amount, currency, status } = data;

    if (status !== 'success') return;

    // 1. Handle Plan Upgrades (Business, Pro)
    if (metadata?.plan_name && metadata?.user_id) {
        console.log(`Processing Plan Upgrade: ${metadata.plan_name} for user ${metadata.user_id}`);

        // Determine role mapping
        let targetRole = 'developer';
        if (metadata.plan_name.toLowerCase().includes('business')) targetRole = 'business';
        if (metadata.plan_name.toLowerCase().includes('student')) targetRole = 'student';
        if (metadata.plan_name.toLowerCase().includes('enterprise')) targetRole = 'enterprise';

        const updates: any = {
            billing_plan: metadata.plan_name,
            role: targetRole,
            updated_at: new Date().toISOString(),
        };

        const updateOps = [
            supabase.from('users').update(updates).eq('id', metadata.user_id),
            supabase.from('user_profiles').update({ role: targetRole }).eq('user_id', metadata.user_id)
        ];

        // Invalidate Coupon if present in metadata
        if (metadata.coupon_code) {
            updateOps.push(
                supabase.from('coupons')
                    .update({ is_active: false })
                    .eq('code', metadata.coupon_code.toUpperCase())
            );
            console.log(`[PAYSTACK-WEBHOOK] Invalidating coupon: ${metadata.coupon_code}`);
        }

        const results = await Promise.all(updateOps);
        const hasError = results.some(r => r.error);

        if (hasError) {
            console.error('Failed to update some tables:', results.map(r => r.error).filter(Boolean));
        } else {
            console.log(`Successfully upgraded user ${metadata.user_id} and profile to ${metadata.plan_name}`);

            // Fetch user for email if needed
            const { data: updatedUser } = await supabase
                .from('users')
                .select('email')
                .eq('id', metadata.user_id)
                .single();

            // Send Confirmation Email
            if (updatedUser?.email) {
                await EmailService.sendPaymentSuccessEmail(
                    updatedUser.email,
                    amount,
                    metadata.plan_name,
                    reference
                );
                console.log(`Receipt sent to ${updatedUser.email}`);
            }
        }

        // Return early if it's just a plan upgrade, unless it's ALSO an integration purchase
        if (!metadata.integration_id) return;
    }

    // 2. Handle Integration Purchases
    if (!metadata || !metadata.user_id || !metadata.integration_id) {
        console.log('Missing metadata for integration purchase in charge.success');
        return;
    }

    const { user_id, integration_id, user_tier } = metadata;
    const amountPaid = amount / 100; // Convert kobo to main currency

    // Get integration details
    const { data: integration } = await supabase
        .from('marketplace_integrations')
        .select('developer_id')
        .eq('id', integration_id)
        .single();

    if (!integration) return;

    // Calculate fees
    const feeResult = await supabase.rpc('calculate_platform_fee', {
        buyer_tier: user_tier || 'free',
        gross_amount: amountPaid,
    });

    // Fallback if RPC fails or returns no data
    const feeData = feeResult.data?.[0] || { fee_percent: 10, fee_amount: amountPaid * 0.1, net_amount: amountPaid * 0.9 };
    const { fee_percent, fee_amount, net_amount } = feeData;

    // Update purchase record
    await supabase
        .from('user_integration_purchases')
        .upsert({
            user_id,
            integration_id,
            purchase_type: 'one_time',
            payment_status: 'completed',
            paystack_reference: reference,
            amount_paid: amountPaid,
            currency,
            is_installed: true,
            installed_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,integration_id'
        });

    // Record transaction
    await supabase.from('revenue_transactions').insert({
        purchase_id: (
            await supabase
                .from('user_integration_purchases')
                .select('id')
                .eq('user_id', user_id)
                .eq('integration_id', integration_id)
                .single()
        ).data?.id,
        integration_id,
        buyer_id: user_id,
        seller_id: integration.developer_id,
        transaction_type: 'purchase',
        gross_amount: amountPaid,
        currency,
        buyer_tier: user_tier || 'free',
        platform_fee_percent: fee_percent,
        platform_fee_amount: fee_amount,
        seller_net_amount: net_amount,
        paystack_reference: reference,
        status: 'completed',
    });

    // Update integration revenue
    await supabase.rpc('increment_revenue', {
        integration_id,
        amount: net_amount,
    });
}

async function handleSubscriptionCreate(data: any, supabase: any) {
    console.log('Subscription created:', data.subscription_code);
}

async function handleSubscriptionDisable(data: any, supabase: any) {
    const { subscription_code } = data;

    await supabase
        .from('user_integration_purchases')
        .update({
            subscription_status: 'canceled',
            canceled_at: new Date().toISOString(),
            is_installed: false,
        })
        .eq('paystack_subscription_code', subscription_code);
}
