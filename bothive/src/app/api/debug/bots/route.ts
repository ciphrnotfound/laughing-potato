import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerComponentClient({ cookies: () => cookieStore as any });
        const { data: { user } } = await supabase.auth.getUser();

        // 1. Get raw count
        const { count, error: countError } = await supabase
            .from('bots')
            .select('*', { count: 'exact', head: true });

        // 2. Get first 10 bots
        const { data: bots, error: fetchError } = await supabase
            .from('bots')
            .select('id, name, user_id, is_public_for_hire, collaboration_rate')
            .limit(10);

        return NextResponse.json({
            currentUser: user?.id || 'No User',
            totalBots: count,
            botsSample: bots,
            errors: { countError, fetchError }
        });

    } catch (error) {
        return NextResponse.json({ error: error });
    }
}
