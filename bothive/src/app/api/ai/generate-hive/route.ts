import { OpenAI } from "openai";
import { NextResponse } from "next/server";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert HiveLang developer. HiveLang is a domain-specific language for defining AI bots.
Your goal is to write valid HiveLang code based on the user's request.

### HiveLang Syntax Rules:
1. **Bot Definition**: Start with \`bot BotName\` and optionally \`description "..."\`.
2. **Input Handler**: Logic goes inside \`on input\` ... \`end\`.
3. **Output**: Use \`say "message"\` or \`say """multiline message"""\`.
4. **Variables**: Use \`set $varName value\`.
5. **Tool Calls**: Use \`call tool.name with { arg: "value" } as resultName\`.
   - Common tools: \`general.respond\`, \`browser.open\`, \`browser.screenshot\`, \`vision.analyze\`, \`social.publish\`, \`email.send\`.
6. **Conditionals**: \`if condition\` ... \`end\`.
7. **Loops**: \`loop item in list\` ... \`end\`.
8. **Memory**: \`remember "key" as "value"\`.

### Example:
bot StudyBuddy
  description "Helps with studying"

  on input
    if input contains "quiz"
      call general.respond with { prompt: "Generate a quiz for: " + input } as quiz
      say quiz.output
    end
  end
end

### Instructions:
- Return ONLY the HiveLang code.
- Do not wrap in markdown code blocks.
- Ensure all blocks are closed with \`end\`.
- Use meaningful variable names.
`;

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: prompt },
            ],
            temperature: 0.2,
        });

        const code = completion.choices[0].message.content?.trim() || "";

        // Basic cleanup if the model returns markdown
        const cleanCode = code.replace(/^```hive\n/, "").replace(/^```\n/, "").replace(/```$/, "");

        return NextResponse.json({ 
            code: cleanCode,
            explanation: "Generated based on your request." 
        });

    } catch (error: any) {
        console.error("AI Generation Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate code" },
            { status: 500 }
        );
    }
}
