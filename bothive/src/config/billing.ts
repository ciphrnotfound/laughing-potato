export const COUPONS: Record<string, number> = {
    'LAUNCH20': 20, // 20% off
    'EARLYBIRD': 15,
    'HIVE10': 10,
    'BOTMASTER': 25,
};

export const PLANS = [
    {
        name: 'Starter',
        price: 0,
        description: 'For hobbyists and explorers.',
        features: [
            'Access to HiveStore',
            '1 Workspace',
            'Community Support',
            'Basic Analytics'
        ],
        current: true,
    },
    {
        name: 'Pro',
        price: 9900, // NGN
        description: 'The Ecosystem Power-Up.',
        features: [
            '1 Free Premium Bot / Month',
            'HiveMind AI Access',
            '20% OFF ALL HiveStore Bots',
            'Priority Support'
        ],
        highlight: true,
    },
    {
        name: 'Business',
        price: 24900, // NGN
        description: 'For scaling teams.',
        features: [
            'Everything in Pro',
            'Unlimited Workspaces',
            'Team Management',
            'Audit Logs',
            'SLA Guarantee'
        ],
    },
];
