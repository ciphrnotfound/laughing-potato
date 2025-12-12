import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import { resolveBot } from "@/lib/agents/bot-resolver";
import { executeHiveLangProgram } from "@/lib/agents/hivelang-executor";

/**
 * Bot Composition Tools
 * Enables bots to call other bots
 */

/**
 * Call another bot from within a bot
 */
export const callBot: ToolDescriptor = {
    name: "bot.call",
    capability: "bot.composition",
    description: "Execute another bot and return its output. Use this to compose workflows from multiple bots.",
    async run(input: Record<string, unknown>, context: ToolContext) {
        const botName = typeof input.botName === "string" ? input.botName : "";
        const botInput = input.input as Record<string, any> | undefined;

        if (!botName) {
            return {
                success: false,
                output: "Missing required field: botName",
            };
        }

        const userId = context.metadata.userId;
        if (!userId) {
            return {
                success: false,
                output: "No user context. Bot composition requires an authenticated user.",
            };
        }

        try {
            // Resolve the bot by name
            const bot = await resolveBot(botName, userId);
            if (!bot) {
                return {
                    success: false,
                    output: `Bot "${botName}" not found. Make sure the bot exists in your workspace.`,
                };
            }

            // Execute the  bot with the provided input
            // Get tools from parent context (reuse the same tools)
            const { generalTools, codingTools, studyTools, socialTools, messagingTools, integrationTools, agentTools } = await import("@/lib/tools");

            const ALL_TOOLS = [
                ...generalTools,
                ...codingTools,
                ...studyTools,
                ...socialTools,
                ...messagingTools,
                ...integrationTools,
                ...agentTools,
            ];

            const result = await executeHiveLangProgram(
                bot.hivelang_code,
                botInput || {},
                ALL_TOOLS,
                context // Pass parent context for continuity
            );

            if (!result.success) {
                return {
                    success: false,
                    output: `Bot "${botName}" execution failed: ${result.error || "Unknown error"}`,
                };
            }

            return {
                success: true,
                output: JSON.stringify({
                    botName: bot.name,
                    output: result.output,
                    steps: result.steps.length,
                    message: `Bot "${botName}" executed successfully`,
                }),
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : "Bot call failed";
            return {
                success: false,
                output: `Failed to call bot "${botName}": ${message}`,
            };
        }
    },
};

export const botCompositionTools: ToolDescriptor[] = [callBot];
