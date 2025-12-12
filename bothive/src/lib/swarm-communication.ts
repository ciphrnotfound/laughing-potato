import { supabase } from "@/lib/supabase";

export interface SwarmBot {
    id: string;
    name: string;
    type: string;
    capabilities: string[];
    status: 'idle' | 'active' | 'completed' | 'error';
    progress: number;
    result?: any;
    error?: string;
    description?: string;
}

export interface SwarmWorkflow {
    id: string;
    name: string;
    description: string;
    bots: SwarmBot[];
    status: 'draft' | 'running' | 'completed' | 'error';
    createdAt: string;
    completedAt?: string;
    results?: any[];
    steps: WorkflowStep[];
}

export interface WorkflowStep {
    id: string;
    name: string;
    description: string;
    assignedBot: string;
    dependencies: string[];
    inputs: Record<string, any>;
    outputs: Record<string, any>;
    status: 'pending' | 'running' | 'completed' | 'error';
    startedAt?: string;
    completedAt?: string;
    error?: string;
}

// Map of bot types to their capabilities (fallback/reference)
const BOT_CAPABILITIES: Record<string, string[]> = {
    research: ['general.respond', 'study.tutor'],
    writing: ['general.respond', 'content.draftStatusUpdate', 'content.generateSocialThread'],
    design: ['general.respond'],
    marketing: ['general.respond', 'social.trends', 'social.draftFromTrend', 'social.publish'],
    coding: ['general.respond', 'coding.generate', 'coding.review', 'coding.debug', 'coding.refactor'],
};

class SwarmCommunicationManager {
    private workflows: Map<string, SwarmWorkflow> = new Map();
    private bots: Map<string, SwarmBot> = new Map();
    private eventListeners: Map<string, Function[]> = new Map();

    constructor() { }

    // Fetch available bots from Supabase
    async fetchAvailableBots(): Promise<SwarmBot[]> {
        const { data, error } = await supabase
            .from('bots')
            .select('id, name, capabilities, description')
            .limit(50);

        if (error) {
            console.error('Failed to fetch bots:', error);
            return [];
        }

        const fetchedBots: SwarmBot[] = (data || []).map((b: any) => ({
            id: b.id,
            name: b.name,
            type: 'custom',
            capabilities: b.capabilities || [],
            status: 'idle',
            progress: 0,
            description: b.description || 'AI Agent'
        }));

        // Cache them
        fetchedBots.forEach(bot => this.bots.set(bot.id, bot));
        return fetchedBots;
    }

    // Get all bots (returns cached)
    getAllBots(): SwarmBot[] {
        return Array.from(this.bots.values());
    }

    getBot(botId: string): SwarmBot | undefined {
        return this.bots.get(botId);
    }

    // Create a new swarm workflow (persisted as a Bot in Supabase)
    async createWorkflow(name: string, description: string, botIds: string[]): Promise<SwarmWorkflow> {
        const allBots = this.getAllBots();
        const selectedBots = allBots.filter(b => botIds.includes(b.id));

        // Combine capabilities
        const combinedCapabilities = Array.from(new Set(
            selectedBots.flatMap(b => b.capabilities)
        ));

        // Create a "Swarm Bot" in Supabase
        const { data: botData, error: botError } = await supabase
            .from('bots')
            .insert({
                name: name,
                description: description,
                capabilities: combinedCapabilities,
                system_prompt: `You are a Swarm Orchestrator managing: ${selectedBots.map(b => b.name).join(', ')}.`,
                tool_manifest: selectedBots.map(b => ({
                    capability: b.capabilities[0], // Simplified mapping
                    tool: b.capabilities[0]
                }))
            })
            .select()
            .single();

        if (botError) {
            console.error('Failed to create Swarm Bot:', botError);
            throw new Error('Failed to create Swarm Bot');
        }

        // Generate steps
        const steps: WorkflowStep[] = selectedBots.map((bot, index) => ({
            id: `step-${bot.id}`,
            name: `${bot.name} Task`,
            description: `Execute task for ${bot.name}`,
            assignedBot: bot.id,
            dependencies: index > 0 ? [`step-${selectedBots[index - 1].id}`] : [],
            inputs: {},
            outputs: {},
            status: 'pending'
        }));

        const workflow: SwarmWorkflow = {
            id: botData.id, // Use the real Bot ID as the Workflow ID
            name,
            description,
            bots: selectedBots.map(b => ({ ...b, status: 'idle' })),
            status: 'draft',
            createdAt: new Date().toISOString(),
            steps
        };

        // Store in memory for session
        this.workflows.set(workflow.id, workflow);
        this.emit('workflow:created', workflow);
        return workflow;
    }

    // Execute a swarm workflow using /api/run
    async executeWorkflow(workflowId: string): Promise<void> {
        const storedWorkflow = this.workflows.get(workflowId);
        if (!storedWorkflow) {
            throw new Error(`Workflow ${workflowId} not found in session`);
        }

        storedWorkflow.status = 'running';
        this.emit('workflow:started', storedWorkflow);

        const runPayload = {
            botId: workflowId, // The Workflow ID is the Bot ID
            steps: storedWorkflow.steps.map(step => ({
                agentId: this.getBot(step.assignedBot)?.capabilities[0] || 'general.respond',
                input: step.description
            }))
        };

        try {
            const response = await fetch('/api/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(runPayload)
            });

            if (!response.ok) {
                throw new Error('Failed to start run');
            }

            const result = await response.json();

            // Update workflow status based on result
            storedWorkflow.status = 'completed';
            storedWorkflow.completedAt = new Date().toISOString();
            storedWorkflow.results = [result.output];

            // Mark all steps as completed for UI
            storedWorkflow.steps.forEach(step => {
                step.status = 'completed';
                step.completedAt = new Date().toISOString();
                step.outputs = { result: 'Executed via API' };
            });

            this.emit('workflow:completed', storedWorkflow);

        } catch (error) {
            console.error('Execution failed:', error);
            storedWorkflow.status = 'error';
            this.emit('workflow:error', storedWorkflow);
        }
    }

    getAllWorkflows(): SwarmWorkflow[] {
        return Array.from(this.workflows.values());
    }

    // Event system
    on(event: string, callback: Function): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event)!.push(callback);
    }

    emit(event: string, data: any): void {
        const listeners = this.eventListeners.get(event) || [];
        listeners.forEach(callback => callback(data));
    }
}

export const swarmManager = new SwarmCommunicationManager();
export default swarmManager;
