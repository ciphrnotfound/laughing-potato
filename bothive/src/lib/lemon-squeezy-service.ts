import {
    lemonSqueezySetup,
    createCheckout,
    listProducts,
    listVariants,
    getVariant,
    getCustomer,
    listCustomers,
} from "@lemonsqueezy/lemonsqueezy.js";

// Initialize Lemon Squeezy
const apiKey = process.env.LEMONSQUEEZY_API_KEY;
const storeId = process.env.LEMONSQUEEZY_STORE_ID;

if (apiKey) {
    lemonSqueezySetup({ apiKey });
}

/**
 * Lemon Squeezy Payment Service
 * Handles checkouts, webhooks, and product management
 */
export class LemonSqueezyService {

    /**
     * Create a checkout link for an integration
     */
    static async createCheckoutLink(params: {
        variantId: string;
        userId: string;
        userEmail: string;
        integrationId: string;
        userTier: string;
        redirectUrl?: string;
    }) {
        if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID is not set");

        const { variantId, userId, userEmail, integrationId, userTier, redirectUrl } = params;

        // Custom data to track the purchase
        const checkoutData = {
            email: userEmail,
            checkoutOptions: {
                embed: true,
                media: false,
                buttonColor: "#7047EB", // Primary color
            },
            checkoutData: {
                email: userEmail,
                custom: {
                    user_id: userId,
                    integration_id: integrationId,
                    user_tier: userTier,
                },
            },
            productOptions: {
                redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/integrations/success`,
                receiptButtonText: "Go to Dashboard",
                receiptThankYouNote: "Thank you for purchasing this integration!",
            },
        };

        const { data, error } = await createCheckout(storeId, variantId, checkoutData);

        if (error) {
            console.error("Lemon Squeezy checkout error:", error);
            throw error;
        }

        return data?.data.attributes.url;
    }

    /**
     * Verify webhook signature
     * (Lemon Squeezy uses a simpler secret comparison than Stripe)
     */
    static verifyWebhookSignature(
        rawBody: string,
        signature: string,
        secret: string
    ): boolean {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        const digest = hmac.update(rawBody).digest('hex');
        return signature === digest;
    }

    /**
     * Get all products from the store
     */
    static async getProducts() {
        if (!storeId) throw new Error("LEMONSQUEEZY_STORE_ID is not set");
        const { data, error } = await listProducts({ filter: { storeId } });
        if (error) throw error;
        return data;
    }

    /**
     * Get variants (price points) for a product
     */
    static async getVariants(productId: string) {
        const { data, error } = await listVariants({
            filter: { productId },
        });
        if (error) throw error;
        return data;
    }
}
