import { supabase } from "@/lib/supabase";

export interface CreditBalance {
    balance: number;
    currency: string;
    lastUpdated: string;
}

export interface CreditTransaction {
    id: string;
    amount: number;
    type: string;
    description: string | null;
    metadata: Record<string, any>;
    createdAt: string;
}

export interface ModelPricing {
    id: string;
    modelName: string;
    displayName: string;
    hcCost: number;
    tier: 'fast' | 'standard' | 'premium' | 'frontier';
    isActive: boolean;
}

export interface CreditPackage {
    id: string;
    name: string;
    description: string;
    hcAmount: number;
    priceNgn: number;
    bonusPercent: number;
    displayOrder: number;
}

// =====================================================
// BALANCE OPERATIONS
// =====================================================

/**
 * Get user's HiveCredits balance
 */
export async function getBalance(userId: string): Promise<CreditBalance> {
    const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency, last_updated_at')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching balance:', error);
        throw new Error('Failed to fetch balance');
    }

    // If no wallet exists, return 0 balance
    if (!data) {
        return {
            balance: 0,
            currency: 'HC',
            lastUpdated: new Date().toISOString()
        };
    }

    return {
        balance: Number(data.balance),
        currency: data.currency,
        lastUpdated: data.last_updated_at
    };
}

/**
 * Add credits to user's wallet (for purchases, rewards, etc.)
 */
export async function addCredits(
    userId: string,
    amount: number,
    type: string,
    description?: string,
    metadata?: Record<string, any>
): Promise<boolean> {
    const { data, error } = await supabase.rpc('add_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_description: description || null,
        p_metadata: metadata || {}
    });

    if (error) {
        console.error('Error adding credits:', error);
        throw new Error('Failed to add credits');
    }

    return data === true;
}

/**
 * Spend credits from user's wallet (for bot runs, collaborations, etc.)
 */
export async function spendCredits(
    userId: string,
    amount: number,
    type: string,
    description?: string,
    metadata?: Record<string, any>
): Promise<boolean> {
    const { data, error } = await supabase.rpc('spend_user_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_description: description || null,
        p_metadata: metadata || {}
    });

    if (error) {
        console.error('Error spending credits:', error);
        throw new Error('Failed to spend credits');
    }

    // Returns false if insufficient balance
    return data === true;
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId: string, amount: number): Promise<boolean> {
    const { balance } = await getBalance(userId);
    return balance >= amount;
}

// =====================================================
// TRANSACTION HISTORY
// =====================================================

/**
 * Get user's transaction history
 */
export async function getTransactionHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
): Promise<CreditTransaction[]> {
    // First get the wallet ID
    const { data: wallet } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (!wallet) {
        return [];
    }

    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching transactions:', error);
        throw new Error('Failed to fetch transaction history');
    }

    return (data || []).map(tx => ({
        id: tx.id,
        amount: Number(tx.amount),
        type: tx.type,
        description: tx.description,
        metadata: tx.metadata || {},
        createdAt: tx.created_at
    }));
}

// =====================================================
// MODEL PRICING
// =====================================================

/**
 * Get all active model pricing
 */
export async function getModelPricing(): Promise<ModelPricing[]> {
    const { data, error } = await supabase
        .from('model_pricing')
        .select('*')
        .eq('is_active', true)
        .order('hc_cost', { ascending: true });

    if (error) {
        console.error('Error fetching model pricing:', error);
        throw new Error('Failed to fetch model pricing');
    }

    return (data || []).map(m => ({
        id: m.id,
        modelName: m.model_name,
        displayName: m.display_name,
        hcCost: m.hc_cost,
        tier: m.tier,
        isActive: m.is_active
    }));
}

/**
 * Get cost for a specific model
 */
export async function getModelCost(modelName: string): Promise<number> {
    const { data, error } = await supabase
        .from('model_pricing')
        .select('hc_cost')
        .eq('model_name', modelName)
        .eq('is_active', true)
        .single();

    if (error || !data) {
        // Default to standard cost if model not found
        console.warn(`Model ${modelName} not found in pricing, using default`);
        return 5;
    }

    return data.hc_cost;
}

// =====================================================
// CREDIT PACKAGES
// =====================================================

/**
 * Get available credit packages for purchase
 */
export async function getCreditPackages(): Promise<CreditPackage[]> {
    const { data, error } = await supabase
        .from('credit_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching credit packages:', error);
        throw new Error('Failed to fetch credit packages');
    }

    return (data || []).map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        hcAmount: pkg.hc_amount,
        priceNgn: pkg.price_ngn,
        bonusPercent: pkg.bonus_percent,
        displayOrder: pkg.display_order
    }));
}

// =====================================================
// WALLET INITIALIZATION
// =====================================================

/**
 * Initialize wallet for new user with starting credits
 */
export async function initializeWallet(userId: string, startingCredits: number = 100): Promise<void> {
    // Check if wallet already exists
    const { data: existing } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', userId)
        .single();

    if (existing) {
        return; // Wallet already exists
    }

    // Create wallet with starting credits
    const { error } = await supabase
        .from('wallets')
        .insert({
            user_id: userId,
            balance: startingCredits,
            currency: 'HC'
        });

    if (error) {
        console.error('Error creating wallet:', error);
        throw new Error('Failed to initialize wallet');
    }

    // Log the initial credit bonus
    await addCredits(userId, startingCredits, 'signup_bonus', 'Welcome to BotHive! Here are your starting credits.');
}
