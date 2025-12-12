import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { MarketplacePaymentService } from '@/lib/marketplace-payment-service';

/**
 * GET /api/developer/connect
 * Generate Stripe Connect onboarding URL
 */
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if developer
        const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('is_developer, stripe_connect_account_id')
            .eq('user_id', session.user.id)
            .single();

        if (!subscription?.is_developer) {
            return NextResponse.json({ error: 'Not a developer' }, { status: 403 });
        }

        // Create or retrieve Stripe Connect account
        let accountId = subscription.stripe_connect_account_id;

        if (!accountId) {
            const { accountId: newAccountId, onboardingUrl } = await MarketplacePaymentService.createConnectAccount(
                session.user.id,
                session.user.email!
            );

            // Save account ID
            await supabase
                .from('user_subscriptions')
                .update({ stripe_connect_account_id: newAccountId })
                .eq('user_id', session.user.id);

            return NextResponse.json({ url: onboardingUrl });
        }

        // Check if account needs re-onboarding
        const isComplete = await MarketplacePaymentService.checkConnectAccountStatus(accountId);

        if (isComplete) {
            return NextResponse.json({ message: 'Account already connected' });
        }

        // Generate new onboarding link
        const { onboardingUrl } = await MarketplacePaymentService.createConnectAccount(
            session.user.id,
            session.user.email!
        );

        return NextResponse.json({ url: onboardingUrl });
    } catch (error: any) {
        console.error('Stripe Connect error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
