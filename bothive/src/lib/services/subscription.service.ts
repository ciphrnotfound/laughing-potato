import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side supabase client for reading
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SubscriptionPlan = 'Starter' | 'Pro' | 'Business';

export class SubscriptionService {

    /**
     * Get user's current subscription plan
     */
    static async getUserSubscription(userId: string): Promise<SubscriptionPlan> {
        const { data, error } = await supabase
            .from('users')
            .select('billing_plan')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error('[SubscriptionService] Error fetching plan:', error);
            return 'Starter'; // Default to free plan
        }

        const userRecord = data as any;
        return (userRecord.billing_plan as SubscriptionPlan) || 'Starter';
    }

    /**
     * Update user's subscription plan (Server-side only usually)
     * Requires service role key context or authorized user
     */
    static async updateUserSubscription(userId: string, plan: SubscriptionPlan, supabaseClient: any) {
        const { error } = await supabaseClient
            .from('users')
            .update({ billing_plan: plan })
            .eq('id', userId);

        if (error) {
            console.error('[SubscriptionService] Error updating plan:', error);
            throw error;
        }

        return true;
    }
}
