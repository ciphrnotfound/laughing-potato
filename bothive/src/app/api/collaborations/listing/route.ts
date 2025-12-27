import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * POST /api/collaborations/listing
 * Update a bot's listing settings (monetization)
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerComponentClient({ cookies: () => cookieStore as any });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { botId, isPublic, rate, capabilities } = await request.json();

        if (!botId) {
            return NextResponse.json({ error: 'Bot ID is required' }, { status: 400 });
        }

        // Verify ownership
        const { data: bot } = await supabase
            .from('bots')
            .select('user_id')
            .eq('id', botId)
            .single();

        if (!bot || bot.user_id !== user.id) {
            return NextResponse.json({ error: 'Bot not found or unauthorized' }, { status: 404 });
        }

        // Update bot listing
        const { data: updatedBot, error } = await supabase
            .from('bots')
            .update({
                is_public_for_hire: isPublic,
                collaboration_rate: rate,
                capabilities: capabilities || []
            })
            .eq('id', botId)
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ success: true, bot: updatedBot });
    } catch (error) {
        console.error('Update listing error:', error);
        return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
    }
}
