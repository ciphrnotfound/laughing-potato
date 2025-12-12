/**
 * Executions service for managing bot execution
 * Tracks all bot runs with detailed metrics and logs
 */

import { supabase } from "@/lib/supabase";
import { BotsService } from "./bots.service";

export interface BotExecution {
    id: string;
    bot_id: string;
    deployment_id: string | null;
    user_id: string | null;
    trigger_type: 'manual' | 'scheduled' | 'webhook' | 'api' | 'event';
    trigger_source: string | null;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
    input_data: any;
    output_data: any;
    error_data: any;
    execution_logs: any[];
    console_logs: string[];
    execution_time_ms: number | null;
    memory_used_mb: number | null;
    cpu_time_ms: number | null;
    tokens_used: number;
    api_calls_made: number;
    estimated_cost_usd: number | null;
    queued_at: string;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    metadata: any;
}

export interface ExecuteBotInput {
    bot_id: string;
    input_data?: any;
    trigger_type?: BotExecution['trigger_type'];
    trigger_source?: string;
}

export interface ExecutionLog {
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    data?: any;
}

export class ExecutionsService {
    /**
     * Execute a bot
     */
    static async execute(input: ExecuteBotInput, user_id: string) {
        // Get the bot
        const bot = await BotsService.getById(input.bot_id);

        if (!bot) {
            throw new Error('Bot not found');
        }

        if (bot.deployment_status !== 'active') {
            throw new Error('Bot must be deployed before execution');
        }

        // Get active deployment
        const { data: deployment } = await supabase
            .from('deployments')
            .select('id')
            .eq('bot_id', input.bot_id)
            .eq('environment', 'production')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        // Create execution record
        const { data: execution, error } = await supabase
            .from('bot_executions')
            .insert({
                bot_id: input.bot_id,
                deployment_id: deployment?.id || null,
                user_id,
                trigger_type: input.trigger_type || 'manual',
                trigger_source: input.trigger_source,
                input_data: input.input_data,
                status: 'queued',
            })
            .select()
            .single();

        if (error) throw error;

        // Start execution (async)
        this.processExecution(execution.id, bot, input.input_data).catch(console.error);

        return execution as BotExecution;
    }

    /**
     * Process bot execution
     */
    private static async processExecution(execution_id: string, bot: any, input_data: any) {
        const logs: ExecutionLog[] = [];
        const consoleLogs: string[] = [];
        const startTime = Date.now();

        try {
            // Update status to running
            await supabase
                .from('bot_executions')
                .update({
                    status: 'running',
                    started_at: new Date().toISOString(),
                })
                .eq('id', execution_id);

            logs.push({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: 'Execution started',
            });

            // Execute the bot's compiled code
            const compiled = bot.compiled_code;

            if (!compiled || !compiled.steps) {
                throw new Error('Invalid compiled code');
            }

            logs.push({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: `Executing ${compiled.steps.length} steps`,
            });

            // Simple execution simulation (replace with actual HiveLang runtime)
            const output: any = {};

            for (let i = 0; i < compiled.steps.length; i++) {
                const step = compiled.steps[i];

                logs.push({
                    timestamp: new Date().toISOString(),
                    level: 'info',
                    message: `Executing step ${i + 1}: ${step.type}`,
                    data: step,
                });

                // Simulate step execution
                await new Promise(resolve => setTimeout(resolve, 100));

                consoleLogs.push(`[Step ${i + 1}] ${step.type}`);
            }

            output.steps_executed = compiled.steps.length;
            output.status = 'success';
            output.message = 'Bot execution completed successfully';

            const executionTime = Date.now() - startTime;

            // Estimate tokens and cost (simplified)
            const tokensUsed = Math.floor(Math.random() * 1000) + 100;
            const apiCalls = compiled.steps.length;
            const estimatedCost = (tokensUsed / 1000) * 0.002; // $0.002 per 1K tokens

            logs.push({
                timestamp: new Date().toISOString(),
                level: 'info',
                message: 'Execution completed successfully',
                data: {
                    execution_time_ms: executionTime,
                    tokens_used: tokensUsed,
                    api_calls: apiCalls,
                },
            });

            // Update execution record
            await supabase
                .from('bot_executions')
                .update({
                    status: 'completed',
                    output_data: output,
                    execution_logs: logs,
                    console_logs: consoleLogs,
                    execution_time_ms: executionTime,
                    memory_used_mb: Math.random() * 100 + 50,
                    cpu_time_ms: executionTime * 0.8,
                    tokens_used: tokensUsed,
                    api_calls_made: apiCalls,
                    estimated_cost_usd: estimatedCost,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', execution_id);

        } catch (error) {
            const executionTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            logs.push({
                timestamp: new Date().toISOString(),
                level: 'error',
                message: 'Execution failed',
                data: { error: errorMessage },
            });

            // Update execution record with error
            await supabase
                .from('bot_executions')
                .update({
                    status: 'failed',
                    error_data: {
                        message: errorMessage,
                        stack: error instanceof Error ? error.stack : undefined,
                    },
                    execution_logs: logs,
                    console_logs: consoleLogs,
                    execution_time_ms: executionTime,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', execution_id);

            throw error;
        }
    }

    /**
     * Get execution by ID
     */
    static async getById(id: string) {
        const { data, error } = await supabase
            .from('bot_executions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as BotExecution;
    }

    /**
     * List executions for a bot
     */
    static async listForBot(bot_id: string, options?: {
        status?: string;
        limit?: number;
        offset?: number;
    }) {
        let query = supabase
            .from('bot_executions')
            .select('*')
            .eq('bot_id', bot_id)
            .order('created_at', { ascending: false });

        if (options?.status) {
            query = query.eq('status', options.status);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(
                options.offset,
                options.offset + (options.limit || 10) - 1
            );
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as BotExecution[];
    }

    /**
     * List recent executions for a user
     */
    static async listRecent(user_id: string, limit: number = 10) {
        const { data, error } = await supabase
            .from('bot_executions')
            .select('*, bots(name, slug)')
            .eq('user_id', user_id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data as any[];
    }

    /**
     * Get execution statistics for a bot
     */
    static async getStatistics(bot_id: string, days: number = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);

        const { data, error } = await supabase
            .from('bot_executions')
            .select('status, execution_time_ms, created_at')
            .eq('bot_id', bot_id)
            .gte('created_at', since.toISOString());

        if (error) throw error;

        const executions = data || [];
        const total = executions.length;
        const completed = executions.filter(e => e.status === 'completed').length;
        const failed = executions.filter(e => e.status === 'failed').length;
        const avgTime = executions.length > 0
            ? executions.reduce((sum, e) => sum + (e.execution_time_ms || 0), 0) / executions.length
            : 0;

        return {
            total,
            completed,
            failed,
            successRate: total > 0 ? (completed / total) * 100 : 0,
            avgExecutionTime: Math.round(avgTime),
            executions,
        };
    }

    /**
     * Cancel an execution
     */
    static async cancel(execution_id: string) {
        const { data, error } = await supabase
            .from('bot_executions')
            .update({
                status: 'cancelled',
                completed_at: new Date().toISOString(),
            })
            .eq('id', execution_id)
            .in('status', ['queued', 'running'])
            .select()
            .single();

        if (error) throw error;
        return data as BotExecution;
    }
}
