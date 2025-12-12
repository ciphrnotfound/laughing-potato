import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: accounts, error } = await supabase
            .from('connected_accounts')
            .select('provider, metadata')
            .eq('user_id', user.id);

        if (error) {
            console.error('Error fetching connected accounts:', error);
            // Return empty list on error to not break the UI
            return NextResponse.json({ connected: [] });
        }

        // Map to a simple list of provider IDs
        const connected = accounts?.map(a => a.provider.toLowerCase()) || [];

        return NextResponse.json({ connected, accounts });
    } catch (error) {
        console.error('Error in GET /api/integrations/status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
