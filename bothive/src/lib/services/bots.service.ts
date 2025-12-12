import { supabase } from "@/lib/supabase";

export interface Bot {
    id: string;
    user_id: string;
    name: string;
    slug: string;
    description: string | null;
    hivelang_code: string | null;
    compiled_js: string | null;
    deployment_status: 'draft' | 'active' | 'paused' | 'archived';
    total_runs: number;
    last_run_at: string | null;
    created_at: string;
    updated_at: string;
    version: number;
    is_public: boolean;
    tags: string[] | null;
    icon_url: string | null;
}

export interface CreateBotInput {
    name: string;
    description?: string;
    hivelang_code?: string;
    is_public?: boolean;
    tags?: string[];
}

export interface UpdateBotInput {
    name?: string;
    description?: string;
    hivelang_code?: string;
    compiled_js?: string;
    deployment_status?: Bot['deployment_status'];
    is_public?: boolean;
    tags?: string[];
}

/**
 * Get all bots for a specific user
 */
export async function getUserBots(userId: string): Promise<Bot[]> {
    const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching user bots:', error);
        throw new Error(`Failed to fetch bots: ${error.message}`);
    }

    return (data || []) as Bot[];
}

/**
 * Get a single bot by ID
 */
export async function getBot(botId: string): Promise<Bot | null> {
    const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Bot not found
        }
        console.error('Error fetching bot:', error);
        throw new Error(`Failed to fetch bot: ${error.message}`);
    }

    return data as Bot;
}

/**
 * Get a bot by slug
 */
export async function getBotBySlug(slug: string, userId?: string): Promise<Bot | null> {
    let query = supabase
        .from('bots')
        .select('*')
        .eq('slug', slug);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching bot by slug:', error);
        throw new Error(`Failed to fetch bot: ${error.message}`);
    }

    return data as Bot;
}

/**
 * Create a new bot
 */
export async function createBot(userId: string, input: CreateBotInput): Promise<Bot> {
    // Generate slug from name
    const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const { data, error } = await supabase
        .from('bots')
        .insert({
            user_id: userId,
            name: input.name,
            slug,
            description: input.description || null,
            hivelang_code: input.hivelang_code || null,
            is_public: input.is_public || false,
            tags: input.tags || null,
            deployment_status: 'draft',
            total_runs: 0,
            version: 1
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating bot:', error);
        throw new Error(`Failed to create bot: ${error.message}`);
    }

    return data as Bot;
}

/**
 * Update an existing bot
 */
export async function updateBot(botId: string, userId: string, input: UpdateBotInput): Promise<Bot> {
    const updates: any = {
        ...input,
        updated_at: new Date().toISOString()
    };

    // If name is being updated, regenerate slug
    if (input.name) {
        updates.slug = input.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    const { data, error } = await supabase
        .from('bots')
        .update(updates)
        .eq('id', botId)
        .eq('user_id', userId) // Ensure user owns the bot
        .select()
        .single();

    if (error) {
        console.error('Error updating bot:', error);
        throw new Error(`Failed to update bot: ${error.message}`);
    }

    return data as Bot;
}

/**
 * Delete a bot
 */
export async function deleteBot(botId: string, userId: string): Promise<void> {
    const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', botId)
        .eq('user_id', userId); // Ensure user owns the bot

    if (error) {
        console.error('Error deleting bot:', error);
        throw new Error(`Failed to delete bot: ${error.message}`);
    }
}

/**
 * Increment bot run count
 */
export async function incrementBotRuns(botId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_bot_runs', {
        bot_id: botId
    });

    if (error) {
        console.error('Error incrementing bot runs:', error);
        // Don't throw - this is a non-critical operation
    }
}

/**
 * Get public bots for marketplace
 */
export async function getPublicBots(limit: number = 20, offset: number = 0): Promise<Bot[]> {
    const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('is_public', true)
        .eq('deployment_status', 'active')
        .order('total_runs', { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        console.error('Error fetching public bots:', error);
        throw new Error(`Failed to fetch public bots: ${error.message}`);
    }

    return (data || []) as Bot[];
}

/**
 * Search bots by name or tags
 */
export async function searchBots(query: string, userId?: string): Promise<Bot[]> {
    let supabaseQuery = supabase
        .from('bots')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    if (userId) {
        supabaseQuery = supabaseQuery.eq('user_id', userId);
    } else {
        supabaseQuery = supabaseQuery.eq('is_public', true);
    }

    const { data, error } = await supabaseQuery.order('updated_at', { ascending: false });

    if (error) {
        console.error('Error searching bots:', error);
        throw new Error(`Failed to search bots: ${error.message}`);
    }

    return (data || []) as Bot[];
}
