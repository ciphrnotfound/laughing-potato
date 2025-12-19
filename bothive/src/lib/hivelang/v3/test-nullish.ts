
import { Interpreter } from "./interpreter";

async function testNullish() {
    const interpreter = new Interpreter();

    const code = `
bot "TestBot"
  on input
    set a = null
    set b = "Default"
    set c = a ?? b
    say "C is: " + c
    
    set d = "Original"
    set e = d ?? "Fallback"
    say "E is: " + e

    set f = undefined
    set g = f ?? "Missing"
    say "G is: " + g
  end
end
`;

    // We don't have a 'null' literal yet, but variables can be null from context
    const res = await interpreter.run(code, { message: "test" });
    console.log("Output:", res.output);
}

testNullish();
