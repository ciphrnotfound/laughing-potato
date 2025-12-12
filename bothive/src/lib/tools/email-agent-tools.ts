import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import { aiClient, AI_MODEL } from "@/lib/ai-client";

/**
 * Email Agent Tools
 * Specialist agent for email classification, reading, and responding
 */

export const emailAgentTools: ToolDescriptor[] = [
    {
        name: "email.classify",
        capability: "email.agent",
        description: "Classify email into categories (inquiry, complaint, spam, order, general)",
        async run(args, ctx) {
            const emailContent = typeof args.email === "string" ? args.email : JSON.stringify(args.email);

            if (!emailContent) {
                return { success: false, output: "Email content required" };
            }

            try {
                const completion = await aiClient.chat.completions.create({
                    model: AI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: `You are an email classification specialist. Analyze emails and respond with ONLY a JSON object:
{
  "category": "inquiry|complaint|spam|order|general",
  "priority": "high|medium|low",
  "sentiment": "positive|neutral|negative",
  "extractedInfo": {
    "contactName": "...",
    "company": "...",
    "email": "...",
    "phone": "...",
    "specificRequest": "..."
  },
  "requiresAction": true|false
}`
                        },
                        {
                            role: "user",
                            content: `Classify this email:\n\n${emailContent}`
                        }
                    ],
                    temperature: 0.3,
                });

                const response = completion.choices[0]?.message?.content || "{}";
                const classification = JSON.parse(response);

                return {
                    success: true,
                    output: JSON.stringify(classification, null, 2),
                    data: classification,
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Email classification failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "email.generateResponse",
        capability: "email.agent",
        description: "Generate professional email response based on classification and context",
        async run(args, ctx) {
            const classification = args.classification as any;
            const tone = typeof args.tone === "string" ? args.tone : "professional";
            const context = typeof args.context === "string" ? args.context : "";

            if (!classification) {
                return { success: false, output: "Classification data required" };
            }

            try {
                const completion = await aiClient.chat.completions.create({
                    model: AI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: `You are a professional email response specialist. Write clear, concise, ${tone} email responses. 
Keep responses under 150 words. Sign off with "Best regards, BotHive Team".`
                        },
                        {
                            role: "user",
                            content: `Generate an email response for:
Category: ${classification.category}
Sentiment: ${classification.sentiment}
Request: ${classification.extractedInfo?.specificRequest || "General inquiry"}
${context ? `Additional context: ${context}` : ""}

Original email classification:
${JSON.stringify(classification, null, 2)}`
                        }
                    ],
                    temperature: 0.7,
                });

                const response = completion.choices[0]?.message?.content || "";

                return {
                    success: true,
                    output: response,
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Response generation failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "email.extractContacts",
        capability: "email.agent",
        description: "Extract contact information from email content",
        async run(args, ctx) {
            const emailContent = typeof args.email === "string" ? args.email : JSON.stringify(args.email);

            if (!emailContent) {
                return { success: false, output: "Email content required" };
            }

            try {
                const completion = await aiClient.chat.completions.create({
                    model: AI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: `Extract contact information from emails. Return ONLY a JSON object:
{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "phone number if found",
  "company": "Company Name",
  "role": "Job Title"
}`
                        },
                        {
                            role: "user",
                            content: `Extract contacts from:\n\n${emailContent}`
                        }
                    ],
                    temperature: 0.2,
                });

                const response = completion.choices[0]?.message?.content || "{}";
                const contacts = JSON.parse(response);

                return {
                    success: true,
                    output: JSON.stringify(contacts, null, 2),
                    data: contacts,
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Contact extraction failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },
];
