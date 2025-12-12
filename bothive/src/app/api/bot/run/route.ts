import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { executeHiveLangProgram } from "@/lib/agents";
import { generalTools, codingTools, studyTools, socialTools, messagingTools, integrationTools, agentTools } from "@/lib/tools";
import { createSharedMemory } from "@/lib/sharedMemory";
import { ToolContext } from "@/lib/agentTypes";

const ALL_TOOLS = [
    ...generalTools,
    ...codingTools,
    ...studyTools,
    ...socialTools,
    ...messagingTools,
    ...integrationTools,
    ...agentTools,
];

/**
 * POST /api/bot/run - Execute a bot by ID
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { botId, input } = body;

        if (!botId) {
            return NextResponse.json(
                { error: "botId required" },
                { status: 400 }
            );
        }

        // Get the bot
        const { data: bot, error: botError } = await supabase
            .from('bots')
            .select('*')
            .eq('id', botId)
            .single();

        if (botError || !bot) {
            return NextResponse.json(
                { error: "Bot not found" },
                { status: 404 }
            );
        }

        // Create execution record
        const executionId = crypto.randomUUID();
        const { data: execution, error: execError } = await supabase
            .from('bot_executions')
            .insert({
                id: executionId,
                bot_id: botId,
                user_id: bot.user_id,
                trigger_type: 'manual',
                status: 'queued',
                input_data: input || {},
            })
            .select()
            .single();

        if (execError) {
            console.error('Failed to create execution record:', execError);
        }

        // Update execution to running
        await supabase
            .from('bot_executions')
            .update({
                status: 'running',
                started_at: new Date().toISOString(),
            })
            .eq('id', executionId);

        const startTime = Date.now();

        try {
            // Execute the bot
            const sharedMemory = createSharedMemory(executionId);
            const toolContext: ToolContext = {
                metadata: {
                    botId: bot.id,
                    runId: executionId,
                    userId: bot.user_id,
                    botSystemPrompt: bot.system_prompt,
                },
                sharedMemory,
            };

            const result = await executeHiveLangProgram(
                bot.hivelang_code || bot.source_code || '',
                input || {},
                ALL_TOOLS,
                toolContext
            );

            const executionTime = Date.now() - startTime;

            // Update execution record with success
            await supabase
                .from('bot_executions')
                .update({
                    status: 'completed',
                    output_data: { output: result.output },
                    execution_time_ms: executionTime,
                    completed_at: new Date().toISOString(),
                    execution_logs: result.steps,
                })
                .eq('id', executionId);

            // Increment bot run count
            try {
                await supabase.rpc('increment_bot_runs', { bot_id: botId });
            } catch {}

            // Award XP for bot execution
            if (bot.user_id) {
                await awardExecutionXP(bot.user_id);
            }

            return NextResponse.json({
                success: true,
                executionId,
                output: result.output,
                reactSteps: result.steps,
                executionTime,
            });
        } catch (error: any) {
            const executionTime = Date.now() - startTime;

            // Update execution record with error
            await supabase
                .from('bot_executions')
                .update({
                    status: 'failed',
                    error_data: {
                        message: error.message,
                        stack: error.stack,
                    },
                    execution_time_ms: executionTime,
                    completed_at: new Date().toISOString(),
                })
                .eq('id', executionId);

            throw error;
        }
    } catch (error: any) {
        console.error('Bot execution error:', error);
        return NextResponse.json(
            { error: error.message || "Bot execution failed" },
            { status: 500 }
        );
    }
}

async function awardExecutionXP(userId: string) {
    try {
        const { data: profile } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (profile) {
            await supabase
                .from('user_gamification')
                .update({
                    xp: profile.xp + 10,
                    total_xp: profile.total_xp + 10,
                    total_executions: profile.total_executions + 1,
                })
                .eq('user_id', userId);
        }
    } catch (error) {
        console.error('Failed to award execution XP:', error);
    }
}
