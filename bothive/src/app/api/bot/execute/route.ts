import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { aiClient, AI_MODEL, FALLBACK_MODELS } from "@/lib/ai-client";

export const runtime = "nodejs";
export const maxDuration = 60;

// Tool definitions that the AI can use
const AVAILABLE_TOOLS = {
    "general.respond": {
        name: "General Response",
        description: "Generate a conversational response",
        execute: async (params: any, systemPrompt: string) => {
            const response = await callAI(params.prompt || params.message, systemPrompt);
            return { output: response };
        },
    },
    "code.generate": {
        name: "Code Generation",
        description: "Generate code based on a specification",
        execute: async (params: any, systemPrompt: string) => {
            const prompt = `Generate ${params.language || "code"} for: ${params.spec || params.prompt}. 
      Only output the code, no explanations.`;
            const response = await callAI(prompt, "You are an expert programmer. Generate clean, efficient code.");
            return { output: response, language: params.language };
        },
    },
    "code.review": {
        name: "Code Review",
        description: "Review code for bugs and improvements",
        execute: async (params: any) => {
            const prompt = `Review this ${params.language || ""} code for bugs, security issues, and improvements:
      
\`\`\`
${params.code}
\`\`\`

Focus on: ${params.focus?.join(", ") || "bugs, performance, readability"}`;
            const response = await callAI(prompt, "You are a senior code reviewer. Be thorough but constructive.");
            return { output: response };
        },
    },
    "agent.analyze": {
        name: "Data Analysis",
        description: "Analyze data or context",
        execute: async (params: any) => {
            const prompt = `Analyze the following:
Data: ${JSON.stringify(params.data)}
Context: ${params.context || "None provided"}

Provide insights and actionable recommendations.`;
            const response = await callAI(prompt, "You are a data analyst. Be precise and insightful.");
            return { output: response };
        },
    },
    "agent.plan": {
        name: "Agent Planning",
        description: "Create an execution plan",
        execute: async (params: any) => {
            const prompt = `Create a step-by-step execution plan for: ${params.goal || params.task}
      
Consider: ${params.constraints || "No specific constraints"}`;
            const response = await callAI(prompt, "You are a strategic planner. Create clear, actionable plans.");
            return { output: response, steps: [] };
        },
    },
    "study.explain": {
        name: "Study Explanation",
        description: "Explain a topic for learning",
        execute: async (params: any) => {
            const prompt = `Explain "${params.topic}" to a ${params.level || "beginner"} student.
Use analogies, examples, and break down complex concepts.
Make it engaging and memorable.`;
            const response = await callAI(prompt, "You are an excellent tutor who makes learning fun and effective.");
            return { output: response };
        },
    },
    "study.quiz": {
        name: "Quiz Generator",
        description: "Generate quiz questions",
        execute: async (params: any) => {
            const prompt = `Create ${params.count || 5} quiz questions about "${params.topic}".
Difficulty: ${params.difficulty || "medium"}
Include answers and explanations.
Format as JSON array with: question, options (array), correctAnswer, explanation`;
            const response = await callAI(prompt, "You are an educational content creator.");
            return { output: response };
        },
    },
    "study.flashcards": {
        name: "Flashcard Generator",
        description: "Generate study flashcards",
        execute: async (params: any) => {
            const prompt = `Create ${params.count || 10} flashcards for studying "${params.topic}".
Format as JSON array with: front (question/term), back (answer/definition)`;
            const response = await callAI(prompt, "You are an educational content creator.");
            return { output: response };
        },
    },
};

// Call AI with fallback
async function callAI(prompt: string, systemPrompt: string): Promise<string> {
    const models = [AI_MODEL, ...FALLBACK_MODELS];

    for (const model of models) {
        try {
            const response = await aiClient.chat.completions.create({
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
                max_tokens: 2048,
            });

            const content = response.choices[0]?.message?.content?.trim();
            if (content) return content;
        } catch (error) {
            console.warn(`Model ${model} failed:`, error);
        }
    }

    throw new Error("All AI models failed");
}

interface ExecuteRequest {
    botId?: string;
    message: string;
    systemPrompt?: string;
    tools?: string[];
    conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
    integrations?: string[];
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                    set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
                    remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
                },
            }
        );

        const body = (await request.json()) as ExecuteRequest;
        const { botId, message, systemPrompt, tools = [], conversationHistory = [], integrations = [] } = body;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // If botId provided, fetch bot config
        let botConfig: any = null;
        if (botId) {
            const { data: bot, error } = await supabase
                .from("bots")
                .select("*")
                .eq("id", botId)
                .single();

            if (error || !bot) {
                return NextResponse.json({ error: "Bot not found" }, { status: 404 });
            }

            // Check if bot is active
            if (bot.deployment_status !== "active") {
                return NextResponse.json({ error: "Bot is not active" }, { status: 403 });
            }

            botConfig = bot;
        }

        const finalSystemPrompt = botConfig?.system_prompt || systemPrompt || "You are a helpful AI assistant.";
        const enabledTools = botConfig?.tools || tools;

        // Build context about available tools
        const toolDescriptions = enabledTools
            .map((t: string) => AVAILABLE_TOOLS[t as keyof typeof AVAILABLE_TOOLS])
            .filter(Boolean)
            .map((t: any) => `- ${t.name}: ${t.description}`)
            .join("\n");

        // Enhanced system prompt with tool awareness
        const enhancedSystemPrompt = `${finalSystemPrompt}

You have access to the following capabilities:
${toolDescriptions || "General conversation only."}

When responding, be helpful, accurate, and engaging. If a user's request matches one of your capabilities, use it effectively.`;

        // Build messages
        const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
            { role: "system", content: enhancedSystemPrompt },
        ];

        for (const msg of conversationHistory) {
            messages.push({ role: msg.role, content: msg.content });
        }

        messages.push({ role: "user", content: message });

        // Execute AI response
        const models = [AI_MODEL, ...FALLBACK_MODELS];
        let response: string | null = null;
        let modelUsed: string | null = null;

        for (const model of models) {
            try {
                const completion = await aiClient.chat.completions.create({
                    model,
                    messages,
                    temperature: 0.8,
                    max_tokens: 1024,
                });

                response = completion.choices[0]?.message?.content?.trim() || null;
                modelUsed = model;
                if (response) break;
            } catch (error) {
                console.warn(`Model ${model} failed:`, error);
            }
        }

        if (!response) {
            throw new Error("Failed to generate response");
        }

        // Log execution (for analytics)
        if (botId) {
            try {
                await supabase.from("bot_executions").insert({
                    bot_id: botId,
                    input: message,
                    output: response,
                    model_used: modelUsed,
                    tools_used: enabledTools,
                });
            } catch {
                // Ignore logging errors
            }
        }

        return NextResponse.json({
            response,
            model: modelUsed,
            tools: enabledTools,
            botId,
        });

    } catch (error) {
        console.error("Bot execution error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
