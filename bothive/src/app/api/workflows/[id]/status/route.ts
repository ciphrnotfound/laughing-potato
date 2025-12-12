import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/workflows/[id]/status - Update workflow status
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id } = await params;
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        if (!status || !['draft', 'active', 'paused'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be: draft, active, or paused' },
                { status: 400 }
            );
        }

        const { data: workflow, error } = await supabase
            .from('workflows')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating workflow status:', error);
            return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
        }

        return NextResponse.json({ workflow });
    } catch (error) {
        console.error('Error in PATCH /api/workflows/[id]/status:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
