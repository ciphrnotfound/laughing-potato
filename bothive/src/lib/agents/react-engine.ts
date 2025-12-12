import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import OpenAI from "openai";
import { aiClient, AI_MODEL } from "@/lib/ai-client";

const openai = aiClient;

export interface ReActStep {
    thought: string;       // Agent's reasoning
    action: string;        // Tool name to call
    actionInput: Record<string, any>;  // Tool parameters
    observation: string;   // Tool execution result
    timestamp: number;
}

export interface ReActResult {
    finalAnswer: string;
    steps: ReActStep[];
    success: boolean;
    error?: string;
}

interface ReActConfig {
    maxSteps?: number;
    model?: string;
    temperature?: number;
    systemPrompt?: string;
}

const DEFAULT_SYSTEM_PROMPT = `You are an agentic AI assistant that solves tasks by reasoning step-by-step.

You have access to tools. For each step, you must:
1. THINK: Reason about what to do next
2. ACT: Choose a tool and provide inputs
3. OBSERVE: Analyze the tool's output
4. DECIDE: Continue with more steps or provide final answer

CRITICAL FORMATTING RULES:
- Action field MUST contain ONLY the exact tool name, nothing else
- Action field MUST NOT contain sentences, explanations, or markdown
- Action field MUST NOT contain words like "Use", "Call", "Execute"
- Action field MUST be just the tool name: "integrations.firebase.read"

Format your response EXACTLY as:
Thought: [your reasoning about what to do next]
Action: [exact tool name only - no extra words]
Action Input: [JSON object with tool parameters]

After seeing the observation, either:
- Continue with another Thought/Action/Action Input
- Or provide: Final Answer: [your complete response]`;

/**
 * Execute a task using the ReAct (Reason + Act) pattern
 * Agent reasons about the task, acts by calling tools, observes results, and iterates
 */
export async function executeReAct(
    task: string,
    availableTools: ToolDescriptor[],
    toolContext: ToolContext,
    config: ReActConfig = {}
): Promise<ReActResult> {
    const {
        maxSteps = 5,
        model = AI_MODEL,
        temperature = 0.7,
        systemPrompt = DEFAULT_SYSTEM_PROMPT,
    } = config;

    const steps: ReActStep[] = [];
    const messages: OpenAI.ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
    ];

    // Build tool descriptions for the agent
    const toolDescriptions = availableTools
        .map(
            (tool, idx) =>
                `${idx + 1}. ${tool.name}: ${tool.description}`
        )
        .join("\n");

    const initialPrompt = `Task: ${task}

Available tools:
${toolDescriptions}

Begin! Remember to follow the Thought/Action/Action Input format.`;

    messages.push({ role: "user", content: initialPrompt });

    try {
        for (let stepNum = 0; stepNum < maxSteps; stepNum++) {
            // Get agent's reasoning and action
            const response = await openai.chat.completions.create({
                model,
                messages,
                temperature,
            });

            const agentResponse = response.choices[0]?.message?.content || "";
            messages.push({ role: "assistant", content: agentResponse });

            // Check if agent provided final answer
            if (agentResponse.includes("Final Answer:")) {
                const finalAnswer = agentResponse
                    .split("Final Answer:")[1]
                    ?.trim() || agentResponse;

                return {
                    finalAnswer,
                    steps,
                    success: true,
                };
            }

            // Parse Thought/Action/Action Input
            const thought = extractSection(agentResponse, "Thought");
            let action = extractSection(agentResponse, "Action");
            const actionInputRaw = extractSection(agentResponse, "Action Input");

            // Clean up action - remove markdown formatting and extra text
            action = action.replace(/\*\*/g, "")  // Remove bold markdown
                           .replace(/`/g, "")      // Remove code markdown
                           .replace(/\n.*$/s, "")  // Remove any text after newlines
                           .trim();

            // Fix common LLM mistakes in action field
            if (action.includes("Action Input:")) {
                action = action.split("Action Input:")[0].trim();
            }
            
            // Remove common prefixes that LLM adds
            action = action.replace(/^use\s+/i, "")  // Remove "Use " at start
                           .replace(/^call\s+/i, "")  // Remove "Call " at start
                           .replace(/^execute\s+/i, "")  // Remove "Execute " at start
                           .replace(/^to\s+/i, "")  // Remove "To " at start
                           .replace(/\s+to\s+.*$/i, "")  // Remove " to ..." at end
                           .trim();
            
            // Validate action is just a tool name (contains only letters, numbers, dots, underscores, hyphens)
            if (action && !/^[a-zA-Z0-9._-]+$/.test(action)) {
                // Try to extract tool name from the text using common patterns
                const toolNameMatch = action.match(/[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/);
                if (toolNameMatch) {
                    action = toolNameMatch[0];
                }
            }

            if (!action) {
                // Agent didn't provide proper format, prompt to continue
                messages.push({
                    role: "user",
                    content:
                        "Please provide your next step in the format: Thought: ... | Action: ... | Action Input: {...}",
                });
                continue;
            }

            // Parse action input as JSON
            let actionInput: Record<string, any> = {};
            try {
                actionInput = JSON.parse(actionInputRaw || "{}");
            } catch (e) {
                // If parsing fails, try to extract key-value pairs
                actionInput = { prompt: actionInputRaw };
            }

            // Find and execute the tool
            const tool = availableTools.find(
                (t) => t.name.toLowerCase() === action.toLowerCase().trim()
            );

            let observation = "";
            if (tool) {
                try {
                    const result = await tool.run(actionInput, toolContext);
                    observation = result.output || JSON.stringify(result);
                } catch (error) {
                    observation = `Error executing ${action}: ${error instanceof Error ? error.message : String(error)
                    }`;
                }
            } else {
                observation = `Tool '${action}' not found. Available tools: ${availableTools
                    .map((t) => t.name)
                    .join(", ")}`;
            }

            // Record this step
            steps.push({
                thought,
                action,
                actionInput,
                observation,
                timestamp: Date.now(),
            });

            // Provide observation to agent
            messages.push({
                role: "user",
                content: `Observation: ${observation}

What's your next step? (Thought/Action/Action Input) or provide Final Answer if done.`,
            });
        }

        // Max steps reached without final answer
        return {
            finalAnswer: "Task incomplete: Maximum steps reached without final answer.",
            steps,
            success: false,
            error: "MAX_STEPS_EXCEEDED",
        };
    } catch (error: any) {
        console.error("ReAct Execution Error:", error);
        return {
            finalAnswer: "",
            steps,
            success: false,
            error: error.message || String(error),
        };
    }
}

/**
 * Extract a section from agent's formatted response
 */
function extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(`${sectionName}:\\s*(.+?)(?=\\n[A-Z][a-z]+:|$)`, "is");
    const match = text.match(regex);
    return match ? match[1].trim() : "";
}

/**
 * Execute ReAct with streaming for real-time updates
 */
export async function executeReActStreaming(
    task: string,
    availableTools: ToolDescriptor[],
    toolContext: ToolContext,
    onStep: (step: ReActStep) => void,
    config: ReActConfig = {}
): Promise<ReActResult> {
    // Implementation would use SSE or WebSocket to stream steps
    // For now, just call regular executeReAct and emit steps after
    const result = await executeReAct(task, availableTools, toolContext, config);
    result.steps.forEach(onStep);
    return result;
}
