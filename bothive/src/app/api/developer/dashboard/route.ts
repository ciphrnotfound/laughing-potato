import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/developer/dashboard
 * Get developer dashboard data
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

        // Check if user is a developer
        const { data: subscription } = await supabase
            .from('user_subscriptions')
            .select('is_developer, payout_enabled')
            .eq('user_id', session.user.id)
            .single();

        if (!subscription) {
            return NextResponse.json({
                isDeveloper: false,
                isConnected: false,
            });
        }

        if (!subscription.is_developer) {
            return NextResponse.json({
                isDeveloper: false,
                isConnected: false,
            });
        }

        // Get integrations
        const { data: integrations } = await supabase
            .from('marketplace_integrations')
            .select('id, name, status, active_installs, total_revenue, rating, created_at')
            .eq('developer_id', session.user.id)
            .order('created_at', { ascending: false });

        // Calculate stats
        const stats = {
            totalIntegrations: integrations?.length || 0,
            activeInstalls: integrations?.reduce((sum, i) => sum + (i.active_installs || 0), 0) || 0,
            totalRevenue: integrations?.reduce((sum, i) => sum + (i.total_revenue || 0), 0) || 0,
            pendingEarnings: 0, // TODO: Calculate from revenue_transactions
        };

        return NextResponse.json({
            isDeveloper: true,
            isConnected: subscription.payout_enabled || false,
            stats,
            integrations: integrations || [],
        });
    } catch (error: any) {
        console.error('Developer dashboard error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
