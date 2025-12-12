import { NextRequest, NextResponse } from "next/server";
import { executeReAct } from "@/lib/agents/react-engine";
import { generalTools } from "@/lib/tools";
import { createSharedMemory } from "@/lib/sharedMemory";
import { ToolContext } from "@/lib/agentTypes";

/**
 * POST /api/ai/chat - AI chat endpoint using ReAct pattern
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { message, conversationHistory = [], systemPrompt } = body;

        if (!message) {
            return NextResponse.json(
                { error: "Message required" },
                { status: 400 }
            );
        }

        // Create context for the agent
        const sharedMemory = createSharedMemory(`chat-${Date.now()}`);
        const toolContext: ToolContext = {
            metadata: {
                botId: 'ai-chat-assistant',
                runId: `chat-${Date.now()}`,
                userId: 'anonymous',
            },
            sharedMemory,
        };

        // Build conversation context
        const conversationContext = conversationHistory.length > 0
            ? `\n\nPrevious conversation:\n${conversationHistory.map((msg: any) =>
                `${msg.role}: ${msg.content}`
            ).join('\n')}\n\n`
            : '';

        const fullPrompt = `${conversationContext}User: ${message}`;

        // Execute with ReAct pattern
        const result = await executeReAct(
            fullPrompt,
            generalTools,
            toolContext,
            {
                maxSteps: 5,
                systemPrompt: systemPrompt || "You are a helpful AI assistant in the BotHive platform. Help users with their automation needs, answer questions about the platform, and provide guidance on creating bots.",
                temperature: 0.7,
            }
        );

        return NextResponse.json({
            response: result.finalAnswer,
            reactSteps: result.steps,
            success: result.success,
        });
    } catch (error: any) {
        console.error('AI chat error:', error);
        return NextResponse.json(
            { error: error.message || "Chat failed" },
            { status: 500 }
        );
    }
}
