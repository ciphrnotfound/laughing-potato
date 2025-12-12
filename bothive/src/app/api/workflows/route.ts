import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/workflows - List user's workflows
export async function GET(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: workflows, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching workflows:', error);
            return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
        }

        return NextResponse.json({ workflows: workflows || [] });
    } catch (error) {
        console.error('Error in GET /api/workflows:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/workflows - Create new workflow
export async function POST(request: NextRequest) {
    try {
        const supabase = createRouteHandlerClient({ cookies });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, configuration, trigger_type, schedule_cron } = body;

        if (!name) {
            return NextResponse.json({ error: 'Workflow name is required' }, { status: 400 });
        }

        const { data: workflow, error } = await supabase
            .from('workflows')
            .insert({
                user_id: user.id,
                name,
                description,
                configuration: configuration || { nodes: [], edges: [] },
                trigger_type: trigger_type || 'manual',
                schedule_cron,
                status: 'draft',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating workflow:', error);
            return NextResponse.json({ error: 'Failed to create workflow' }, { status: 500 });
        }

        return NextResponse.json({ workflow }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/workflows:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
