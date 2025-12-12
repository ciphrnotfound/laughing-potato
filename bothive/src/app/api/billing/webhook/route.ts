import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

/**
 * POST /api/billing/webhook - Handle Stripe webhooks
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
            return NextResponse.json(
                { error: "Missing webhook signature" },
                { status: 400 }
            );
        }

        let event: Stripe.Event;

        try {
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err: any) {
            console.error('Webhook signature verification failed:', err.message);
            return NextResponse.json(
                { error: `Webhook Error: ${err.message}` },
                { status: 400 }
            );
        }

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const userId = session.metadata?.userId || session.client_reference_id;

                if (userId) {
                    // Update user subscription status
                    await supabase
                        .from('user_subscriptions')
                        .upsert({
                            user_id: userId,
                            stripe_customer_id: session.customer as string,
                            stripe_subscription_id: session.subscription as string,
                            status: 'active',
                            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                        }, {
                            onConflict: 'user_id',
                        });

                    // Award premium achievement
                    try {
                        await supabase.rpc('check_and_unlock_achievement', {
                            p_user_id: userId,
                            p_achievement_slug: 'premium-member',
                        });
                    } catch {
                        // ignore rpc error
                    }
                }
                break;
            }

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const customerId = subscription.customer as string;

                // Find user by customer ID
                const { data: userSub } = await supabase
                    .from('user_subscriptions')
                    .select('user_id')
                    .eq('stripe_customer_id', customerId)
                    .single();

                if (userSub) {
                    await supabase
                        .from('user_subscriptions')
                        .update({
                            status: subscription.status,
                            current_period_end: (() => {
                                const cpe = (subscription as any)?.current_period_end;
                                return cpe ? new Date(cpe * 1000).toISOString() : new Date().toISOString();
                            })(),
                        })
                        .eq('user_id', userSub.user_id);
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const customerId = invoice.customer as string;

                // Notify user of payment failure
                console.log(`Payment failed for customer: ${customerId}`);
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: error.message || "Webhook processing failed" },
            { status: 500 }
        );
    }
}
