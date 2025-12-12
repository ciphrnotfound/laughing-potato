import { ToolContext, ToolDescriptor } from "@/lib/agentTypes";
import { agentTools } from "@/lib/tools/agent-tools";

interface WorkerBot {
    id: string;
    name: string;
    capabilities: string[];
    description: string;
}

interface SubTask {
    id: string;
    description: string;
    requiredCapability: string;
    assignedWorkerId?: string;
    status: 'pending' | 'completed' | 'failed';
    result?: string;
}

export class QueenBee {
    private tools: Map<string, ToolDescriptor>;

    constructor(private context: ToolContext) {
        this.tools = new Map(agentTools.map(t => [t.name, t]));
    }

    /**
     * Decompose a high-level goal into sub-tasks using the planner agent
     */
    async decompose(goal: string): Promise<SubTask[]> {
        const planner = this.tools.get("agent.plan");
        if (!planner) throw new Error("Planner tool not found");

        const result = await planner.run({
            task: goal,
            constraints: "Break down into atomic steps that can be performed by specialized AI agents (e.g. researcher, coder, writer). Return ONLY a JSON array of objects with 'description' and 'requiredCapability' fields."
        }, this.context);

        try {
            // The planner might return text with JSON, so we try to extract it
            const jsonMatch = result.output.match(/\[[\s\S]*\]/);
            const jsonStr = jsonMatch ? jsonMatch[0] : result.output;
            const steps = JSON.parse(jsonStr);

            return steps.map((s: any, i: number) => ({
                id: `task_${Date.now()}_${i}`,
                description: s.description,
                requiredCapability: s.requiredCapability,
                status: 'pending'
            }));
        } catch (e) {
            console.error("Failed to parse plan:", e);
            // Fallback: single task
            return [{
                id: `task_${Date.now()}`,
                description: goal,
                requiredCapability: "general.respond",
                status: 'pending'
            }];
        }
    }

    /**
     * Select the best worker for a specific task
     */
    async assignWorker(task: SubTask, workers: WorkerBot[]): Promise<WorkerBot | undefined> {
        const capableWorkers = workers.filter(w =>
            w.capabilities.includes(task.requiredCapability) ||
            w.capabilities.includes("general.respond")
        );

        if (capableWorkers.length === 0) return undefined;
        if (capableWorkers.length === 1) return capableWorkers[0];

        // Use evaluator to pick the best one
        const evaluator = this.tools.get("agent.evaluate");
        if (!evaluator) return capableWorkers[0];

        const result = await evaluator.run({
            options: capableWorkers.map(w => `${w.name}: ${w.description}`),
            criteria: `Best fit for task: ${task.description}`
        }, this.context);

        const selectedName = result.output.split(":")[0].trim();
        return capableWorkers.find(w => w.name === selectedName) || capableWorkers[0];
    }
}
