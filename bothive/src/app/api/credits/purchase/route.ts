import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { PaystackService } from '@/lib/paystack-service';

// Default packages when database isn't set up yet
const DEFAULT_PACKAGES = [
    { id: '1', name: 'Starter', description: 'Get started with BotHive', hcAmount: 500, priceNgn: 500000, bonusPercent: 0 },
    { id: '2', name: 'Builder', description: 'For regular bot builders', hcAmount: 2200, priceNgn: 2000000, bonusPercent: 10 },
    { id: '3', name: 'Pro', description: 'Power users and teams', hcAmount: 6000, priceNgn: 5000000, bonusPercent: 20 },
    { id: '4', name: 'Enterprise', description: 'Large scale operations', hcAmount: 25000, priceNgn: 20000000, bonusPercent: 25 },
];

/**
 * POST /api/credits/purchase
 * Initiates a Paystack payment for credit package purchase
 */
export async function POST(request: NextRequest) {
    try {
        // In Next.js 15, cookies() returns a Promise
        const cookieStore = await cookies();
        const supabase = createServerComponentClient({ cookies: () => cookieStore });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packageId } = await request.json();

        if (!packageId) {
            return NextResponse.json({ error: 'Package ID required' }, { status: 400 });
        }

        // Try to get packages from database, fallback to defaults
        let packages = DEFAULT_PACKAGES;
        try {
            const { data: dbPackages } = await supabase
                .from('credit_packages')
                .select('*')
                .eq('is_active', true);

            if (dbPackages && dbPackages.length > 0) {
                packages = dbPackages.map((pkg: any) => ({
                    id: pkg.id,
                    name: pkg.name,
                    description: pkg.description,
                    hcAmount: pkg.hc_amount,
                    priceNgn: pkg.price_ngn,
                    bonusPercent: pkg.bonus_percent
                }));
            }
        } catch {
            // Use defaults
        }

        const selectedPackage = packages.find(p => p.id === packageId);

        if (!selectedPackage) {
            return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
        }

        // Initialize Paystack transaction
        const transaction = await PaystackService.initializeTransaction({
            email: user.email!,
            amount: selectedPackage.priceNgn,
            currency: 'NGN',
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/wallet?success=true`,
            metadata: {
                user_id: user.id,
                package_id: packageId,
                hc_amount: selectedPackage.hcAmount,
                type: 'credit_purchase'
            }
        });

        return NextResponse.json({
            authorization_url: transaction.authorization_url,
            reference: transaction.reference,
            package: selectedPackage
        });
    } catch (error) {
        console.error('Purchase credits error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize payment' },
            { status: 500 }
        );
    }
}
