import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import { createClient } from "@supabase/supabase-js";


export interface HiveLangExecutionResult {
    output: string;
    transcript: any[];
    steps: any[];
    success: boolean;
    error?: string;
    variables?: Record<string, any>;
}


// Initialize Supabase client for server-side usage
const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return null;
    }

    return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Integration Bridge - Resolves tool calls to community integrations
 * Format: integration_slug.capability_name (e.g., "instagram.post_image")
 */
async function resolveIntegrationTool(
    toolName: string,
    args: Record<string, any>,
    userId?: string
): Promise<{ found: boolean; result?: any; error?: string }> {
    // Parse tool name: "integration.capability"
    const parts = toolName.split(".");
    if (parts.length !== 2) {
        return { found: false };
    }

    const [integrationSlug, capabilityName] = parts;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return { found: false, error: "Database not configured" };
    }

    // Look up integration by slug
    const { data: integration, error: integrationError } = await supabase
        .from("integrations")
        .select("id, name, slug, hivelang_code, capabilities")
        .eq("slug", integrationSlug)
        .single();

    if (integrationError || !integration) {
        // Not a community integration, return not found so fallback to built-ins
        return { found: false };
    }

    // Check if this integration has HiveLang code
    if (!integration.hivelang_code) {
        return { found: false, error: `Integration ${integrationSlug} is not HiveLang-based` };
    }

    // If user is executing, get their credentials
    let userCredentials: Record<string, any> = {};
    if (userId) {
        const { data: userIntegration } = await supabase
            .from("user_integrations")
            .select("*")
            .eq("user_id", userId)
            .eq("integration_id", integration.id)
            .eq("status", "active")
            .single();

        if (userIntegration) {
            userCredentials = {
                access_token: userIntegration.access_token,
                refresh_token: userIntegration.refresh_token,
                api_key: userIntegration.additional_config?.api_key,
                ...userIntegration.additional_config,
            };
        }
    }

    // Get or create runtime from cache
    let runtime = integrationCache.get(integration.id);
    if (!runtime) {
        runtime = new HiveLangRuntime();
        runtime.loadCode(integration.hivelang_code);
        integrationCache.set(integration.id, runtime);
    }

    // Set context with user credentials
    runtime.setContext({
        user: {
            id: userId ?? "anonymous",
            ...userCredentials,
        },
        integration: {
            id: integration.id,
            name: integration.name,
            slug: integration.slug,
        },
    });

    // Execute the capability
    try {
        const result = await runtime.executeCapability(capabilityName, args);
        return { found: true, result };
    } catch (err: any) {
        return { found: true, error: err.message ?? String(err) };
    }
}

/**
 * Execute a HiveLang program using DETERMINISTIC compiled code execution
 * This runs the actual compiled logic instead of prompting an LLM
 * Now with Integration Bridge for community-created integrations!
 */
/**
 * Execute a HiveLang program using the V3 Standalone Interpreter
 */
import { Interpreter } from "../hivelang/v3/interpreter";

export async function executeHiveLangProgram(
    hiveLangSource: string,
    input: Record<string, any>,
    availableTools: ToolDescriptor[],
    toolContext: ToolContext,
    initialVariables?: Record<string, any>
): Promise<HiveLangExecutionResult> {
    try {
        const interpreter = new Interpreter();

        // 1. Build tool lookup map
        // We use PASS 1 and PASS 2 logic for priority

        // 2. Register Built-in Tools
        // PASS 1: Register all capabilities as fallbacks
        for (const tool of availableTools) {
            if (tool.capability) {
                interpreter.registerTool(tool.capability, async (args: any, context: any) => {
                    return await tool.run(args, toolContext);
                });
            }
        }

        // PASS 2: Register all names (higher priority, overwrites capability clashes)
        for (const tool of availableTools) {
            interpreter.registerTool(tool.name, async (args: any, context: any) => {
                return await tool.run(args, toolContext);
            });
        }



        // 3. Register Fallback for Integrations
        const userId = toolContext.metadata?.userId;

        interpreter.setFallbackToolHandler(async (args: any, context: any) => {
            const toolName = args.tool; // tool name passed in args by our interpreter logic change? 
            // Wait, my interpreter logic passes { tool: toolName, ...args } to fallback

            // Extract tool name from the extended args if mixed, or args is just args?
            // In interpreter: `this.fallbackToolHandler({ tool: toolName, ...args }, ...)`
            // So tool name is in `args.tool`.
            const realToolName = args.tool;
            // Remove tool from args for the actual call
            const { tool: _, ...callArgs } = args;

            const integrationResult = await resolveIntegrationTool(
                realToolName,
                callArgs,
                userId
            );

            if (integrationResult.found) {
                if (integrationResult.error) {
                    throw new Error(integrationResult.error);
                }
                return integrationResult.result;
            }

            throw new Error(`Tool not found: ${realToolName}`);
        });

        // 4. Run Interpreter
        // v3 run() takes string code and ONE input object/string and optional initialVariables.
        const result = await interpreter.run(hiveLangSource, input, initialVariables);

        // 5. Format Result
        // Collect transcript from output and tool calls?
        // Legacy "transcript" is a list of events.
        // V3 `result.output` is array of strings (Say statements)
        // V3 `result.toolCalls` is array of { tool, args }

        // We need to synthesize a transcript to match UI expectations if possible
        const transcript: any[] = [];

        // Add Says
        result.output.forEach(msg => {
            transcript.push({ type: "say", payload: msg, timestamp: Date.now() });
        });

        // Add Tools
        result.toolCalls.forEach(tc => {
            transcript.push({ type: "call", tool: tc.tool, args: tc.args, timestamp: Date.now() });
        });

        if (result.errors.length > 0) {
            return {
                output: result.output.join("\n"),
                transcript,
                steps: [],
                success: false,
                error: result.errors.join("\n"),
            };
        }

        return {
            output: result.output.join("\n"),
            transcript,
            steps: [], // streaming steps not yet unified
            success: true,
            variables: result.variables
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
 * Execute a specific event handler in a HiveLang program (Proactivity)
 */
export async function executeHiveLangEvent(
    hiveLangSource: string,
    eventName: string,
    input: Record<string, any>,
    availableTools: ToolDescriptor[],
    toolContext: ToolContext
): Promise<HiveLangExecutionResult> {
    try {
        const interpreter = new Interpreter();

        // PASS 1: Register all capabilities as fallbacks
        for (const tool of availableTools) {
            if (tool.capability) {
                interpreter.registerTool(tool.capability, async (args: any, context: any) => {
                    return await tool.run(args, toolContext);
                });
            }
        }

        // PASS 2: Register all names (higher priority, overwrites capability clashes)
        for (const tool of availableTools) {
            interpreter.registerTool(tool.name, async (args: any, context: any) => {
                return await tool.run(args, toolContext);
            });
        }



        const userId = toolContext.metadata?.userId;
        interpreter.setFallbackToolHandler(async (args: any, context: any) => {
            const realToolName = args.tool;
            const { tool: _, ...callArgs } = args;
            const integrationResult = await resolveIntegrationTool(realToolName, callArgs, userId);
            if (integrationResult.found) {
                if (integrationResult.error) throw new Error(integrationResult.error);
                return integrationResult.result;
            }
            throw new Error(`Tool not found: ${realToolName}`);
        });

        // 2. Load and Emit
        await interpreter.load(hiveLangSource);
        const result = await interpreter.emitEvent(eventName, input);

        // 3. Format result
        const transcript: any[] = [];
        result.output.forEach(msg => transcript.push({ type: "say", payload: msg, timestamp: Date.now() }));
        result.toolCalls.forEach(tc => transcript.push({ type: "call", tool: tc.tool, args: tc.args, timestamp: Date.now() }));

        return {
            output: result.output.join("\n"),
            transcript,
            steps: [],
            success: result.errors.length === 0,
            error: result.errors.length > 0 ? result.errors.join("\n") : undefined
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
 * Execute HiveLang with streaming support for real-time updates
 */
export async function executeHiveLangProgramStreaming(
    hiveLangSource: string,
    input: Record<string, any>,
    availableTools: ToolDescriptor[],
    toolContext: ToolContext,
    onStep: (step: any) => void
): Promise<HiveLangExecutionResult> {
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
 * Validate HiveLang program can be executed using V3 Engine
 */
import { Tokenizer } from "../hivelang/v3/tokenizer";
import { Parser } from "../hivelang/v3/parser";

export async function validateHiveLangProgram(
    hiveLangSource: string,
    availableTools: ToolDescriptor[]
): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
        // 1. Tokenize
        const tokenizer = new Tokenizer(hiveLangSource);
        const tokens = tokenizer.tokenize();

        // 2. Parse
        const parser = new Parser(tokens);
        const program = parser.parse();

        // 3. Static Analysis (Basic)
        // We could walk the AST to check for invalid tool calls if we wanted.
        // For now, if parsing succeeds, it's valid syntax.

        // TODO: AST walker to check for `CallExpression` nodes and verify against `availableTools`
        // program.body...

    } catch (e: any) {
        errors.push(e.message);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
