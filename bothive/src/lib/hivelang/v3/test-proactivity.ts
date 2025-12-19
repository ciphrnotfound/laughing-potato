
import { executeHiveLangEvent } from "../../../lib/agents/hivelang-executor";
import { allTools } from "../../../lib/tools";
import { createSharedMemory } from "../../../lib/sharedMemory";

async function testProactivity() {
    console.log("🚀 Testing Event-Tied Proactivity...");

    const source = `
bot ProactiveBot
  on input
    say "I heard you!"
  end

  on event "post_chat"
    say f"I am thinking about your message: {input.input}"
    say "Processing autonomous follow-up..."
    say "Done!"
  end
end
`;

    const context = {
        metadata: { userId: "test-user", botId: "test-bot" },
        sharedMemory: createSharedMemory("test-proactive")
    };

    const result = await executeHiveLangEvent(
        source,
        "post_chat",
        { input: "I want to build a swarm of coding agents." },
        allTools,
        context
    );

    console.log("Result Success:", result.success);
    console.log("Output:\n", result.output);
    console.log("Transcript:", JSON.stringify(result.transcript, null, 2));

    if (result.success && result.output.includes("Summary:")) {
        console.log("✅ Proactivity Test Passed!");
    } else {
        console.error("❌ Proactivity Test Failed!");
        console.error("Error:", result.error);
    }
}

testProactivity().catch(console.error);
