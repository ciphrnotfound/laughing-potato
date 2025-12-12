import { ToolDescriptor } from "@/lib/agentTypes";
import { executeReAct } from "../agents/react-engine";
import { getAgentPrompt, buildTaskPrompt } from "../agents/prompts";
import OpenAI from "openai";
import { aiClient, AI_MODEL } from "@/lib/ai-client";

const openai = aiClient;

/**
 * Agent reasoning tools - these enable real agentic behavior
 * Unlike wrapper tools, these implement planning, analysis, verification, and self-correction
 */

export const agentTools: ToolDescriptor[] = [
    {
        name: "agent.plan",
        capability: "agent.reasoning",
        description: "Create a step-by-step execution plan for a complex task",
        async run(args, ctx) {
            const task = typeof args.task === "string" ? args.task : "";
            const constraints = typeof args.constraints === "string" ? args.constraints : "";

            if (!task) {
                return { success: false, output: "Task description is required" };
            }

            const prompt = `${getAgentPrompt("planner")}

Task: ${task}
${constraints ? `Constraints: ${constraints}` : ""}

Create a detailed execution plan with numbered steps.`;

            try {
                const response = await openai.chat.completions.create({
                    model: AI_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.7,
                });

                const plan = response.choices[0]?.message?.content || "";

                // Store plan in shared memory
                await ctx.sharedMemory.append("plans", { task, plan, timestamp: Date.now() });

                return {
                    success: true,
                    output: plan,
                    data: { task, plan },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Planning failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "agent.analyze",
        capability: "agent.reasoning",
        description: "Analyze data and extract insights based on criteria",
        async run(args, ctx) {
            const data = typeof args.data === "string" ? args.data : JSON.stringify(args.data);
            const criteria = typeof args.criteria === "string" ? args.criteria : "relevance and quality";

            const prompt = `${getAgentPrompt("analyst")}

Data to analyze:
${data}

Analysis criteria: ${criteria}

Provide structured analysis with insights and recommendations.`;

            try {
                const response = await openai.chat.completions.create({
                    model: AI_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.6,
                });

                const analysis = response.choices[0]?.message?.content || "";

                return {
                    success: true,
                    output: analysis,
                    data: { analysis, criteria },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "agent.evaluate",
        capability: "agent.reasoning",
        description: "Compare multiple options and select the best one based on criteria",
        async run(args, ctx) {
            const options = Array.isArray(args.options)
                ? args.options
                : typeof args.options === "string"
                    ? JSON.parse(args.options)
                    : [];
            const criteria = typeof args.criteria === "string" ? args.criteria : "overall quality";

            if (options.length === 0) {
                return { success: false, output: "No options provided to evaluate" };
            }

            const prompt = `${getAgentPrompt("optimizer")}

Options to compare:
${JSON.stringify(options, null, 2)}

Evaluation criteria: ${criteria}

Select the best option and explain why. Return ONLY the selected option text.`;

            try {
                const response = await openai.chat.completions.create({
                    model: AI_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.5,
                });

                const selected = response.choices[0]?.message?.content || options[0];

                return {
                    success: true,
                    output: selected,
                    data: { selectedOption: selected, criteria },
                };
            } catch (error) {
                return {
                    success: false,
                    output: options[0], // Fallback to first option
                };
            }
        },
    },

    {
        name: "agent.verify",
        capability: "agent.reasoning",
        description: "Verify content meets specified rules and quality standards",
        async run(args, ctx) {
            const content = typeof args.content === "string" ? args.content : JSON.stringify(args.content);
            const rules = typeof args.rules === "string" ? args.rules : "general quality standards";

            const rulesList = rules.split(",").map((r) => r.trim());
            const prompt = buildTaskPrompt("contentReview", { content, rules: rulesList });

            const systemPrompt = getAgentPrompt("verifier");

            try {
                const response = await openai.chat.completions.create({
                    model: AI_MODEL,
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: prompt },
                    ],
                    temperature: 0.3,
                });

                const verification = response.choices[0]?.message?.content || "";

                // Check if verification passed
                const passed = verification.toUpperCase().includes("PASS");

                return {
                    success: true,
                    output: passed ? "none" : verification,
                    data: { passed, issues: passed ? [] : verification },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Verification failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "agent.fix",
        capability: "agent.reasoning",
        description: "Fix identified issues in content",
        async run(args, ctx) {
            const content = typeof args.content === "string" ? args.content : "";
            const issues = typeof args.issues === "string" ? args.issues : "";

            if (!content || !issues) {
                return { success: false, output: "Both content and issues are required" };
            }

            const prompt = `${getAgentPrompt("optimizer")}

Original content:
"${content}"

Issues to fix:
${issues}

Provide the fixed version that addresses all issues. Return ONLY the corrected content.`;

            try {
                const response = await openai.chat.completions.create({
                    model: AI_MODEL,
                    messages: [{ role: "user", content: prompt }],
                    temperature: 0.6,
                });

                const fixed = response.choices[0]?.message?.content || content;

                return {
                    success: true,
                    output: fixed,
                    data: { original: content, fixed, issues },
                };
            } catch (error) {
                return {
                    success: false,
                    output: content, // Return original if fix fails
                };
            }
        },
    },

    {
        name: "agent.broadcast",
        capability: "agent.broadcast",
        description: "Publish a message to other workforce agents via the shared bus.",
        async run(args, ctx) {
            const content = typeof args.content === "string" ? args.content : JSON.stringify(args.content);
            const sender = ctx.metadata?.botId ?? "unknown-agent";
            await ctx.sharedMemory.append("bus", { sender, content, timestamp: Date.now() });
            return { success: true, output: "published" };
        },
    },

    {
        name: "agent.listen",
        capability: "agent.listen",
        description: "Retrieve recent messages from the shared bus (optionally after a timestamp).",
        async run(args, ctx) {
            const since = Number.isFinite(Number(args.since)) ? Number(args.since) : undefined;
            const bus = (await ctx.sharedMemory.get("bus")) ?? [];
            const recent = Array.isArray(bus) ? (since ? bus.filter((m) => m.timestamp > since) : bus) : [];
            return { success: true, output: JSON.stringify(recent) };
        },
    },

    {
        name: "agent.reason",
        capability: "agent.reasoning",
        description: "Use ReAct pattern to solve complex tasks with multiple tools",
        async run(args, ctx) {
            const task = typeof args.task === "string" ? args.task : "";
            const availableTools = (args.tools as ToolDescriptor[]) || [];

            if (!task) {
                return { success: false, output: "Task is required" };
            }

            try {
                const result = await executeReAct(task, availableTools, ctx, {
                    maxSteps: 5,
                    systemPrompt: getAgentPrompt("react"),
                });

                return {
                    success: result.success,
                    output: result.finalAnswer,
                    data: {
                        steps: result.steps,
                        reasoning: result.steps.map((s) => s.thought).join("\n"),
                    },
                };
            } catch (error) {
                return {
                    success: false,
                    output: `ReAct execution failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },

    {
        name: "agent.delegate",
        capability: "agent.delegate",
        description: "Delegate a task to a sub-agent defined in the swarm.",
        async run(args, ctx) {
            const agentName = typeof args.agent === "string" ? args.agent : "";
            const task = typeof args.task === "string" ? args.task : JSON.stringify(args.task);

            if (!agentName) return { success: false, output: "Agent name is required" };
            if (!ctx.agents || !Array.isArray(ctx.agents)) {
                return { success: false, output: "No sub-agents available in this context" };
            }

            const agent = ctx.agents.find((a: any) => a.name === agentName);
            if (!agent) {
                return { success: false, output: `Agent '${agentName}' not found. Available: ${ctx.agents.map((a: any) => a.name).join(", ")}` };
            }

            try {
                // Execute the sub-agent
                // The sub-agent has a 'run' method as defined in hive-compiler.ts
                const result = await agent.run({
                    ...ctx,
                    input: task
                });

                // Extract last output from transcript or return full transcript
                const lastSay = result.transcript.filter((t: any) => t.type === 'say').pop();
                const output = lastSay ? lastSay.payload : JSON.stringify(result.transcript);

                return {
                    success: true,
                    output: output,
                    data: { transcript: result.transcript }
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Delegation to ${agentName} failed: ${error instanceof Error ? error.message : String(error)}`,
                };
            }
        },
    },
];
