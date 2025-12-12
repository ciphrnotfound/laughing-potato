import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * POST /api/developer/register  
 * Register user as a developer
 */
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

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Create or update user subscription record
        const { data, error } = await supabase
            .from('user_subscriptions')
            .upsert({
                user_id: session.user.id,
                is_developer: true,
                tier: 'free',
            }, {
                onConflict: 'user_id',
            })
            .select()
            .single();

        if (error) {
            console.error('Developer registration error:', error);
            return NextResponse.json({ error: 'Failed to register as developer' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully registered as a developer',
        });
    } catch (error: any) {
        console.error('Developer registration error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
