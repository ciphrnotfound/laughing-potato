import { compileHive, HiveCompileResult } from "../hive-compiler";
import { executeReAct, ReActStep } from "./react-engine";
import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import { getAgentPrompt } from "./prompts";

export interface HiveLangExecutionResult {
    output: string;
    transcript: any[];
    steps: ReActStep[];
    success: boolean;
    error?: string;
}

/**
 * Execute a HiveLang program using the ReAct pattern
 * This bridges compiled HiveLang to agentic execution
 */
export async function executeHiveLangProgram(
    hiveLangSource: string,
    input: Record<string, any>,
    availableTools: ToolDescriptor[],
    toolContext: ToolContext
): Promise<HiveLangExecutionResult> {
    try {
        // Step 1: Compile HiveLang source
        const compiled: HiveCompileResult = await compileHive(hiveLangSource);

        if (compiled.diagnostics.some((d) => d.severity === "error")) {
            const errors = compiled.diagnostics
                .filter((d) => d.severity === "error")
                .map((d) => `Line ${d.line}: ${d.message}`)
                .join("\n");

            return {
                output: "",
                transcript: [],
                steps: [],
                success: false,
                error: `HiveLang compilation failed:\n${errors}`,
            };
        }

        // Step 2: Create execution context
        const metadata = compiled.metadata;
        const transcript: any[] = [];

        // Add metadata to transcript
        transcript.push({
            type: "metadata",
            bot: metadata.name,
            description: metadata.description,
            tools: metadata.tools,
            memory: metadata.memory,
            timestamp: Date.now(),
        });

        // Step 3: Execute the compiled program with ReAct
        // The compiled program contains instructions that may include tool calls
        // We'll execute these through the ReAct pattern for agentic behavior

        const executionTask = buildExecutionTask(metadata, input);

        // Filter tools to only those declared in HiveLang
        const declaredTools = availableTools.filter((tool) =>
            metadata.tools.includes(tool.name) ||
            metadata.tools.includes(tool.capability)
        );

        // Execute with ReAct pattern
        const reactResult = await executeReAct(
            executionTask,
            declaredTools,
            toolContext,
            {
                maxSteps: 10,
                systemPrompt: toolContext.metadata?.botSystemPrompt
                    ? `${toolContext.metadata.botSystemPrompt}\n\n${getAgentPrompt("react")}`
                    : getAgentPrompt("react"),
            }
        );

        // Step 4: Combine results
        transcript.push({
            type: "execution",
            steps: reactResult.steps,
            finalAnswer: reactResult.finalAnswer,
            timestamp: Date.now(),
        });

        return {
            output: reactResult.finalAnswer,
            transcript,
            steps: reactResult.steps,
            success: reactResult.success,
            error: reactResult.error,
        };
    } catch (error) {
        return {
            output: "",
            transcript: [],
            steps: [],
            success: false,
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

/**
 * Build execution task from HiveLang metadata and input
 */
function buildExecutionTask(
    metadata: { name: string; description?: string; tools: string[]; memory: string[] },
    input: Record<string, any>
): string {
    const description = metadata.description || "Execute bot task";
    const inputStr = JSON.stringify(input, null, 2);

    return `You are ${metadata.name}, ${description}.

Input:
${inputStr}

Available tools: ${metadata.tools.join(", ")}
${metadata.memory.length > 0 ? `Memory keys: ${metadata.memory.join(", ")}` : ""}

Execute the task using the available tools. Show your reasoning at each step.`;
}

/**
 * Execute HiveLang with streaming support for real-time updates
 */
export async function executeHiveLangProgramStreaming(
    hiveLangSource: string,
    input: Record<string, any>,
    availableTools: ToolDescriptor[],
    toolContext: ToolContext,
    onStep: (step: ReActStep) => void
): Promise<HiveLangExecutionResult> {
    // For now, execute normally and emit steps after
    // TODO: Implement true streaming with SSE/WebSocket
    const result = await executeHiveLangProgram(
        hiveLangSource,
        input,
        availableTools,
        toolContext
    );

    result.steps.forEach(onStep);
    return result;
}

/**
 * Validate HiveLang program can be executed
 */
export async function validateHiveLangProgram(
    hiveLangSource: string,
    availableTools: ToolDescriptor[]
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const compiled = await compileHive(hiveLangSource);

    const errors = compiled.diagnostics
        .filter((d) => d.severity === "error")
        .map((d) => `Line ${d.line}: ${d.message}`);

    const warnings = compiled.diagnostics
        .filter((d) => d.severity === "warning")
        .map((d) => `Line ${d.line}: ${d.message}`);

    // Check if declared tools are available
    const toolNames = availableTools.map((t) => t.name);
    const toolCapabilities = availableTools.map((t) => t.capability);

    const missingTools = compiled.metadata.tools.filter(
        (tool) => !toolNames.includes(tool) && !toolCapabilities.includes(tool)
    );

    if (missingTools.length > 0) {
        warnings.push(
            `Tools declared but not available: ${missingTools.join(", ")}`
        );
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
