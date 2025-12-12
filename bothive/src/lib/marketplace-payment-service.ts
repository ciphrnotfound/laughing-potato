import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
});

/**
 * Marketplace Payment Service
 * Handles payments, subscriptions, and developer payouts
 */
export class MarketplacePaymentService {
    /**
     * Create or retrieve Stripe customer for user
     */
    static async getOrCreateCustomer(userId: string, email: string): Promise<string> {
        // Check if customer already exists in database
        // If not, create new Stripe customer
        const customer = await stripe.customers.create({
            email,
            metadata: {
                bothive_user_id: userId,
            },
        });

        return customer.id;
    }

    /**
     * Create Stripe Connect account for developer to receive payouts
     */
    static async createConnectAccount(
        userId: string,
        email: string,
        country: string = 'US'
    ): Promise<{ accountId: string; onboardingUrl: string }> {
        // Create Connect Express account
        const account = await stripe.accounts.create({
            type: 'express',
            country,
            email,
            capabilities: {
                transfers: { requested: true },
            },
            metadata: {
                bothive_user_id: userId,
            },
        });

        // Create account link for onboarding
        const accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/developer/connect/refresh`,
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/developer/connect/success`,
            type: 'account_onboarding',
        });

        return {
            accountId: account.id,
            onboardingUrl: accountLink.url,
        };
    }

    /**
     * Check if Connect account is fully onboarded
     */
    static async checkConnectAccountStatus(accountId: string): Promise<boolean> {
        const account = await stripe.accounts.retrieve(accountId);
        return account.charges_enabled && account.payouts_enabled;
    }

    /**
     * Create subscription for recurring integration purchase
     */
    static async createSubscription(params: {
        customerId: string;
        priceId: string;
        integrationId: string;
        userId: string;
        userTier: 'free' | 'pro' | 'enterprise' | 'developer';
        platformFeePercent: number;
    }): Promise<Stripe.Subscription> {
        const { customerId, priceId, integrationId, userId, userTier, platformFeePercent } = params;

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            metadata: {
                bothive_user_id: userId,
                integration_id: integrationId,
                user_tier: userTier,
                platform_fee_percent: platformFeePercent.toString(),
            },
            // Application fee (platform's cut) - calculated on each payment
            application_fee_percent: platformFeePercent,
        });

        return subscription;
    }

    /**
     * Create one-time payment for integration
     */
    static async createPaymentIntent(params: {
        amount: number; // in cents
        currency: string;
        customerId: string;
        integrationId: string;
        userId: string;
        userTier: string;
        platformFeePercent: number;
        stripeAccountId: string; // Developer's Connect account
    }): Promise<Stripe.PaymentIntent> {
        const {
            amount,
            currency,
            customerId,
            integrationId,
            userId,
            userTier,
            platformFeePercent,
            stripeAccountId,
        } = params;

        // Calculate platform fee
        const platformFeeAmount = Math.round(amount * (platformFeePercent / 100));

        // Create payment intent with application fee
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer: customerId,
            metadata: {
                bothive_user_id: userId,
                integration_id: integrationId,
                user_tier: userTier,
            },
            // Transfer to developer's account
            transfer_data: {
                destination: stripeAccountId,
            },
            // Platform's fee
            application_fee_amount: platformFeeAmount,
        });

        return paymentIntent;
    }

    /**
     * Create payout to developer
     */
    static async createPayout(params: {
        amount: number; // in cents
        currency: string;
        stripeAccountId: string;
        developerId: string;
    }): Promise<Stripe.Payout> {
        const { amount, currency, stripeAccountId, developerId } = params;

        // Create payout to developer's bank account
        const payout = await stripe.payouts.create(
            {
                amount,
                currency,
                metadata: {
                    bothive_developer_id: developerId,
                },
            },
            {
                stripeAccount: stripeAccountId,
            }
        );

        return payout;
    }

    /**
     * Get developer balance (available + pending)
     */
    static async getDeveloperBalance(stripeAccountId: string): Promise<{
        available: number;
        pending: number;
        currency: string;
    }> {
        const balance = await stripe.balance.retrieve({
            stripeAccount: stripeAccountId,
        });

        const availableAmount = balance.available[0]?.amount || 0;
        const pendingAmount = balance.pending[0]?.amount || 0;
        const currency = balance.available[0]?.currency || 'usd';

        return {
            available: availableAmount,
            pending: pendingAmount,
            currency: currency.toUpperCase(),
        };
    }

    /**
     * Cancel subscription
     */
    static async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
        if (immediately) {
            return await stripe.subscriptions.cancel(subscriptionId);
        } else {
            // Cancel at end of billing period
            return await stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
        }
    }

    /**
     * Process refund
     */
    static async createRefund(params: {
        paymentIntentId: string;
        amount?: number; // Optional partial refund
        reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
    }): Promise<Stripe.Refund> {
        const { paymentIntentId, amount, reason } = params;

        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount,
            reason,
        });

        return refund;
    }

    /**
     * Get subscription details
     */
    static async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
        return await stripe.subscriptions.retrieve(subscriptionId);
    }

    /**
     * Update subscription price (upgrade/downgrade)
     */
    static async updateSubscriptionPrice(
        subscriptionId: string,
        newPriceId: string
    ): Promise<Stripe.Subscription> {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        return await stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: subscription.items.data[0].id,
                    price: newPriceId,
                },
            ],
            proration_behavior: 'create_prorations',
        });
    }

    /**
     * Create Stripe product and price for an integration
     */
    static async createProductAndPrice(params: {
        name: string;
        description: string;
        price: number; // in cents
        currency: string;
        billingInterval?: 'month' | 'year';
        integrationId: string;
    }): Promise<{ productId: string; priceId: string }> {
        const { name, description, price, currency, billingInterval, integrationId } = params;

        // Create product
        const product = await stripe.products.create({
            name,
            description,
            metadata: {
                integration_id: integrationId,
            },
        });

        // Create price
        const priceObject = await stripe.prices.create({
            product: product.id,
            unit_amount: price,
            currency,
            ...(billingInterval && {
                recurring: {
                    interval: billingInterval,
                },
            }),
            metadata: {
                integration_id: integrationId,
            },
        });

        return {
            productId: product.id,
            priceId: priceObject.id,
        };
    }

    /**
     * Verify webhook signature
     */
    static verifyWebhookSignature(
        payload: string | Buffer,
        signature: string,
        secret: string
    ): Stripe.Event {
        return stripe.webhooks.constructEvent(payload, signature, secret);
    }
}
