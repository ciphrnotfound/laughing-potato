import { compileHive, HiveCompileResult } from "../hive-compiler";
import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import { HiveLangRuntime, integrationCache } from "@/lib/hivelang/runtime";
import { createClient } from "@supabase/supabase-js";

export interface HiveLangExecutionResult {
    output: string;
    transcript: any[];
    steps: any[];
    success: boolean;
    error?: string;
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

        // Step 2: Evaluate the compiled JavaScript to get the program object
        // NOTE: We strip 'export default program;' because 'export' is not valid in new Function()
        const cleanCode = compiled.code.replace(/export default program;/, "");
        const programFactory = new Function(cleanCode + "\nreturn program;");
        const program = programFactory();

        // Step 3: Create execution context with tool bindings
        const transcript: any[] = [];
        const outputs: string[] = [];

        // Build tool lookup map for built-in tools
        const toolMap = new Map<string, ToolDescriptor>();
        for (const tool of availableTools) {
            toolMap.set(tool.name, tool);
            if (tool.capability) {
                toolMap.set(tool.capability, tool);
            }
        }

        // Get user ID from context for integration credentials
        const userId = toolContext.userId ?? toolContext.metadata?.userId;

        // Create the runtime context for program.run()
        const runtimeContext = {
            input,
            locals: {},
            emit: (event: any) => {
                if (event.type === "say") {
                    outputs.push(event.payload);
                }
                transcript.push({ ...event, timestamp: Date.now() });
            },
            callTool: async (toolName: string, ctx: any) => {
                // First, try built-in tools
                const tool = toolMap.get(toolName);
                if (tool) {
                    try {
                        const result = await tool.run(ctx.args ?? {}, toolContext);
                        return result;
                    } catch (err: any) {
                        return { error: err.message ?? String(err) };
                    }
                }

                // If not found, try community integrations!
                const integrationResult = await resolveIntegrationTool(
                    toolName,
                    ctx.args ?? {},
                    userId
                );

                if (integrationResult.found) {
                    if (integrationResult.error) {
                        return { error: integrationResult.error };
                    }
                    return integrationResult.result;
                }

                // Tool not found anywhere
                return { error: `Tool not found: ${toolName}` };
            },
            memory: toolContext.sharedMemory ?? {
                get: async () => undefined,
                set: async () => { },
                append: async () => { },
            },
            evaluate: async (condition: string, ctx: any) => {
                const scope = { ...ctx.input, ...ctx.locals };
                console.log("[Hivelang Evaluate]", { condition, scopeKeys: Object.keys(scope), inputVal: scope.input });
                try {
                    // Preprocess 'contains' to JS '.includes()'
                    // Handle: variable contains "string"
                    // Regex: ([a-zA-Z0-9_.]+) contains "([^"]+)"
                    // Global replacement to handle multiple 'contains'
                    const jsCondition = condition.replace(/([a-zA-Z0-9_.]+)\s+contains\s+"([^"]+)"/g, (_, varName, stringVal) => {
                        return `${varName}?.toLowerCase().includes("${stringVal}".toLowerCase())`;
                    });

                    // Evaluate using Function
                    const result = new Function(...Object.keys(scope), `return ${jsCondition}`)(...Object.values(scope));
                    return Boolean(result);
                } catch (err) {
                    console.error("[Hivelang Evaluate Error]", err);
                    return false;
                }
            },
            resolveCollection: async (key: string) => {
                const parts = key.split(".");
                let value: any = { ...input, ...runtimeContext.locals };
                for (const part of parts) {
                    value = value?.[part];
                }
                return Array.isArray(value) ? value : [];
            }
        };

// Step 4: Execute the program deterministically
const result = await program.run(runtimeContext);

// Merge transcripts
const combinedTranscript = [
    { type: "metadata", bot: compiled.metadata.name, timestamp: Date.now() },
    ...transcript,
    ...(result?.transcript ?? []),
];

return {
    output: outputs.join("\n"),
    transcript: combinedTranscript,
    steps: result?.transcript ?? [],
    success: true,
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

    const toolNames = availableTools.map((t) => t.name);
    const toolCapabilities = availableTools.map((t) => t.capability);

    const missingTools = compiled.metadata.tools.filter(
        (tool) => !toolNames.includes(tool) && !toolCapabilities.includes(tool)
    );

    if (missingTools.length > 0) {
        // Note: These might be community integrations, not necessarily missing
        warnings.push(
            `Tools not in built-ins (may be community integrations): ${missingTools.join(", ")}`
        );
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
