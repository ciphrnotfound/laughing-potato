
import { Interpreter } from './interpreter';

async function runTest() {
    const code = `
bot TestBot
  on input
    say "Starting V3 Engine Test..."
    set user = "Researcher"
    
    # 1. Test Math & Precedence
    if input contains "math"
        set a = 10
        set b = 5
        set total = a + b * 2
        say f"Math Result (10 + 5*2): {total}"
        
        if total == 20
            say "Math is correct!"
        end
    end

    # 2. Test Lists & Loops
    if input contains "list"
        set items = ["Apple", "Banana", "Cherry"]
        say f"First item: {items[0]}"
        
        loop item in items
            say f"Found: {item}"
        end
    end

    # 3. Test Objects
    if input contains "object"
        set config = { "mode": "dark", "level": 5 }
        say f"Config Mode: {config.mode}"
        
        if config.level > 3
            say "High level config detected."
        end
    end
  end
end
`;

    const interpreter = new Interpreter();

    // Register some mock tools
    interpreter.registerTool('log.info', async (args) => {
        console.log("TOOL CALL [log.info]:", args);
    });

    console.log("--- Executing with input: 'math' ---");
    const result1 = await interpreter.run(code, "test math");
    console.log("Output:", result1.output);

    console.log("\n--- Executing with input: 'list' ---");
    const result2 = await interpreter.run(code, "test list");
    console.log("Output:", result2.output);

    console.log("\n--- Executing with input: 'object' ---");
    const result3 = await interpreter.run(code, "test object");
    console.log("Output:", result3.output);
}

runTest().catch(console.error);
