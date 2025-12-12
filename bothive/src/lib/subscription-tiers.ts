// Subscription tier configuration

export type SubscriptionTier = 'free' | 'boost' | 'developer' | 'business';

export interface TierLimits {
    aiMessagesPerMonth: number;
    botsAllowed: number;
    integrationsAllowed: number;
    marketplaceDiscount: number; // percentage
    canRequestCustomBot: boolean;
    priorityApproval: boolean;
    canAutoPublish: boolean; // only if trusted
    teamMembers: number;
    customBranding: boolean;
}

export const TIER_CONFIG: Record<SubscriptionTier, TierLimits> = {
    free: {
        aiMessagesPerMonth: 5,
        botsAllowed: 0, // test only
        integrationsAllowed: 2,
        marketplaceDiscount: 0,
        canRequestCustomBot: false,
        priorityApproval: false,
        canAutoPublish: false,
        teamMembers: 1,
        customBranding: false,
    },
    boost: {
        aiMessagesPerMonth: 200,
        botsAllowed: 1,
        integrationsAllowed: 5,
        marketplaceDiscount: 10,
        canRequestCustomBot: true, // 1 free custom bot
        priorityApproval: false,
        canAutoPublish: false,
        teamMembers: 1,
        customBranding: false,
    },
    developer: {
        aiMessagesPerMonth: 500,
        botsAllowed: 5,
        integrationsAllowed: 15,
        marketplaceDiscount: 15,
        canRequestCustomBot: true,
        priorityApproval: true,
        canAutoPublish: false, // need to earn trust
        teamMembers: 3,
        customBranding: false,
    },
    business: {
        aiMessagesPerMonth: -1, // unlimited
        botsAllowed: -1, // unlimited
        integrationsAllowed: -1, // unlimited
        marketplaceDiscount: 25,
        canRequestCustomBot: true,
        priorityApproval: true,
        canAutoPublish: true, // if trusted
        teamMembers: -1, // unlimited
        customBranding: true,
    },
};

export const TIER_PRICING: Record<SubscriptionTier, number> = {
    free: 0,
    boost: 9,
    developer: 19,
    business: 49,
};

export const TIER_NAMES: Record<SubscriptionTier, string> = {
    free: 'Free',
    boost: 'Hive Boost',
    developer: 'Developer Pro',
    business: 'Business',
};

export const TIER_DESCRIPTIONS: Record<SubscriptionTier, string> = {
    free: 'Try out Bothive with basic features',
    boost: 'Perfect for personal use with a free custom bot',
    developer: 'Build and deploy multiple bots with priority review',
    business: 'Unlimited everything for teams and enterprises',
};

// Helper to check if a limit is unlimited
export function isUnlimited(limit: number): boolean {
    return limit === -1;
}

// Get tier limits
export function getTierLimits(tier: SubscriptionTier): TierLimits {
    return TIER_CONFIG[tier];
}

// Check if user can perform action
export function canUseFeature(
    tier: SubscriptionTier,
    feature: keyof TierLimits
): boolean {
    const limits = TIER_CONFIG[tier];
    const value = limits[feature];

    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    return false;
}
