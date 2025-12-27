import { supabase } from "@/lib/supabase";

export interface Workspace {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    isPublic: boolean;
    settings: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    role: 'owner' | 'admin' | 'member' | 'viewer';
    invitedAt: string;
}

export interface WorkspaceBot {
    id: string;
    workspaceId: string;
    botId: string;
    addedBy: string;
    collaborationRate: number;
    isAvailable: boolean;
    capabilities: string[];
    addedAt: string;
    // Joined fields
    botName?: string;
    botDescription?: string;
    ownerName?: string;
}

// =====================================================
// WORKSPACE CRUD
// =====================================================

/**
 * Get all workspaces for a user (owned + member of)
 */
export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
    // Get workspaces user owns
    const { data: owned, error: ownedError } = await supabase
        .from('collaboration_workspaces')
        .select('*')
        .eq('owner_id', userId);

    // Get workspaces user is a member of
    const { data: memberOf, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId);

    if (ownedError) {
        console.error('Error fetching owned workspaces:', ownedError);
        throw new Error('Failed to fetch workspaces');
    }

    const workspaces: Workspace[] = (owned || []).map(mapWorkspace);

    // Fetch workspaces user is member of
    if (memberOf && memberOf.length > 0) {
        const memberWorkspaceIds = memberOf.map(m => m.workspace_id);
        const { data: memberWorkspaces } = await supabase
            .from('collaboration_workspaces')
            .select('*')
            .in('id', memberWorkspaceIds)
            .not('owner_id', 'eq', userId); // Exclude owned ones

        if (memberWorkspaces) {
            workspaces.push(...memberWorkspaces.map(mapWorkspace));
        }
    }

    return workspaces;
}

/**
 * Get a single workspace by ID
 */
export async function getWorkspace(workspaceId: string): Promise<Workspace | null> {
    const { data, error } = await supabase
        .from('collaboration_workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error('Failed to fetch workspace');
    }

    return mapWorkspace(data);
}

/**
 * Create a new workspace
 */
export async function createWorkspace(
    userId: string,
    name: string,
    description?: string,
    isPublic: boolean = false
): Promise<Workspace> {
    const { data, error } = await supabase
        .from('collaboration_workspaces')
        .insert({
            name,
            description: description || null,
            owner_id: userId,
            is_public: isPublic,
            settings: {}
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating workspace:', error);
        throw new Error('Failed to create workspace');
    }

    // Add owner as a member
    await supabase
        .from('workspace_members')
        .insert({
            workspace_id: data.id,
            user_id: userId,
            role: 'owner'
        });

    return mapWorkspace(data);
}

/**
 * Update a workspace
 */
export async function updateWorkspace(
    workspaceId: string,
    updates: Partial<Pick<Workspace, 'name' | 'description' | 'isPublic' | 'settings'>>
): Promise<Workspace> {
    const { data, error } = await supabase
        .from('collaboration_workspaces')
        .update({
            name: updates.name,
            description: updates.description,
            is_public: updates.isPublic,
            settings: updates.settings,
            updated_at: new Date().toISOString()
        })
        .eq('id', workspaceId)
        .select()
        .single();

    if (error) {
        throw new Error('Failed to update workspace');
    }

    return mapWorkspace(data);
}

/**
 * Delete a workspace
 */
export async function deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('collaboration_workspaces')
        .delete()
        .eq('id', workspaceId)
        .eq('owner_id', userId);

    if (error) {
        throw new Error('Failed to delete workspace');
    }
}

// =====================================================
// WORKSPACE MEMBERS
// =====================================================

/**
 * Get members of a workspace
 */
export async function getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId);

    if (error) {
        throw new Error('Failed to fetch workspace members');
    }

    return (data || []).map(m => ({
        id: m.id,
        workspaceId: m.workspace_id,
        userId: m.user_id,
        role: m.role,
        invitedAt: m.invited_at
    }));
}

/**
 * Add a member to workspace
 */
export async function addWorkspaceMember(
    workspaceId: string,
    userId: string,
    role: 'admin' | 'member' | 'viewer' = 'member'
): Promise<void> {
    const { error } = await supabase
        .from('workspace_members')
        .insert({
            workspace_id: workspaceId,
            user_id: userId,
            role
        });

    if (error) {
        if (error.code === '23505') {
            throw new Error('User is already a member');
        }
        throw new Error('Failed to add member');
    }
}

/**
 * Remove a member from workspace
 */
export async function removeWorkspaceMember(
    workspaceId: string,
    userId: string
): Promise<void> {
    const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId);

    if (error) {
        throw new Error('Failed to remove member');
    }
}

// =====================================================
// WORKSPACE BOTS
// =====================================================

/**
 * Get bots in a workspace
 */
export async function getWorkspaceBots(workspaceId: string): Promise<WorkspaceBot[]> {
    const { data, error } = await supabase
        .from('workspace_bots')
        .select(`
            *,
            bot:bots(id, name, description, user_id)
        `)
        .eq('workspace_id', workspaceId)
        .eq('is_available', true);

    if (error) {
        console.error('Error fetching workspace bots:', error);
        throw new Error('Failed to fetch workspace bots');
    }

    return (data || []).map(wb => ({
        id: wb.id,
        workspaceId: wb.workspace_id,
        botId: wb.bot_id,
        addedBy: wb.added_by,
        collaborationRate: wb.collaboration_rate,
        isAvailable: wb.is_available,
        capabilities: wb.capabilities || [],
        addedAt: wb.added_at,
        botName: wb.bot?.name,
        botDescription: wb.bot?.description,
    }));
}

/**
 * Add a bot to workspace
 */
export async function addBotToWorkspace(
    workspaceId: string,
    botId: string,
    addedBy: string,
    collaborationRate: number = 5,
    capabilities: string[] = []
): Promise<WorkspaceBot> {
    const { data, error } = await supabase
        .from('workspace_bots')
        .insert({
            workspace_id: workspaceId,
            bot_id: botId,
            added_by: addedBy,
            collaboration_rate: collaborationRate,
            is_available: true,
            capabilities
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new Error('Bot is already in this workspace');
        }
        throw new Error('Failed to add bot to workspace');
    }

    return {
        id: data.id,
        workspaceId: data.workspace_id,
        botId: data.bot_id,
        addedBy: data.added_by,
        collaborationRate: data.collaboration_rate,
        isAvailable: data.is_available,
        capabilities: data.capabilities || [],
        addedAt: data.added_at
    };
}

/**
 * Update bot settings in workspace
 */
export async function updateWorkspaceBot(
    workspaceId: string,
    botId: string,
    updates: { collaborationRate?: number; isAvailable?: boolean; capabilities?: string[] }
): Promise<void> {
    const { error } = await supabase
        .from('workspace_bots')
        .update({
            collaboration_rate: updates.collaborationRate,
            is_available: updates.isAvailable,
            capabilities: updates.capabilities
        })
        .eq('workspace_id', workspaceId)
        .eq('bot_id', botId);

    if (error) {
        throw new Error('Failed to update workspace bot');
    }
}

/**
 * Remove a bot from workspace
 */
export async function removeBotFromWorkspace(
    workspaceId: string,
    botId: string
): Promise<void> {
    const { error } = await supabase
        .from('workspace_bots')
        .delete()
        .eq('workspace_id', workspaceId)
        .eq('bot_id', botId);

    if (error) {
        throw new Error('Failed to remove bot from workspace');
    }
}

/**
 * Find available bots by capabilities
 */
export async function findCollaborators(
    workspaceId: string,
    requiredCapabilities?: string[]
): Promise<WorkspaceBot[]> {
    let query = supabase
        .from('workspace_bots')
        .select(`
            *,
            bot:bots(id, name, description, user_id)
        `)
        .eq('workspace_id', workspaceId)
        .eq('is_available', true);

    if (requiredCapabilities && requiredCapabilities.length > 0) {
        query = query.overlaps('capabilities', requiredCapabilities);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error('Failed to find collaborators');
    }

    return (data || []).map(wb => ({
        id: wb.id,
        workspaceId: wb.workspace_id,
        botId: wb.bot_id,
        addedBy: wb.added_by,
        collaborationRate: wb.collaboration_rate,
        isAvailable: wb.is_available,
        capabilities: wb.capabilities || [],
        addedAt: wb.added_at,
        botName: wb.bot?.name,
        botDescription: wb.bot?.description,
    }));
}

// =====================================================
// HELPERS
// =====================================================

function mapWorkspace(data: any): Workspace {
    return {
        id: data.id,
        name: data.name,
        description: data.description,
        ownerId: data.owner_id,
        isPublic: data.is_public,
        settings: data.settings || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at
    };
}
