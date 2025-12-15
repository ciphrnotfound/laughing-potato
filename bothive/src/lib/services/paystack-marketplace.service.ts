import { PaystackService } from "@/lib/paystack-service";
import { supabase } from "@/lib/supabase"; // Note: Use service role client in real usage for fetching sensitive data like subaccount codes

export class PaystackMarketplaceService {
    private static PLATFORM_FEE_PERCENT = 0.30; // 30%

    /**
     * Initialize a marketplace purchase
     */
    static async initializePurchase(params: {
        userEmail: string;
        botId: string;
        amount: number; // in NGN (will be converted to kobo)
        metadata?: any;
    }) {
        // 1. Fetch Bot Developer's payment info (Subaccount Code)
        // In a real app, this would be in a 'connected_accounts' or 'profiles' table
        // For now, we simulate or fetch if available.
        // TODO: Fetch real subaccount code based on bot owner.

        let subaccountCode = undefined;
        let bearer = 'account'; // Platform pays fees by default or user pays? 
        // Usually, split payment: 
        // - We charge user full amount.
        // - We take 30% fee. 
        // - Paystack takes their fee. 
        // - Developer gets remainder.

        // Paystack Split Payment (Subaccount):
        // If we use 'subaccount', transaction is split.
        // We can use 'transaction_charge' to specify our flat fee (or percentage logic if subaccount is configured as such).

        // Simplified Logic: 
        // User pays Amount.
        // We set transaction_charge = 30% of Amount.
        // Paystack sends that charge to us.
        // Remainder goes to Subaccount.
        // (Note: Paystack also takes their own fee from somewhere).

        const platformFee = Math.round(params.amount * this.PLATFORM_FEE_PERCENT * 100); // in kobo
        const amountInKobo = Math.round(params.amount * 100);

        // Simulated subaccount for testing or if dev is not onboarded
        // If no subaccount, platform takes all (which is default behavior of initializeTransaction when no subaccount provided)

        // Construct transaction
        const result = await PaystackService.initializeTransaction({
            email: params.userEmail,
            amount: amountInKobo,
            metadata: {
                ...params.metadata,
                type: 'marketplace_purchase',
                botId: params.botId,
            },
            subaccount: subaccountCode, // Pass if available
            // transaction_charge: platformFee, // Only relevant if subaccount is present
            // bearer: 'subaccount' // Subaccount bears Paystack fees? Or 'account' (us)?
        });

        return result;
    }

    /**
     * Verify marketplace purchase
     */
    static async verifyPurchase(reference: string) {
        const data = await PaystackService.verifyTransaction(reference);

        if (data.status === 'success') {
            // Record purchase in DB
            // 'bot_installs' or 'purchases' table
            return { success: true, data };
        }

        return { success: false, data };
    }
}
