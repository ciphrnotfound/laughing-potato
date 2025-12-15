/**
 * Deployments service for managing bot deployments
 * Implements Vercel-like deployment pipeline
 */

import { supabase } from "@/lib/supabase";
import { getBot } from "./bots.service";

export interface Deployment {
    id: string;
    bot_id: string;
    user_id: string | null;
    deployment_number: number;
    version: string;
    commit_message: string | null;
    source_code: string;
    compiled_code: any;
    compiler_version: string;
    config: any;
    environment_variables: any;
    status: 'pending' | 'queued' | 'building' | 'deploying' | 'active' | 'failed' | 'cancelled' | 'superseded';
    environment: 'development' | 'staging' | 'production' | 'preview';
    deployment_url: string | null;
    deployment_region: string;
    build_duration_ms: number | null;
    deploy_duration_ms: number | null;
    error_message: string | null;
    error_stack: string | null;
    build_logs: any[];
    deploy_logs: any[];
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    queued_at: string;
    started_at: string | null;
    completed_at: string | null;
    superseded_at: string | null;
    created_at: string;
}

export interface CreateDeploymentInput {
    bot_id: string;
    version: string;
    commit_message?: string;
    environment?: Deployment['environment'];
}

export class DeploymentsService {
    /**
     * Create a new deployment
     */
    static async create(input: CreateDeploymentInput, user_id: string) {
        // Get the bot to deploy
        const bot = await getBot(input.bot_id);

        if (!bot) {
            throw new Error('Bot not found');
        }

        // Create deployment record
        const { data, error } = await supabase
            .from('deployments')
            .insert({
                bot_id: input.bot_id,
                user_id,
                version: input.version,
                commit_message: input.commit_message,
                source_code: bot.hivelang_code || '',
                compiled_code: bot.compiled_js || null,
                compiler_version: '1.0.0', // Default
                config: {}, // Default
                environment_variables: {}, // Default
                environment: input.environment || 'production',
                status: 'queued',
                deployment_region: 'us-east-1', // Default
            })
            .select()
            .single();

        if (error) throw error;

        // Start deployment process (async)
        this.processDeployment(data.id).catch(console.error);

        return data as Deployment;
    }

    /**
     * Process a deployment (simulated pipeline)
     */
    private static async processDeployment(deployment_id: string) {
        const deployment = await this.getById(deployment_id);

        try {
            // Update status to building
            await this.updateStatus(deployment_id, 'building');
            await new Date(Date.now() + 1000); // Simulate build time

            const buildStartTime = Date.now();

            // Compile the code (simplified)
            const compiled = deployment.compiled_code;
            const buildDuration = Date.now() - buildStartTime;

            // Update status to deploying
            await supabase
                .from('deployments')
                .update({
                    status: 'deploying',
                    build_duration_ms: buildDuration,
                    build_logs: [{ timestamp: new Date().toISOString(), message: 'Build completed successfully' }],
                })
                .eq('id', deployment_id);

            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate deploy time

            const deployStartTime = Date.now();

            // Generate deployment URL
            const deploymentUrl = `https://${deployment.bot_id}-${deployment.deployment_number}.bothive.app`;

            const deployDuration = Date.now() - deployStartTime;

            // Update status to active
            await supabase
                .from('deployments')
                .update({
                    status: 'active',
                    deployment_url: deploymentUrl,
                    deploy_duration_ms: deployDuration,
                    completed_at: new Date().toISOString(),
                    deploy_logs: [{ timestamp: new Date().toISOString(), message: 'Deployment completed successfully' }],
                })
                .eq('id', deployment_id);

            // Award XP for deployment
            if (deployment.user_id) {
                await this.awardDeploymentXP(deployment.user_id);
                await this.checkDeploymentAchievements(deployment.user_id);
            }

        } catch (error) {
            // Update status to failed
            await supabase
                .from('deployments')
                .update({
                    status: 'failed',
                    error_message: error instanceof Error ? error.message : 'Unknown error',
                    error_stack: error instanceof Error ? error.stack : undefined,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', deployment_id);

            throw error;
        }
    }

    /**
     * Get deployment by ID
     */
    static async getById(id: string) {
        const { data, error } = await supabase
            .from('deployments')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Deployment;
    }

    /**
     * List deployments for a bot
     */
    static async listForBot(bot_id: string, options?: {
        environment?: string;
        limit?: number;
    }) {
        let query = supabase
            .from('deployments')
            .select('*')
            .eq('bot_id', bot_id)
            .order('created_at', { ascending: false });

        if (options?.environment) {
            query = query.eq('environment', options.environment);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as Deployment[];
    }

    /**
     * Get active deployment for a bot
     */
    static async getActiveDeployment(bot_id: string, environment: string = 'production') {
        const { data, error } = await supabase
            .from('deployments')
            .select('*')
            .eq('bot_id', bot_id)
            .eq('environment', environment)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
        return data as Deployment | null;
    }

    /**
     * Update deployment status
     */
    static async updateStatus(deployment_id: string, status: Deployment['status']) {
        const updates: any = { status };

        if (status === 'building') {
            updates.started_at = new Date().toISOString();
        } else if (['active', 'failed', 'cancelled'].includes(status)) {
            updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('deployments')
            .update(updates)
            .eq('id', deployment_id)
            .select()
            .single();

        if (error) throw error;
        return data as Deployment;
    }

    /**
     * Rollback to a previous deployment
     */
    static async rollback(deployment_id: string, user_id: string) {
        const deployment = await this.getById(deployment_id);

        // Create a new deployment with the old code
        return this.create({
            bot_id: deployment.bot_id,
            version: `${deployment.version}-rollback`,
            commit_message: `Rollback to deployment #${deployment.deployment_number}`,
            environment: deployment.environment,
        }, user_id);
    }

    /**
     * Cancel a deployment
     */
    static async cancel(deployment_id: string) {
        return this.updateStatus(deployment_id, 'cancelled');
    }

    /**
     * Promote deployment from staging to production
     */
    static async promote(deployment_id: string, user_id: string) {
        const deployment = await this.getById(deployment_id);

        if (deployment.environment !== 'staging') {
            throw new Error('Can only promote staging deployments');
        }

        // Create production deployment with same code
        return this.create({
            bot_id: deployment.bot_id,
            version: deployment.version,
            commit_message: `Promoted from staging deployment #${deployment.deployment_number}`,
            environment: 'production',
        }, user_id);
    }

    /**
     * Award XP for deployment
     */
    private static async awardDeploymentXP(user_id: string) {
        await supabase
            .from('user_gamification')
            .upsert({
                user_id,
                xp: 100, // Deployments award more XP
                total_xp: 100,
                bots_deployed: 1,
                last_activity_date: new Date().toISOString().split('T')[0],
            }, {
                onConflict: 'user_id',
                ignoreDuplicates: false,
            });
    }

    /**
     * Check deployment achievements
     */
    private static async checkDeploymentAchievements(user_id: string) {
        const { count } = await supabase
            .from('deployments')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user_id)
            .eq('status', 'active');

        if (count === 1) {
            await supabase.rpc('check_and_unlock_achievement', {
                p_user_id: user_id,
                p_achievement_slug: 'first-deployment'
            });
        }
    }
}
