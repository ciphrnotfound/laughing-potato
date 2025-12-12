import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import { aiClient, AI_MODEL } from "@/lib/ai-client";

/**
 * Lead Scorer Agent Tools
 * Specialist agent for qualifying and scoring sales leads
 */

export const leadScorerTools: ToolDescriptor[] = [
    {
        name: "lead.score",
        capability: "lead.agent",
        description: "Score a lead from 1-10 based on qualification criteria",
        async run(args, ctx) {
            const leadData = args.leadData as any;
            const criteria = typeof args.criteria === "string" ? args.criteria : "Budget fit, timing, decision maker status, company size";

            if (!leadData) {
                return { success: false, output: "Lead data required" };
            }

            try {
                const completion = await aiClient.chat.completions.create({
                    model: AI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: `You are a B2B lead qualification specialist. Score leads 1-10 based on: ${criteria}.
Return ONLY a JSON object:
{
  "score": 8,
  "tier": "high|medium|low",
  "reasoning": "Why this score",
  "nextAction": "Recommended next step",
  "urgency": "immediate|this-week|this-month|low-priority"
}`
                        },
                        {
                            role: "user",
                            content: `Score this lead:\n\n${JSON.stringify(leadData, null, 2)}`
                        }
                    ],
                    temperature: 0.4,
                });

                const response = completion.choices[0]?.message?.content || "{}";
                const scoreData = JSON.parse(response);

                return {
                    success: true,
                    output: `Lead Score: ${scoreData.score}/10 (${scoreData.tier})\nReasoning: ${scoreData.reasoning}\nNext Action: ${scoreData.nextAction}`,
                    data: scoreData,
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Lead scoring failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "lead.analyze",
        capability: "lead.agent",
        description: "Deep analysis of lead engagement, pain points, and buying signals",
        async run(args, ctx) {
            const emailContent = typeof args.email === "string" ? args.email : JSON.stringify(args.email);

            try {
                const completion = await aiClient.chat.completions.create({
                    model: AI_MODEL,
                    messages: [
                        {
                            role: "system",
                            content: `Analyze sales leads for buying signals. Return JSON:
{
  "painPoints": ["list", "of", "problems"],
  "buyingSignals": ["urgent language", "budget mentioned", etc],
  "decisionTimeline": "Days/weeks/months",
  "competitorsMentioned": ["competitor names"],
  "budgetIndicators": "Signs of budget availability"
}`
                        },
                        {
                            role: "user",
                            content: `Analyze:\n\n${emailContent}`
                        }
                    ],
                    temperature: 0.3,
                });

                const response = completion.choices[0]?.message?.content || "{}";
                const analysis = JSON.parse(response);

                return {
                    success: true,
                    output: JSON.stringify(analysis, null, 2),
                    data: analysis,
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Lead analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },
];
