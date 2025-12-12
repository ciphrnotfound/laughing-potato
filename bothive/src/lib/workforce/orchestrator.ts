import { aiClient, AI_MODEL } from "@/lib/ai-client";
import { executeReAct } from "@/lib/agents/react-engine";
import { ToolDescriptor, ToolContext } from "@/lib/agentTypes";
import type { ReActStep } from "@/lib/agents";

export interface WorkforcePlan {
    roles: string[]; // e.g., ["Research Agent", "Writing Agent"]
    tasks: Record<string, string>; // role -> sub task description
}

export interface WorkforceRunOptions {
    maxAgents?: number;
    sharedTools: ToolDescriptor[];
    toolContext: ToolContext;
    onIteration?: (iteration: WorkforceIteration, index: number) => void | Promise<void>;
}

export interface WorkforceIteration {
    outputs: Record<string, string>;
    steps: Record<string, ReActStep[]>;
    busSnapshot: BusMessage[];
}

interface BusMessage {
    sender: string;
    content: string;
    timestamp: number;
}

export interface WorkforceRunResult {
    success: boolean;
    iterations: WorkforceIteration[];
    error?: string;
}

/**
 * Very first pass at our Autonomous Workforce orchestrator.
 * 1. Use LLM to break a high-level request into agent roles + sub-tasks.
 * 2. For each role, run a ReAct-powered agent with the assigned task & shared tools.
 * 3. Aggregate results.
 * Later versions will add true inter-agent messaging, iterative planning, and background scheduling.
 */
/**
 * Heavy-weight orchestrator with iterative planning (max 3 iterations).
 * Agents can ask the orchestrator for extra help by broadcasting a message:
 *   "@orchestrator request: <New Role>"
 */
export async function runDigitalWorkforceHeavy(
    userRequest: string,
    options: WorkforceRunOptions,
): Promise<WorkforceRunResult> {
    try {
        // 1) Ask the LLM to propose a plan (roles + tasks)
        const plan = await proposePlan(userRequest, options.maxAgents ?? 5);

        const iterations: WorkforceIteration[] = [];

        // Ensure bus exists
        await options.toolContext.sharedMemory.set("bus", []);

        const currentRoles = [...plan.roles];
        let loop = 0;

        while (loop < 3) {
            loop += 1;

            // Broadcast tasks for any roles not yet announced in this iteration
            for (const role of currentRoles) {
            await options.toolContext.sharedMemory.append("bus", {
                sender: "orchestrator",
                content: `@${role} your task: ${plan.tasks[role] || userRequest}`,
                timestamp: Date.now(),
            });
        }

        const outputs: Record<string, string> = {};
        const steps: Record<string, ReActStep[]> = {};

        // Run all agents in parallel for this iteration
        await Promise.all(
            currentRoles.map(async (role) => {
                const task = plan.tasks[role] ?? userRequest;

                // Clone toolContext with role metadata to help agent.broadcast include proper sender
                const roleContext: ToolContext = {
                    ...options.toolContext,
                    metadata: {
                        ...options.toolContext.metadata,
                        botId: role,
                    },
                };

                const { finalAnswer, steps: reactSteps, success } = await executeReAct(
                    `${task}\n\nYou are ${role}. Coordinate with other agents via agent.broadcast and agent.listen tools to accomplish the goal. Provide succinct deliverable when done.`,
                    options.sharedTools,
                    roleContext,
                    {
                        maxSteps: 10,
                        systemPrompt: `You are ${role}. You are part of a digital workforce. Use agent.broadcast to share progress and agent.listen to stay updated.`,
                    },
                );

                outputs[role] = finalAnswer;
                steps[role] = reactSteps;

                if (!success) {
                    outputs[role] = finalAnswer || "Failed";
                }
            })
        );

        // Snapshot bus after agents finished
        const busRaw = await options.toolContext.sharedMemory.get("bus");
        const busSnapshot: BusMessage[] = Array.isArray(busRaw) ? (busRaw as BusMessage[]) : [];
        const iterationPayload: WorkforceIteration = {
            outputs: { ...outputs },
            steps: { ...steps },
            busSnapshot,
        };
        iterations.push(iterationPayload);

        await options.onIteration?.(iterationPayload, loop - 1);

        // Parse bus for new role requests
        const requestedRoles: string[] = busSnapshot
            .filter((m) => typeof m.content === "string" && m.content.toLowerCase().includes("@orchestrator request:"))
            .flatMap((m) => {
                const match = m.content.match(/request:\s*([A-Za-z0-9 _-]+)/i);
                return match ? [match[1].trim()] : [];
            })
            .filter(Boolean);

        const newRoles = requestedRoles.filter((r) => !currentRoles.includes(r));
        if (newRoles.length === 0) {
            // No new roles requested – we're done
            break;
        }
        // Add to role list and continue loop
        currentRoles.push(...newRoles);
        }

        return { success: true, iterations };
    } catch (error) {
        return {
            success: false,
            iterations: [],
            error: error instanceof Error ? error.message : String(error),
        };
    }
}

async function proposePlan(userRequest: string, maxAgents: number): Promise<WorkforcePlan> {
    // Simple zero-shot prompt to split into roles & tasks
    const prompt = `You are an orchestration AI that plans a digital workforce.\nUser request: "${userRequest}"\n\nReturn a JSON object with two keys: roles (string array, max ${maxAgents}) and tasks (object mapping role -> specific sub-task). Only output JSON.`;

    const completion = await aiClient.chat.completions.create({
        model: AI_MODEL,
        messages: [
            { role: "system", content: "You are a helpful planner." },
            { role: "user", content: prompt },
        ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    try {
        const json = JSON.parse(raw);
        const roles: string[] = Array.isArray(json.roles) ? json.roles : [];
        const tasks: Record<string, string> = typeof json.tasks === "object" && json.tasks !== null ? json.tasks : {};
        return { roles, tasks };
    } catch {
        // Fallback: single agent
        return { roles: ["General Agent"], tasks: { "General Agent": userRequest } };
    }
}
