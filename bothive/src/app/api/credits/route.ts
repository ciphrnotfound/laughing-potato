import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Default packages when database isn't set up yet
const DEFAULT_PACKAGES = [
    { id: '1', name: 'Starter', description: 'Get started with BotHive', hcAmount: 500, priceNgn: 500000, bonusPercent: 0, displayOrder: 1 },
    { id: '2', name: 'Builder', description: 'For regular bot builders', hcAmount: 2200, priceNgn: 2000000, bonusPercent: 10, displayOrder: 2 },
    { id: '3', name: 'Pro', description: 'Power users and teams', hcAmount: 6000, priceNgn: 5000000, bonusPercent: 20, displayOrder: 3 },
    { id: '4', name: 'Enterprise', description: 'Large scale operations', hcAmount: 25000, priceNgn: 20000000, bonusPercent: 25, displayOrder: 4 },
];

const DEFAULT_MODELS = [
    { id: '1', modelName: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo', hcCost: 2, tier: 'fast', isActive: true },
    { id: '2', modelName: 'gpt-4o-mini', displayName: 'GPT-4o Mini', hcCost: 3, tier: 'fast', isActive: true },
    { id: '3', modelName: 'gpt-4-turbo', displayName: 'GPT-4 Turbo', hcCost: 8, tier: 'standard', isActive: true },
    { id: '4', modelName: 'gpt-4o', displayName: 'GPT-4o', hcCost: 10, tier: 'standard', isActive: true },
    { id: '5', modelName: 'gpt-4', displayName: 'GPT-4', hcCost: 15, tier: 'premium', isActive: true },
];

/**
 * GET /api/credits
 * Returns user's credit balance, packages, and model pricing
 */
export async function GET(request: NextRequest) {
    try {
        // In Next.js 15, cookies() returns a Promise
        const cookieStore = await cookies();
        const supabase = createServerComponentClient({ cookies: () => cookieStore });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const include = searchParams.get('include')?.split(',') || ['balance'];

        const response: Record<string, any> = {};

        // Try to get balance from wallets table, fallback to 100 HC
        if (include.includes('balance') || include.includes('all')) {
            try {
                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('balance, currency, last_updated_at')
                    .eq('user_id', user.id)
                    .single();

                response.balance = wallet ? {
                    balance: Number(wallet.balance),
                    currency: wallet.currency,
                    lastUpdated: wallet.last_updated_at
                } : {
                    balance: 100,
                    currency: 'HC',
                    lastUpdated: new Date().toISOString()
                };
            } catch {
                response.balance = {
                    balance: 100,
                    currency: 'HC',
                    lastUpdated: new Date().toISOString()
                };
            }
        }

        // Try to get transactions, fallback to empty array
        if (include.includes('transactions') || include.includes('all')) {
            try {
                const { data: wallet } = await supabase
                    .from('wallets')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (wallet) {
                    const limit = parseInt(searchParams.get('limit') || '20');
                    const offset = parseInt(searchParams.get('offset') || '0');

                    const { data: transactions } = await supabase
                        .from('transactions')
                        .select('*')
                        .eq('wallet_id', wallet.id)
                        .order('created_at', { ascending: false })
                        .range(offset, offset + limit - 1);

                    response.transactions = (transactions || []).map((tx: any) => ({
                        id: tx.id,
                        amount: Number(tx.amount),
                        type: tx.type,
                        description: tx.description,
                        metadata: tx.metadata || {},
                        createdAt: tx.created_at
                    }));
                } else {
                    response.transactions = [];
                }
            } catch {
                response.transactions = [];
            }
        }

        // Try to get packages from database, fallback to defaults
        if (include.includes('packages') || include.includes('all')) {
            try {
                const { data: packages } = await supabase
                    .from('credit_packages')
                    .select('*')
                    .eq('is_active', true)
                    .order('display_order', { ascending: true });

                response.packages = packages && packages.length > 0
                    ? packages.map((pkg: any) => ({
                        id: pkg.id,
                        name: pkg.name,
                        description: pkg.description,
                        hcAmount: pkg.hc_amount,
                        priceNgn: pkg.price_ngn,
                        bonusPercent: pkg.bonus_percent,
                        displayOrder: pkg.display_order
                    }))
                    : DEFAULT_PACKAGES;
            } catch {
                response.packages = DEFAULT_PACKAGES;
            }
        }

        // Try to get model pricing from database, fallback to defaults
        if (include.includes('models') || include.includes('all')) {
            try {
                const { data: models } = await supabase
                    .from('model_pricing')
                    .select('*')
                    .eq('is_active', true)
                    .order('hc_cost', { ascending: true });

                response.models = models && models.length > 0
                    ? models.map((m: any) => ({
                        id: m.id,
                        modelName: m.model_name,
                        displayName: m.display_name,
                        hcCost: m.hc_cost,
                        tier: m.tier,
                        isActive: m.is_active
                    }))
                    : DEFAULT_MODELS;
            } catch {
                response.models = DEFAULT_MODELS;
            }
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Credits API error:', error);
        // Return sensible defaults even on error
        return NextResponse.json({
            balance: { balance: 100, currency: 'HC', lastUpdated: new Date().toISOString() },
            transactions: [],
            packages: DEFAULT_PACKAGES,
            models: DEFAULT_MODELS
        });
    }
}
