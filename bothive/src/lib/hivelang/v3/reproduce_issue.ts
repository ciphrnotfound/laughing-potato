
import { Interpreter } from "./interpreter";
import { Tokenizer } from "./tokenizer";
import { Parser } from "./parser";

// Mock Tool Context
const mockContext = {
    metadata: { userId: "user_123" }
};

// Mock Notion Tool Failure
const notionTool = {
    name: "notion.create_page",
    run: async (args: any) => {
        // Simulate failure or check if args are passed correctly
        console.log("NOTION TOOL CALLED WITH:", args);
        return { success: true, output: "Page Created" };
    }
};

async function runTest() {
    const code = `
bot "NotionBot"
  on input
    // User attempts to call notion
    call notion.create_page with { title: "Test Page" } as res
    say res.output
  end
end
`;

    const interpreter = new Interpreter();

    // SCENARIO 1: Tool is registered (Success Case)
    interpreter.registerTool("notion.create_page", async (args) => {
        return await notionTool.run(args);
    });

    console.log("--- TEST 1: Tool Registered ---");
    const res1 = await interpreter.run(code, { message: "make page" });
    console.log("Output:", res1.output);

    // SCENARIO 2: Tool NOT registered (Failure Case -> Fallback)
    const interpreter2 = new Interpreter();

    // Simulate Fallback Handler refusing or failing
    interpreter2.setFallbackToolHandler(async (args) => {
        console.log("FALLBACK CALLED FOR:", args.tool);
        throw new Error("Tool not found in integration bridge");
    });

    console.log("\\n--- TEST 2: Tool Missing (Fallback Fails) ---");
    const res2 = await interpreter2.run(code, { message: "make page" });
    console.log("Output:", res2.output);
    console.log("Errors:", res2.errors);
}

runTest();
