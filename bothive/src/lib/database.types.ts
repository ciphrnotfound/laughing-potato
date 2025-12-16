export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole = 'developer' | 'business' | 'enterprise' | 'admin';

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    billing_plan: string | null
                    role: 'developer' | 'business' | 'enterprise' | 'admin'
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    billing_plan?: string | null
                    role?: 'developer' | 'business' | 'enterprise' | 'admin'
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    billing_plan?: string | null
                    role?: 'developer' | 'business' | 'enterprise' | 'admin'
                    created_at?: string
                }
            }
            agents: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    description: string | null
                    model: string | null
                    system_prompt: string | null
                    capabilities: Json | null
                    is_public: boolean | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    description?: string | null
                    model?: string | null
                    system_prompt?: string | null
                    capabilities?: Json | null
                    is_public?: boolean | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    description?: string | null
                    model?: string | null
                    system_prompt?: string | null
                    capabilities?: Json | null
                    is_public?: boolean | null
                    created_at?: string
                }
            }
            workflows: {
                Row: {
                    id: string
                    user_id: string
                    agent_id: string | null
                    status: 'pending' | 'running' | 'completed' | 'failed' | null
                    input_payload: Json | null
                    output_payload: Json | null
                    logs: Json | null
                    started_at: string
                    completed_at: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    agent_id?: string | null
                    status?: 'pending' | 'running' | 'completed' | 'failed' | null
                    input_payload?: Json | null
                    output_payload?: Json | null
                    logs?: Json | null
                    started_at?: string
                    completed_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    agent_id?: string | null
                    status?: 'pending' | 'running' | 'completed' | 'failed' | null
                    input_payload?: Json | null
                    output_payload?: Json | null
                    logs?: Json | null
                    started_at?: string
                    completed_at?: string | null
                }
            }
            api_keys: {
                Row: {
                    id: string
                    user_id: string
                    key_hash: string
                    label: string | null
                    last_used_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    key_hash: string
                    label?: string | null
                    last_used_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    key_hash?: string
                    label?: string | null
                    last_used_at?: string | null
                    created_at?: string
                }
            }
            connected_accounts: {
                Row: {
                    id: string
                    user_id: string
                    provider: string
                    access_token: string
                    refresh_token: string | null
                    expires_at: string | null
                    metadata: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    provider: string
                    access_token: string
                    refresh_token?: string | null
                    expires_at?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    provider?: string
                    access_token?: string
                    refresh_token?: string | null
                    expires_at?: string | null
                    metadata?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            deployments: {
                Row: {
                    id: string
                    bot_id: string
                    user_id: string | null
                    deployment_number: number
                    version: string
                    commit_message: string | null
                    source_code: string | null
                    compiled_code: Json | null
                    compiler_version: string | null
                    config: Json | null
                    environment_variables: Json | null
                    status: 'pending' | 'queued' | 'building' | 'deploying' | 'active' | 'failed' | 'cancelled' | 'superseded' | null
                    environment: string | null
                    deployment_url: string | null
                    deployment_region: string | null
                    build_duration_ms: number | null
                    deploy_duration_ms: number | null
                    error_message: string | null
                    error_stack: string | null
                    build_logs: Json | null
                    deploy_logs: Json | null
                    total_executions: number | null
                    successful_executions: number | null
                    failed_executions: number | null
                    queued_at: string | null
                    started_at: string | null
                    completed_at: string | null
                    superseded_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    bot_id: string
                    user_id?: string | null
                    deployment_number?: number
                    version: string
                    commit_message?: string | null
                    source_code?: string | null
                    compiled_code?: Json | null
                    compiler_version?: string | null
                    config?: Json | null
                    environment_variables?: Json | null
                    status?: 'pending' | 'queued' | 'building' | 'deploying' | 'active' | 'failed' | 'cancelled' | 'superseded' | null
                    environment?: string | null
                    deployment_url?: string | null
                    deployment_region?: string | null
                    build_duration_ms?: number | null
                    deploy_duration_ms?: number | null
                    error_message?: string | null
                    error_stack?: string | null
                    build_logs?: Json | null
                    deploy_logs?: Json | null
                    total_executions?: number | null
                    successful_executions?: number | null
                    failed_executions?: number | null
                    queued_at?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    superseded_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    bot_id?: string
                    user_id?: string | null
                    deployment_number?: number
                    version?: string
                    commit_message?: string | null
                    source_code?: string | null
                    compiled_code?: Json | null
                    compiler_version?: string | null
                    config?: Json | null
                    environment_variables?: Json | null
                    status?: 'pending' | 'queued' | 'building' | 'deploying' | 'active' | 'failed' | 'cancelled' | 'superseded' | null
                    environment?: string | null
                    deployment_url?: string | null
                    deployment_region?: string | null
                    build_duration_ms?: number | null
                    deploy_duration_ms?: number | null
                    error_message?: string | null
                    error_stack?: string | null
                    build_logs?: Json | null
                    deploy_logs?: Json | null
                    total_executions?: number | null
                    successful_executions?: number | null
                    failed_executions?: number | null
                    queued_at?: string | null
                    started_at?: string | null
                    completed_at?: string | null
                    superseded_at?: string | null
                    created_at?: string
                }
            }
            user_gamification: {
                Row: {
                    user_id: string
                    level: number
                    xp: number
                    total_xp: number
                    streak_days: number
                    longest_streak: number
                    last_activity_date: string | null
                    bots_created: number
                    bots_deployed: number
                    total_executions: number
                    achievements_unlocked: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    level?: number
                    xp?: number
                    total_xp?: number
                    streak_days?: number
                    longest_streak?: number
                    last_activity_date?: string | null
                    bots_created?: number
                    bots_deployed?: number
                    total_executions?: number
                    achievements_unlocked?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    level?: number
                    xp?: number
                    total_xp?: number
                    streak_days?: number
                    longest_streak?: number
                    last_activity_date?: string | null
                    bots_created?: number
                    bots_deployed?: number
                    total_executions?: number
                    achievements_unlocked?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            achievements: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    description: string | null
                    icon_url: string | null
                    category: string | null
                    xp_reward: number | null
                    tier: string | null
                    requirement: Json | null
                    is_hidden: boolean | null
                    is_active: boolean | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    slug: string
                    name: string
                    description?: string | null
                    icon_url?: string | null
                    category?: string | null
                    xp_reward?: number | null
                    tier?: string | null
                    requirement?: Json | null
                    is_hidden?: boolean | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    name?: string
                    description?: string | null
                    icon_url?: string | null
                    category?: string | null
                    xp_reward?: number | null
                    tier?: string | null
                    requirement?: Json | null
                    is_hidden?: boolean | null
                    is_active?: boolean | null
                    created_at?: string
                    updated_at?: string
                }
            }
            user_achievements: {
                Row: {
                    id: string
                    user_id: string
                    achievement_id: string
                    progress: Json | null
                    unlocked_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    achievement_id: string
                    progress?: Json | null
                    unlocked_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    achievement_id?: string
                    progress?: Json | null
                    unlocked_at?: string
                }
            }
            leaderboard: {
                Row: {
                    user_id: string
                    first_name: string | null
                    last_name: string | null
                    level: number | null
                    total_xp: number | null
                    achievements_unlocked: number | null
                    bots_created: number | null
                    streak_days: number | null
                    rank: number | null
                }
                Insert: {
                    user_id: string
                    first_name?: string | null
                    last_name?: string | null
                    level?: number | null
                    total_xp?: number | null
                    achievements_unlocked?: number | null
                    bots_created?: number | null
                    streak_days?: number | null
                    rank?: number | null
                }
                Update: {
                    user_id?: string
                    first_name?: string | null
                    last_name?: string | null
                    level?: number | null
                    total_xp?: number | null
                    achievements_unlocked?: number | null
                    bots_created?: number | null
                    streak_days?: number | null
                    rank?: number | null
                }
            }
            bot_executions: {
                Row: {
                    id: string
                    bot_id: string
                    trigger_type: string | null
                    input: Json | null
                    output: Json | null
                    status: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    bot_id: string
                    trigger_type?: string | null
                    input?: Json | null
                    output?: Json | null
                    status?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    bot_id?: string
                    trigger_type?: string | null
                    input?: Json | null
                    output?: Json | null
                    status?: string | null
                    created_at?: string
                }
            }
            bots: {
                Row: {
                    id: string
                    creator_id: string | null
                    name: string
                    description: string | null
                    system_prompt: string | null
                    model: string | null
                    marketplace_price: number | null
                    status: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    creator_id?: string | null
                    name: string
                    description?: string | null
                    system_prompt?: string | null
                    model?: string | null
                    marketplace_price?: number | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    creator_id?: string | null
                    name?: string
                    description?: string | null
                    system_prompt?: string | null
                    model?: string | null
                    marketplace_price?: number | null
                    status?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            integrations: {
                Row: {
                    id: string
                    slug: string
                    name: string
                    description: string | null
                    category: string | null
                    type: string | null
                    features: Json | null
                    pricing_model: string | null
                    documentation_url: string | null
                    setup_time: string | null
                    hivelang_code: string | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    slug?: string
                    name: string
                    description?: string | null
                    category?: string | null
                    type?: string | null
                    features?: Json | null
                    pricing_model?: string | null
                    documentation_url?: string | null
                    setup_time?: string | null
                    hivelang_code?: string | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    name?: string
                    description?: string | null
                    category?: string | null
                    type?: string | null
                    features?: Json | null
                    pricing_model?: string | null
                    documentation_url?: string | null
                    setup_time?: string | null
                    hivelang_code?: string | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            user_integrations: {
                Row: {
                    id: string
                    user_id: string
                    integration_id: string
                    access_token: string | null
                    refresh_token: string | null
                    expires_at: string | null
                    additional_config: Json | null
                    status: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    integration_id: string
                    access_token?: string | null
                    refresh_token?: string | null
                    expires_at?: string | null
                    additional_config?: Json | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    integration_id?: string
                    access_token?: string | null
                    refresh_token?: string | null
                    expires_at?: string | null
                    additional_config?: Json | null
                    status?: string
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            check_and_unlock_achievement: {
                Args: {
                    p_user_id: string
                    p_achievement_slug: string
                }
                Returns: boolean
            }
            refresh_leaderboard: {
                Args: Record<string, never>
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
