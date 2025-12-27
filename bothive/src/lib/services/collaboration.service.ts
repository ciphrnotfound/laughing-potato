import { supabase } from "@/lib/supabase";
import { spendCredits, addCredits } from "./credits.service";

export interface BotCollaboration {
    id: string;
    workspaceId: string | null;
    requesterBotId: string;
    helperBotId: string;
    requesterUserId: string;
    helperUserId: string;
    taskDescription: string | null;
    hcOffered: number;
    hcPaid: number | null;
    status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled';
    result: any;
    errorMessage: string | null;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
    // Joined fields
    requesterBotName?: string;
    helperBotName?: string;
}

// =====================================================
// COLLABORATION LIFECYCLE
// =====================================================

/**
 * Request a bot collaboration
 * The requester pays upfront (escrow)
 */
export async function requestCollaboration(params: {
    workspaceId?: string;
    requesterBotId: string;
    helperBotId: string;
    requesterUserId: string;
    taskDescription: string;
    hcOffered: number;
}): Promise<BotCollaboration> {
    const { workspaceId, requesterBotId, helperBotId, requesterUserId, taskDescription, hcOffered } = params;

    // Get helper bot owner
    const { data: helperBot, error: botError } = await supabase
        .from('bots')
        .select('user_id')
        .eq('id', helperBotId)
        .single();

    if (botError || !helperBot) {
        throw new Error('Helper bot not found');
    }

    const helperUserId = helperBot.user_id;

    // Deduct credits from requester (escrow)
    const spent = await spendCredits(
        requesterUserId,
        hcOffered,
        'collaboration_escrow',
        `Collaboration request with bot`,
        { helper_bot_id: helperBotId, requester_bot_id: requesterBotId }
    );

    if (!spent) {
        throw new Error('Insufficient credits');
    }

    // Create collaboration record
    const { data, error } = await supabase
        .from('bot_collaborations')
        .insert({
            workspace_id: workspaceId || null,
            requester_bot_id: requesterBotId,
            helper_bot_id: helperBotId,
            requester_user_id: requesterUserId,
            helper_user_id: helperUserId,
            task_description: taskDescription,
            hc_offered: hcOffered,
            status: 'pending'
        })
        .select()
        .single();

    if (error) {
        // Refund on failure
        await addCredits(
            requesterUserId,
            hcOffered,
            'collaboration_refund',
            'Collaboration request failed, credits refunded'
        );
        throw new Error('Failed to create collaboration request');
    }

    return mapCollaboration(data);
}

/**
 * Start a collaboration (mark as active)
 */
export async function startCollaboration(collaborationId: string): Promise<BotCollaboration> {
    const { data, error } = await supabase
        .from('bot_collaborations')
        .update({
            status: 'active',
            started_at: new Date().toISOString()
        })
        .eq('id', collaborationId)
        .eq('status', 'pending')
        .select()
        .single();

    if (error) {
        throw new Error('Failed to start collaboration');
    }

    return mapCollaboration(data);
}

/**
 * Complete a collaboration successfully
 * Credits are released to the helper bot owner
 */
export async function completeCollaboration(
    collaborationId: string,
    result: any
): Promise<BotCollaboration> {
    // Get collaboration details
    const { data: collab, error: fetchError } = await supabase
        .from('bot_collaborations')
        .select('*')
        .eq('id', collaborationId)
        .single();

    if (fetchError || !collab) {
        throw new Error('Collaboration not found');
    }

    if (collab.status !== 'active') {
        throw new Error('Collaboration is not active');
    }

    // Pay the helper bot owner (minus platform fee)
    const platformFee = Math.floor(collab.hc_offered * 0.1); // 10% fee
    const helperEarnings = collab.hc_offered - platformFee;

    await addCredits(
        collab.helper_user_id,
        helperEarnings,
        'collaboration_earning',
        `Collaboration completed`,
        { collaboration_id: collaborationId, requester_bot_id: collab.requester_bot_id }
    );

    // Update collaboration record
    const { data, error } = await supabase
        .from('bot_collaborations')
        .update({
            status: 'completed',
            hc_paid: helperEarnings,
            result,
            completed_at: new Date().toISOString()
        })
        .eq('id', collaborationId)
        .select()
        .single();

    if (error) {
        throw new Error('Failed to complete collaboration');
    }

    return mapCollaboration(data);
}

/**
 * Fail a collaboration and refund the requester
 */
export async function failCollaboration(
    collaborationId: string,
    errorMessage: string
): Promise<BotCollaboration> {
    // Get collaboration details
    const { data: collab, error: fetchError } = await supabase
        .from('bot_collaborations')
        .select('*')
        .eq('id', collaborationId)
        .single();

    if (fetchError || !collab) {
        throw new Error('Collaboration not found');
    }

    // Refund the requester
    await addCredits(
        collab.requester_user_id,
        collab.hc_offered,
        'collaboration_refund',
        `Collaboration failed: ${errorMessage}`,
        { collaboration_id: collaborationId }
    );

    // Update collaboration record
    const { data, error } = await supabase
        .from('bot_collaborations')
        .update({
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString()
        })
        .eq('id', collaborationId)
        .select()
        .single();

    if (error) {
        throw new Error('Failed to update collaboration status');
    }

    return mapCollaboration(data);
}

/**
 * Cancel a pending collaboration and refund
 */
export async function cancelCollaboration(
    collaborationId: string,
    userId: string
): Promise<void> {
    // Get collaboration details
    const { data: collab, error: fetchError } = await supabase
        .from('bot_collaborations')
        .select('*')
        .eq('id', collaborationId)
        .eq('requester_user_id', userId)
        .eq('status', 'pending')
        .single();

    if (fetchError || !collab) {
        throw new Error('Collaboration not found or cannot be cancelled');
    }

    // Refund the requester
    await addCredits(
        userId,
        collab.hc_offered,
        'collaboration_refund',
        'Collaboration cancelled',
        { collaboration_id: collaborationId }
    );

    // Update status
    await supabase
        .from('bot_collaborations')
        .update({ status: 'cancelled' })
        .eq('id', collaborationId);
}

// =====================================================
// QUERIES
// =====================================================

/**
 * Get collaboration by ID
 */
export async function getCollaboration(collaborationId: string): Promise<BotCollaboration | null> {
    const { data, error } = await supabase
        .from('bot_collaborations')
        .select(`
            *,
            requester_bot:bots!requester_bot_id(name),
            helper_bot:bots!helper_bot_id(name)
        `)
        .eq('id', collaborationId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error('Failed to fetch collaboration');
    }

    return {
        ...mapCollaboration(data),
        requesterBotName: data.requester_bot?.name,
        helperBotName: data.helper_bot?.name
    };
}

/**
 * Get user's collaboration history
 */
export async function getUserCollaborations(
    userId: string,
    role: 'requester' | 'helper' | 'all' = 'all',
    limit: number = 20
): Promise<BotCollaboration[]> {
    let query = supabase
        .from('bot_collaborations')
        .select(`
            *,
            requester_bot:bots!requester_bot_id(name),
            helper_bot:bots!helper_bot_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (role === 'requester') {
        query = query.eq('requester_user_id', userId);
    } else if (role === 'helper') {
        query = query.eq('helper_user_id', userId);
    } else {
        query = query.or(`requester_user_id.eq.${userId},helper_user_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error('Failed to fetch collaborations');
    }

    return (data || []).map(c => ({
        ...mapCollaboration(c),
        requesterBotName: c.requester_bot?.name,
        helperBotName: c.helper_bot?.name
    }));
}

/**
 * Get active collaborations for a workspace
 */
export async function getWorkspaceCollaborations(
    workspaceId: string,
    status?: 'pending' | 'active' | 'completed'
): Promise<BotCollaboration[]> {
    let query = supabase
        .from('bot_collaborations')
        .select(`
            *,
            requester_bot:bots!requester_bot_id(name),
            helper_bot:bots!helper_bot_id(name)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error('Failed to fetch workspace collaborations');
    }

    return (data || []).map(c => ({
        ...mapCollaboration(c),
        requesterBotName: c.requester_bot?.name,
        helperBotName: c.helper_bot?.name
    }));
}

// =====================================================
// HELPERS
// =====================================================

function mapCollaboration(data: any): BotCollaboration {
    return {
        id: data.id,
        workspaceId: data.workspace_id,
        requesterBotId: data.requester_bot_id,
        helperBotId: data.helper_bot_id,
        requesterUserId: data.requester_user_id,
        helperUserId: data.helper_user_id,
        taskDescription: data.task_description,
        hcOffered: data.hc_offered,
        hcPaid: data.hc_paid,
        status: data.status,
        result: data.result,
        errorMessage: data.error_message,
        createdAt: data.created_at,
        startedAt: data.started_at,
        completedAt: data.completed_at
    };
}
