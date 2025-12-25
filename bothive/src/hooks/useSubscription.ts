import { useState, useEffect } from 'react';
import { useAppSession } from '@/lib/app-session-context';
import { SubscriptionTier } from '@/lib/subscription-tiers';

export function useSubscription() {
    const { profile } = useAppSession();
    // 0: Starter/Free, 1: Pro/Developer/Boost, 2: Business
    const [tier, setTier] = useState<number>(0);
    const [tierName, setTierName] = useState<SubscriptionTier>('free');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchTier = async () => {
            try {
                // If we don't have a profile, we are definitely free tier (or not logged in)
                if (!profile) {
                    if (mounted) {
                        setTier(0);
                        setTierName('free');
                        setIsLoading(false);
                    }
                    return;
                }

                const res = await fetch("/api/usage/check");
                if (res.ok && mounted) {
                    const data = await res.json();
                    const t = data.tier as SubscriptionTier;
                    setTierName(t);

                    // Map to 0, 1, 2 for PerksPage compatibility
                    if (t === 'business') {
                        setTier(2);
                    } else if (t === 'developer' || t === 'boost') {
                        setTier(1);
                    } else {
                        setTier(0);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch subscription tier", e);
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchTier();

        return () => {
            mounted = false;
        };
    }, [profile]);

    return { tier, tierName, isLoading };
}
