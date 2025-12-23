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
        console.log('[SubscriptionService] Getting subscription for user:', userId);

        try {
            // 1. Primary: Fetch from 'user_subscriptions' table
            console.log('[SubscriptionService] Trying user_subscriptions table...');
            const { data: subscription, error: subError } = await supabase
                .from('user_subscriptions' as any)
                .select('tier, subscription_status, current_period_end')
                .eq('user_id', userId)
                .eq('subscription_status', 'active')
                .maybeSingle();

            console.log('[SubscriptionService] user_subscriptions result:', {
                tier: (subscription as any)?.tier,
                error: subError?.message
            });

            if (!subError && subscription) {
                const tier = (subscription as any).tier;
                const periodEnd = (subscription as any).current_period_end;

                // Check expiration
                if (periodEnd && new Date(periodEnd) < new Date()) {
                    console.info('[SubscriptionService] Subscription expired');
                    return 'Starter';
                }

                if (tier) {
                    const normalizedPlan = this.normalizePlanName(tier);
                    console.log('[SubscriptionService] Returning plan from user_subscriptions:', normalizedPlan);
                    return normalizedPlan;
                }
            }

            // 3. Last Fallback: Fetch from 'user_profiles' (role-based mapping)
            console.log('[SubscriptionService] Trying user_profiles table (role)...');
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles' as any)
                .select('role')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            console.log('[SubscriptionService] user_profiles result:', {
                role: (profile as any)?.role,
                error: profileError?.message
            });

            if (profileError) {
                console.error('[SubscriptionService] Profile fetch failed:', profileError.message || profileError);
                return 'Starter';
            }

            const role = (profile as any)?.role?.toLowerCase();
            if (role === 'developer') return 'Pro';
            if (role === 'business') return 'Business';
            if (role === 'enterprise') return 'Business';

            console.log('[SubscriptionService] No plan found, defaulting to Starter');
            return 'Starter';
        } catch (err) {
            console.error('[SubscriptionService] Unexpected error:', err);
            return 'Starter';
        }
    }

    /**
     * Normalize tier/plan name to match SubscriptionPlan type
     * Tier enum values: 'free', 'boost', 'developer', 'business'
     */
    private static normalizePlanName(plan: string): SubscriptionPlan {
        const lower = plan.toLowerCase();
        // Map tier enum values to plan names
        if (lower === 'developer' || lower === 'pro') return 'Pro';
        if (lower === 'business' || lower === 'enterprise') return 'Business';
        if (lower === 'boost') return 'Pro'; // Boost maps to Pro
        if (lower === 'free' || lower === 'starter') return 'Starter';
        // Handle variations
        if (lower.includes('business')) return 'Business';
        if (lower.includes('pro') || lower.includes('developer')) return 'Pro';
        return 'Starter';
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
