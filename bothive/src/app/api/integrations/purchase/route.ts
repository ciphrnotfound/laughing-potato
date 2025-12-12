import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/lib/paystack-service';

export async function POST(req: NextRequest) {
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

        // 1. Auth Check
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { integrationId, email } = body;

        if (!integrationId) {
            return NextResponse.json({ error: 'Missing integration ID' }, { status: 400 });
        }

        // 2. Get Integration Details
        const { data: integration, error: dbError } = await supabase
            .from('marketplace_integrations')
            .select('*')
            .eq('id', integrationId)
            .single();

        if (dbError || !integration) {
            return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
        }

        // 3. Handle Free Integration
        if (integration.pricing_model === 'free') {
            // Install immediately
            await supabase
                .from('user_integration_purchases')
                .upsert({
                    user_id: user.id,
                    integration_id: integrationId,
                    purchase_type: 'free',
                    payment_status: 'completed',
                    is_installed: true,
                    installed_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id,integration_id'
                });

            return NextResponse.json({ success: true });
        }

        // 4. Handle Paid Integration (Paystack)
        const amountInKobo = Math.round(integration.price * 100);

        // Metadata to track the purchase in webhook
        const metadata = {
            user_id: user.id,
            integration_id: integrationId,
            user_tier: 'free', // TODO: Get actual user tier
        };

        const transaction = await PaystackService.initializeTransaction({
            email: email || user.email,
            amount: amountInKobo,
            currency: integration.currency || 'NGN',
            metadata,
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/integrations/success?integration_id=${integrationId}`,
        });

        return NextResponse.json({
            success: true,
            authorization_url: transaction.authorization_url,
            reference: transaction.reference
        });

    } catch (error: any) {
        console.error('Purchase error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
