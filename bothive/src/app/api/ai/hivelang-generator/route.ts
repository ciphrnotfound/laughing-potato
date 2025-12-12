import { NextRequest, NextResponse } from "next/server";
import { aiClient, AI_MODEL } from "@/lib/ai-client";

/**
 * POST /api/ai/hivelang-generator - Generate HiveLang code using AI
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, currentCode = "", conversationHistory = [] } = body;

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt is required" },
                { status: 400 }
            );
        }

        // Build context from conversation history
        const context = conversationHistory.length > 0 
            ? `Previous requests: ${conversationHistory.slice(-3).join("\n")}\n\n`
            : "";

        // Build system prompt for HiveLang generation
        const systemPrompt = `You are an expert HiveLang developer. Generate clean, well-commented HiveLang code based on user requests.

HiveLang Syntax Rules:
- Bots start with: bot BotName\n  description "Description here"\n  on input\n    # Your code here\n  end\nend
- Use 'say' for output, 'call' for tool integration, 'if' for conditions, 'loop' for iteration
- Variables start with $ (e.g., $variable)
- Memory: remember "key" as "$value", recall "key"
- Tools: call toolName with param1: "$value", param2: "value"
- Comments start with --
- Multi-line strings use """ """

Available tools include:
- whatsapp.sendMessage, email.send, social.publish, browser.open
- general.respond, coding.review, study.explain, study.quizBuilder
- integrations.firebase.read/write, calendar.schedule
- agent.plan, agent.analyze, agent.evaluate

Generate code that:
1. Follows HiveLang syntax exactly
2. Includes proper error handling
3. Uses meaningful variable names
4. Includes helpful comments
5. Handles edge cases

Current code context (if any):
${currentCode}

${context}`;

        const userPrompt = `Generate HiveLang code for: ${prompt}

Please provide:
1. A brief explanation of what the code does
2. The complete HiveLang code
3. Any setup requirements or notes

Format your response as:
EXPLANATION: [your explanation]
CODE: [the HiveLang code]
NOTES: [any setup notes]`;

        const completion = await aiClient.chat.completions.create({
            model: AI_MODEL,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: 0.3, // Lower temperature for more consistent code generation
            max_tokens: 2000,
        });

        const response = completion.choices[0]?.message?.content || "";
        
        // Parse the response to extract explanation and code
        const explanationMatch = response.match(/EXPLANATION:\s*([\s\S]*?)(?=\nCODE:|$)/);
        const codeMatch = response.match(/CODE:\s*```(?:hive)?\n([\s\S]*?)\n```(?:\nNOTES:|$)/);
        const notesMatch = response.match(/NOTES:\s*([\s\S]*)$/);

        const explanation = explanationMatch?.[1]?.trim() || "Here's the HiveLang code for your request:";
        const code = codeMatch?.[1]?.trim() || response; // Fallback to full response if parsing fails
        const notes = notesMatch?.[1]?.trim() || "";

        // Validate basic HiveLang syntax
        const validation = validateHiveLangSyntax(code);

        return NextResponse.json({
            explanation: notes ? `${explanation}\n\n${notes}` : explanation,
            code: validation.isValid ? code : fixCommonSyntaxErrors(code),
            validation,
            success: true
        });

    } catch (error: any) {
        console.error('HiveLang generator error:', error);
        return NextResponse.json(
            { 
                error: error.message || "Failed to generate HiveLang code",
                code: generateFallbackCode("general request"),
                success: false
            },
            { status: 500 }
        );
    }
}

function validateHiveLangSyntax(code: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validation rules
    if (!code.includes('bot ') || !code.includes('end')) {
        errors.push("Missing bot declaration or end statement");
    }
    
    if (!code.includes('on input')) {
        errors.push("Missing 'on input' block");
    }
    
    // Check for balanced quotes in say statements
    const sayMatches = code.match(/say\s+"""[\s\S]*?"""/g) || [];
    sayMatches.forEach(match => {
        const quotes = match.match(/"/g);
        if (quotes && quotes.length % 2 !== 0) {
            errors.push("Unbalanced quotes in say statement");
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

function fixCommonSyntaxErrors(code: string): string {
    let fixed = code;
    
    // Fix missing bot/end structure
    if (!fixed.includes('bot ') && !fixed.includes('end')) {
        fixed = `bot GeneratedBot
  description "AI generated bot"

  on input
${fixed.split('\n').map(line => '    ' + line).join('\n')}
  end
end`;
    }
    
    // Fix missing on input
    if (!fixed.includes('on input')) {
        fixed = fixed.replace(/bot\s+\w+/, (match) => `${match}\n\n  on input\n    ${fixed.includes('say') ? '' : 'say "Hello!"'}\n  end`);
    }
    
    return fixed;
}

function generateFallbackCode(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes("study") || lowerPrompt.includes("quiz")) {
        return `bot StudyBot
  description "AI-powered study assistant"

  on input
    if input contains "explain"
      set topic input
      ask ai "Explain {topic} in simple terms"
      say """{result}"""
    end

    if input contains "quiz"
      set topic input
      ask ai "Create 5 quiz questions about {topic}"
      say """📝 Quiz Time!\n{result}"""
    end
  end
end`;
    }
    
    return `bot AssistantBot
  description "General purpose assistant"

  on input
    ask ai "Help with: {input}"
    say """{result}"""
  end
end`;
}