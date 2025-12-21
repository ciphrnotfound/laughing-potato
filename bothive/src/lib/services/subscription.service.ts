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
        try {
            // 1. Primary Attempt: Fetch from 'users' table (canonical source)
            const { data, error } = await supabase
                .from('users')
                .select('billing_plan')
                .eq('id', userId)
                .single();

            if (!error && (data as any)?.billing_plan) {
                return ((data as any).billing_plan as SubscriptionPlan);
            }

            if (error) {
                console.warn('[SubscriptionService] Users table fetch failed (likely RLS):', error.message || error);
            }

            // 2. Fallback Attempt: Fetch from 'user_profiles' (usually has RLS enabled)
            // We map 'role' to a reasonable plan name
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles' as any)
                .select('role')
                .eq('user_id', userId)
                .single();

            if (profileError) {
                console.error('[SubscriptionService] Profile fetch failed:', profileError.message || profileError);
                return 'Starter';
            }

            const role = (profile as any)?.role?.toLowerCase();
            if (role === 'developer') return 'Pro';
            if (role === 'business') return 'Business';
            if (role === 'enterprise') return 'Business'; // Map enterprise to highest current tier

            return 'Starter';
        } catch (err) {
            console.error('[SubscriptionService] Unexpected error:', err);
            return 'Starter';
        }
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
