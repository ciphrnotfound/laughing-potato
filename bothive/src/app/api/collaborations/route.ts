import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Default mock bots when database isn't set up yet
const MOCK_BOTS = [
    { id: '1', name: 'Research Pro', description: 'Deep web research and fact-checking', capabilities: ['research', 'analysis'], collaborationRate: 8, ownerName: 'AI Labs' },
    { id: '2', name: 'Data Cruncher', description: 'Statistical analysis and visualization', capabilities: ['data', 'math'], collaborationRate: 10, ownerName: 'DataCorp' },
    { id: '3', name: 'Content Wizard', description: 'Blog posts, copy, and creative writing', capabilities: ['writing', 'creative'], collaborationRate: 6, ownerName: 'WriteFlow' },
    { id: '4', name: 'Code Assistant', description: 'Code review, debugging, and generation', capabilities: ['coding', 'debug'], collaborationRate: 12, ownerName: 'DevTools' },
    { id: '5', name: 'Social Strategist', description: 'Social media strategy and scheduling', capabilities: ['social', 'marketing'], collaborationRate: 7, ownerName: 'GrowthLab' },
];

/**
 * GET /api/collaborations
 * Returns available bots and user's collaboration history
 */
export async function GET(request: NextRequest) {
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
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const include = searchParams.get('include')?.split(',') || ['bots'];

        const response: Record<string, any> = {};

        // Get available bots directly from bots table (Monetization Supply Side)
        if (include.includes('bots') || include.includes('all')) {
            try {
                // Determine which bots to fetch
                // If 'my_bots' param is present, fetch user's bots
                const myBotsOnly = searchParams.get('scope') === 'my_bots';

                let query = supabase
                    .from('bots')
                    .select('id, name, description, user_id, is_public_for_hire, collaboration_rate, capabilities');

                if (myBotsOnly) {
                    query = query.eq('user_id', user.id);
                } else {
                    // Public marketplace: only public bots, excluding own (optional)
                    query = query.eq('is_public_for_hire', true);
                }

                console.log(`Fetching bots... Scope: ${myBotsOnly ? 'My Bots' : 'Public'}, User: ${user.id}`);
                const { data: bots, error: botError } = await query.limit(50);

                if (botError) {
                    console.error('Supabase Bot Fetch Error:', botError);
                } else {
                    console.log(`Fetched ${bots?.length || 0} bots`);
                }

                if (bots && bots.length > 0) {
                    response.bots = bots.map((b: any) => ({
                        id: b.id,
                        name: b.name,
                        description: b.description || '',
                        capabilities: b.capabilities || [],
                        collaborationRate: b.collaboration_rate || 5,
                        ownerName: 'BotHive User',
                        isPublic: b.is_public_for_hire
                    }));
                } else {
                    response.bots = myBotsOnly ? [] : MOCK_BOTS;
                }
            } catch (err) {
                console.error('Error fetching bots:', err);
                response.bots = MOCK_BOTS;
            }
        }

        // Get user's collaborations
        if (include.includes('collaborations') || include.includes('all')) {
            try {
                const { data: collabs } = await supabase
                    .from('bot_collaborations')
                    .select(`
                        id,
                        task_description,
                        hc_offered,
                        status,
                        created_at,
                        requester_bot:bots!requester_bot_id(name),
                        helper_bot:bots!helper_bot_id(name)
                    `)
                    .or(`requester_user_id.eq.${user.id},helper_user_id.eq.${user.id}`)
                    .order('created_at', { ascending: false })
                    .limit(20);

                if (collabs && collabs.length > 0) {
                    response.collaborations = collabs.map((c: any) => ({
                        id: c.id,
                        requesterBotName: c.requester_bot?.name || 'Unknown',
                        helperBotName: c.helper_bot?.name || 'Unknown',
                        taskDescription: c.task_description,
                        status: c.status,
                        hcOffered: c.hc_offered,
                        createdAt: c.created_at
                    }));
                } else {
                    response.collaborations = [];
                }
            } catch {
                response.collaborations = [];
            }
        }

        // Get stats
        if (include.includes('stats') || include.includes('all')) {
            try {
                // Count bots
                const { count: botCount } = await supabase
                    .from('workspace_bots')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_available', true);

                // Count user's active/completed collabs
                const { data: userCollabs } = await supabase
                    .from('bot_collaborations')
                    .select('status, hc_paid')
                    .or(`requester_user_id.eq.${user.id},helper_user_id.eq.${user.id}`);

                const active = userCollabs?.filter(c => c.status === 'active').length || 0;
                const completed = userCollabs?.filter(c => c.status === 'completed').length || 0;
                const earned = userCollabs?.reduce((sum, c) => sum + (c.hc_paid || 0), 0) || 0;

                response.stats = {
                    availableBots: botCount || MOCK_BOTS.length,
                    activeCollabs: active,
                    completedCollabs: completed,
                    totalEarned: earned
                };
            } catch {
                response.stats = {
                    availableBots: MOCK_BOTS.length,
                    activeCollabs: 0,
                    completedCollabs: 0,
                    totalEarned: 0
                };
            }
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Collaborations API error:', error);
        return NextResponse.json({
            bots: MOCK_BOTS,
            collaborations: [],
            stats: { availableBots: MOCK_BOTS.length, activeCollabs: 0, completedCollabs: 0, totalEarned: 0 }
        });
    }
}

/**
 * POST /api/collaborations
 * Request a new bot collaboration
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerComponentClient({ cookies: () => cookieStore as any });
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { requesterBotId, helperBotId, taskDescription, hcOffer } = await request.json();

        if (!requesterBotId || !helperBotId || !taskDescription || !hcOffer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get helper bot owner
        const { data: helperBot } = await supabase
            .from('bots')
            .select('user_id')
            .eq('id', helperBotId)
            .single();

        if (!helperBot) {
            return NextResponse.json({ error: 'Helper bot not found' }, { status: 404 });
        }

        // Check user has enough credits
        const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', user.id)
            .single();

        if (!wallet || wallet.balance < hcOffer) {
            return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
        }

        // Create collaboration record
        const { data: collab, error } = await supabase
            .from('bot_collaborations')
            .insert({
                requester_bot_id: requesterBotId,
                helper_bot_id: helperBotId,
                requester_user_id: user.id,
                helper_user_id: helperBot.user_id,
                task_description: taskDescription,
                hc_offered: hcOffer,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        // Deduct credits (escrow)
        await supabase.rpc('spend_user_credits', {
            p_user_id: user.id,
            p_amount: hcOffer,
            p_type: 'collaboration_escrow',
            p_description: `Collaboration request: ${taskDescription.slice(0, 50)}...`
        });

        return NextResponse.json({ success: true, collaboration: collab });
    } catch (error) {
        console.error('Create collaboration error:', error);
        return NextResponse.json({ error: 'Failed to create collaboration' }, { status: 500 });
    }
}
