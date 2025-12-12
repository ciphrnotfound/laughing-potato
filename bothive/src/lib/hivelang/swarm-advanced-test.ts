
import { compileHive } from '../hive-compiler';
import { allTools } from '../tools/index';

// Create a mock context with tools
function createMockContext() {
    const memory = new Map();
    const toolMap = new Map();

    // Register real tools into the mock map
    allTools.forEach(t => toolMap.set(t.name, t.run));

    return {
        memory: {
            get: async (k: string) => memory.get(k),
            set: async (k: string, v: any) => memory.set(k, v),
            append: async (k: string, v: any) => {
                const existing = memory.get(k) || [];
                memory.set(k, Array.isArray(existing) ? [...existing, v] : [existing, v]);
            }
        },
        callTool: async (name: string, ctx: any) => {
            console.log(`[MockRuntime] Calling tool: ${name}`);
            const handler = toolMap.get(name);
            if (handler) {
                // Mock args for test
                const args = ctx.args || {};
                const result = await handler(args, { ...ctx, sharedMemory: memory });
                console.log(`[MockRuntime] Result:`, result.output ? result.output.substring(0, 100) + "..." : "No output");
                return result.output;
            }
            console.warn(`[MockRuntime] Tool not found: ${name}`);
            return "Tool not found";
        },
        input: "",
        locals: {},
        emit: (event: any) => console.log(`[Event]`, event)
    };
}

const source = `
bot IvySwarmAdvancedTest
  agent Critic
    on input
      call analysis.style with { text: input } as styleReport
      say "Style Report: {styleReport}"
    end
  end

  on input
    if input contains "docs.google.com"
       call integration.gdocs.read with { docId: input } as content
       say "Read Doc: {content}"
       call agent.delegate with { agent: "Critic", task: content } as critique
       say "Critique: {critique}"
    else
       say "No doc link found"
    end
  end
end
`;

async function runTest() {
    console.log("Compiling Advanced Swarm Script...");
    const result = await compileHive(source);

    if (result.diagnostics.length > 0) {
        console.error("Compilation errors:", result.diagnostics);
        return;
    }

    console.log("Compilation successful. Initializing runtime...");

    // Extract agents from metadata to simulate runtime injection
    const program = eval(result.code.replace("export default", "global.program ="));
    const agents = global.program.agents;

    const ctx = createMockContext();
    // Inject agents into context (mimicking hive-compiler runtime update)
    (ctx as any).agents = agents;

    console.log("\n--- Test 1: Simulating Google Doc Input ---");
    const testInput = "https://docs.google.com/document/d/123XYZ";

    await global.program.run({
        ...ctx,
        input: testInput
    });
}

runTest();
