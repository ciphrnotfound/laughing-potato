import { ToolDescriptor, ToolContext, ToolResult } from "@/lib/agentTypes";
import { generateText, AI_MODEL } from "@/lib/ai-client";

/**
 * High-Fidelity Tools for the Digital Doppelgänger (Mirror Swarm)
 * These tools use LLMs to learn, triage, and scale a user's personality.
 */

export const doppelgangerTools: ToolDescriptor[] = [
    {
        name: "communication.generate_style_profile",
        capability: "communication.analyze",
        description: "Analyze a batch of historical messages to extract a 'Personality DNA' profile. Args: { messages: string[] }",
        run: async (args: Record<string, any>, ctx: ToolContext): Promise<ToolResult> => {
            const messages = args.messages || [];
            if (messages.length === 0) {
                return { success: false, output: "No messages provided for analysis." };
            }

            const prompt = `Analyze the following messages and extract a communication style profile. 
            Include: 
            1. Tone (e.g., professional, chaotic, casual)
            2. Emoji frequency and typical choices
            3. Common slang or catchphrases
            4. Punctuation habits (e.g., lots of exclamation marks, no capital letters)
            5. Average response length.
            
            Return ONLY a JSON object with these keys: tone, emojis, slang, quirks, avg_length.
            
            Messages:
            ${messages.join("\n---\n")}`;

            try {
                const analysis = await generateText(prompt);
                // Attempt to parse JSON from the response
                const jsonMatch = analysis.match(/\{[\s\S]*\}/);
                const profile = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: analysis };

                return {
                    success: true,
                    output: `HISTORIAN LOG: Personality DNA extracted. Found traits: ${profile.tone || 'custom'}.`,
                    data: profile
                };
            } catch (error) {
                return { success: false, output: `Failed to analyze style: ${error}` };
            }
        }
    },
    {
        name: "communication.evaluate_urgency",
        capability: "communication.triage",
        description: "Evaluate if a message requires immediate human attention based on sentiment and context. Args: { message: string, rules: string[] }",
        run: async (args: Record<string, any>, ctx: ToolContext): Promise<ToolResult> => {
            const { message, rules = ["Notify if person sounds upset", "Notify for business critical issues"] } = args;

            const prompt = `Act as a Gatekeeper agent. Your goal is to decide if the human needs to be woken up for this message.
            Rules:
            ${rules.join("\n")}
            
            Message: "${message}"
            
            Respond with a JSON object: { "escalate": boolean, "reason": "string", "priority": "low" | "medium" | "high" }`;

            try {
                const result = await generateText(prompt);
                const jsonMatch = result.match(/\{[\s\S]*\}/);
                const decision = jsonMatch ? JSON.parse(jsonMatch[0]) : { escalate: false, reason: "Analysis failed", priority: "low" };

                return {
                    success: true,
                    output: `GATEKEEPER DECISION: ${decision.escalate ? "ESCALATE" : "HANDLE AUTOMATICALLY"}. Reason: ${decision.reason}`,
                    data: decision
                };
            } catch (error) {
                return { success: false, output: `Triage failed: ${error}` };
            }
        }
    },
    {
        name: "communication.draft_identity_reply",
        capability: "communication.generate",
        description: "Draft a reply using a specific Personality DNA profile. Args: { context: string, profile: any, inbound_message: string }",
        run: async (args: Record<string, any>, ctx: ToolContext): Promise<ToolResult> => {
            const { context, profile, inbound_message } = args;

            if (!profile) {
                return { success: false, output: "No style profile provided for drafting." };
            }

            const prompt = `Act as a Digital Doppelgänger. Reply to the message below using this exact personality profile:
            Tone: ${profile.tone}
            Emojis: ${profile.emojis}
            Slang: ${profile.slang}
            Quirks: ${profile.quirks}
            
            Context of conversation: ${context}
            Inbound message: "${inbound_message}"
            
            Generate a reply that sounds exactly like this person. No prefixes, just the message.`;

            try {
                const draft = await generateText(prompt);
                return {
                    success: true,
                    output: `GHOSTWRITER LOG: High-fidelity draft generated using personality match.`,
                    data: { draft, profile_used: profile.tone }
                };
            } catch (error) {
                return { success: false, output: `Drafting failed: ${error}` };
            }
        }
    }
];
