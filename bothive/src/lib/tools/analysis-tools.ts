
import { ToolDescriptor } from "@/lib/agentTypes";
import { aiClient, AI_MODEL } from "@/lib/ai-client";

const openai = aiClient;

/**
 * Advanced Analysis Tools for College Essays and Creative Writing
 */
export const analysisTools: ToolDescriptor[] = [
    {
        name: "analysis.style",
        capability: "analysis.style",
        description: "Analyze writing style for specific 'Ivy League' metrics like Vulnerability and Intellectual Vitality.",
        async run(args, ctx) {
            const text = typeof args.text === "string" ? args.text : "";

            if (!text) return { success: false, output: "Text to analyze is required" };

            const prompt = `
            Analyze the following college essay draft based on these elite admissions metrics:
            
            1. **Vulnerability Score (0-10)**: How much does the author reveal about their failures or fears?
            2. **Intellectual Vitality (0-10)**: Does it show a genuine love for learning/creating?
            3. **Show, Don't Tell**: Identify 3 specific sentences that "tell" instead of "show".
            4. **Cliché Detector**: varied tone? distinct voice?

            Text:
            "${text.substring(0, 3000)}"

            Return the results in JSON format with keys: vulnerability_score, vitality_score, show_dont_tell_issues (array), cliche_flags (array), and a "ruthless_critique" summary.
            `;

            try {
                const response = await openai.chat.completions.create({
                    model: AI_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.2,
                    response_format: { type: "json_object" }
                });

                const analysis = response.choices[0]?.message?.content || "{}";

                return {
                    success: true,
                    output: analysis,
                    data: JSON.parse(analysis)
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Style analysis failed: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        }
    },
    {
        name: "analysis.structure",
        capability: "analysis.structure",
        description: "Map the text to a narrative structure (Hero's Journey, Montage, etc.)",
        async run(args, ctx) {
            const text = typeof args.text === "string" ? args.text : "";

            if (!text) return { success: false, output: "Text to analyze is required" };

            const prompt = `
            Analyze the narrative structure of this essay.
            
            1. Identify the structural archetype (e.g., Narrative Arc, Montage, Braided, or Unstructured).
            2. Extract these key beats:
               - Hook
               - Inciting Incident
               - Reflection / Pivot
               - Conclusion
            3. Rate the "Flow" (0-10).

            Text:
            "${text.substring(0, 3000)}"

            Return formatted as readable text (Markdown).
            `;

            try {
                const response = await openai.chat.completions.create({
                    model: AI_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.2
                });

                const analysis = response.choices[0]?.message?.content || "";

                return {
                    success: true,
                    output: analysis,
                    data: { analysis }
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Structure analysis failed: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        }
    }
];
