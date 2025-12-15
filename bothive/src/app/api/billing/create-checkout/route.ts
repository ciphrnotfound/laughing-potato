import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
    apiVersion: '2024-12-18.acacia' as any
});

/**
 * POST /api/billing/create-checkout - Create Stripe checkout session
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { priceId, userId, email } = body;

        if (!priceId) {
            return NextResponse.json(
                { error: "priceId required" },
                { status: 400 }
            );
        }

        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: "Stripe not configured" },
                { status: 503 }
            );
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${req.nextUrl.origin}/dashboard?checkout=success`,
            cancel_url: `${req.nextUrl.origin}/pricing?checkout=cancelled`,
            customer_email: email,
            client_reference_id: userId,
            metadata: {
                userId: userId || 'anonymous',
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to create checkout session" },
            { status: 500 }
        );
    }
}
