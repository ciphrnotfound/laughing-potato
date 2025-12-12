/**
 * Database service layer for bot management
 * Provides type-safe CRUD operations for bots table
 */

import { supabase } from "@/lib/supabase";

export interface Bot {
    id: string;
    user_id: string;
    workspace_id: string | null;
    name: string;
    description: string | null;
    slug: string;
    icon_url: string | null;
    tags: string[];
    category: string;
    source_code: string;
    compiled_code: any;
    compiler_version: string;
    config: any;
    environment_variables: any;
    deployment_status: 'draft' | 'deploying' | 'active' | 'paused' | 'failed' | 'archived';
    deployed_at: string | null;
    deployment_url: string | null;
    deployment_region: string;
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    avg_execution_time_ms: number | null;
    last_run_at: string | null;
    is_public: boolean;
    is_template: boolean;
    is_featured: boolean;
    install_count: number;
    rating: number | null;
    rating_count: number;
    metadata: any;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}

export interface CreateBotInput {
    name: string;
    description?: string;
    slug: string;
    source_code: string;
    compiled_code?: any;
    category?: string;
    tags?: string[];
    icon_url?: string;
    workspace_id?: string;
    config?: any;
    is_public?: boolean;
}

export interface UpdateBotInput {
    name?: string;
    description?: string;
    source_code?: string;
    compiled_code?: any;
    category?: string;
    tags?: string[];
    icon_url?: string;
    config?: any;
    environment_variables?: any;
    deployment_status?: Bot['deployment_status'];
    is_public?: boolean;
}

export class BotsService {
    /**
     * List all bots for the current user
     */
    static async list(options?: {
        workspace_id?: string;
        category?: string;
        is_public?: boolean;
        limit?: number;
        offset?: number;
    }) {
        let query = supabase
            .from('bots')
            .select('*')
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (options?.workspace_id) {
            query = query.eq('workspace_id', options.workspace_id);
        }

        if (options?.category) {
            query = query.eq('category', options.category);
        }

        if (options?.is_public !== undefined) {
            query = query.eq('is_public', options.is_public);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as Bot[];
    }

    /**
     * Get a single bot by ID
     */
    static async getById(id: string) {
        const { data, error } = await supabase
            .from('bots')
            .select('*')
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) throw error;
        return data as Bot;
    }

    /**
     * Get a bot by slug
     */
    static async getBySlug(slug: string, workspace_id?: string) {
        let query = supabase
            .from('bots')
            .select('*')
            .eq('slug', slug)
            .is('deleted_at', null);

        if (workspace_id) {
            query = query.eq('workspace_id', workspace_id);
        }

        const { data, error } = await query.single();

        if (error) throw error;
        return data as Bot;
    }

    /**
     * Create a new bot
     */
    static async create(input: CreateBotInput, user_id: string) {
        const { data, error } = await supabase
            .from('bots')
            .insert({
                ...input,
                user_id,
                category: input.category || 'general',
                tags: input.tags || [],
                deployment_status: 'draft',
            })
            .select()
            .single();

        if (error) throw error;

        // Award XP for creating a bot
        await this.awardBotCreationXP(user_id);

        // Check for achievements
        await this.checkBotCreationAchievements(user_id);

        return data as Bot;
    }

    /**
     * Update a bot
     */
    static async update(id: string, input: UpdateBotInput) {
        const { data, error } = await supabase
            .from('bots')
            .update(input)
            .eq('id', id)
            .is('deleted_at', null)
            .select()
            .single();

        if (error) throw error;
        return data as Bot;
    }

    /**
     * Soft delete a bot
     */
    static async delete(id: string) {
        const { data, error } = await supabase
            .from('bots')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Bot;
    }

    /**
     * Get bot statistics
     */
    static async getStatistics(bot_id: string) {
        const { data: bot } = await supabase
            .from('bots')
            .select('total_runs, successful_runs, failed_runs, avg_execution_time_ms')
            .eq('id', bot_id)
            .single();

        const { data: recentExecutions } = await supabase
            .from('bot_executions')
            .select('status, execution_time_ms, created_at')
            .eq('bot_id', bot_id)
            .order('created_at', { ascending: false })
            .limit(100);

        const successRate = bot?.total_runs
            ? ((bot.successful_runs / bot.total_runs) * 100).toFixed(2)
            : '0';

        return {
            totalRuns: bot?.total_runs || 0,
            successfulRuns: bot?.successful_runs || 0,
            failedRuns: bot?.failed_runs || 0,
            successRate: parseFloat(successRate),
            avgExecutionTime: bot?.avg_execution_time_ms || 0,
            recentExecutions: recentExecutions || [],
        };
    }

    /**
     * Get marketplace bots (public bots)
     */
    static async getMarketplaceBots(options?: {
        category?: string;
        featured?: boolean;
        search?: string;
        limit?: number;
    }) {
        let query = supabase
            .from('bots')
            .select('*')
            .eq('is_public', true)
            .is('deleted_at', null)
            .order('install_count', { ascending: false });

        if (options?.category) {
            query = query.eq('category', options.category);
        }

        if (options?.featured) {
            query = query.eq('is_featured', true);
        }

        if (options?.search) {
            query = query.or(`name.ilike.%${options.search}%,description.ilike.%${options.search}%`);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as Bot[];
    }

    /**
     * Award XP for creating a bot
     */
    private static async awardBotCreationXP(user_id: string) {
        const { error } = await supabase.rpc('award_xp', {
            p_user_id: user_id,
            p_xp_amount: 50,
            p_action: 'bot_created'
        });

        if (error) console.error('Error awarding XP:', error);
    }

    /**
     * Check and unlock achievements for bot creation
     */
    private static async checkBotCreationAchievements(user_id: string) {
        // Get total bots created by user
        const { count } = await supabase
            .from('bots')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id)
            .is('deleted_at', null);

        const botCount = count || 0;

        // Check achievements
        if (botCount === 1) {
            await supabase.rpc('check_and_unlock_achievement', {
                p_user_id: user_id,
                p_achievement_slug: 'first-bot'
            });
        } else if (botCount === 5) {
            await supabase.rpc('check_and_unlock_achievement', {
                p_user_id: user_id,
                p_achievement_slug: 'five-bots'
            });
        } else if (botCount === 10) {
            await supabase.rpc('check_and_unlock_achievement', {
                p_user_id: user_id,
                p_achievement_slug: 'ten-bots'
            });
        }

        // Update gamification stats
        await supabase
            .from('user_gamification')
            .update({ bots_created: botCount })
            .eq('user_id', user_id);
    }
}
