import crypto from 'crypto';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackInitializeResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
        status: string;
        reference: string;
        amount: number;
        gateway_response: string;
        channel: string;
        currency: string;
        metadata?: any;
        customer: {
            email: string;
            customer_code: string;
        };
    };
}

/**
 * Paystack Payment Service
 * Handles transactions and verification
 */
export class PaystackService {

    /**
     * Initialize a transaction
     */
    static async initializeTransaction(params: {
        email: string;
        amount: number; // in kobo/cents (base currency unit)
        currency?: string;
        callbackUrl?: string;
        metadata?: any;
        subaccount?: string; // For split payments
        transaction_charge?: number; // Flat fee
        bearer?: string; // Who pays the fee?
    }): Promise<PaystackInitializeResponse['data']> {
        if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not set");

        const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: params.email,
                amount: Math.round(params.amount), // Ensure integer
                currency: params.currency || 'NGN',
                callback_url: params.callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/integrations/success`,
                metadata: params.metadata,
                subaccount: params.subaccount,
                transaction_charge: params.transaction_charge,
                bearer: params.bearer,
            }),
        });

        const data = await response.json();

        if (!data.status) {
            throw new Error(`Paystack initialization failed: ${data.message}`);
        }

        return data.data;
    }

    /**
     * Verify a transaction
     */
    static async verifyTransaction(reference: string): Promise<PaystackVerifyResponse['data']> {
        if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY is not set");

        const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });

        const data = await response.json();

        if (!data.status) {
            throw new Error(`Paystack verification failed: ${data.message}`);
        }

        return data.data;
    }

    /**
     * Verify webhook signature
     */
    static verifyWebhookSignature(
        body: string,
        signature: string
    ): boolean {
        if (!PAYSTACK_SECRET_KEY) return false;

        const hash = crypto
            .createHmac('sha512', PAYSTACK_SECRET_KEY)
            .update(body)
            .digest('hex');

        return hash === signature;
    }
}
