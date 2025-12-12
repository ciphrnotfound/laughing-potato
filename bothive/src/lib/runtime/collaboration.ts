import { AgentMessage } from "../agentTypes";

export type BroadcastMessage = {
    id: string;
    fromBotId: string;
    type: string;
    payload: any;
    timestamp: number;
};

export class CollaborationRuntime {
    private static instance: CollaborationRuntime;
    private messageBus: BroadcastMessage[] = [];
    private listeners: Map<string, (msg: BroadcastMessage) => void> = new Map();

    private constructor() { }

    public static getInstance(): CollaborationRuntime {
        if (!CollaborationRuntime.instance) {
            CollaborationRuntime.instance = new CollaborationRuntime();
        }
        return CollaborationRuntime.instance;
    }

    public broadcast(fromBotId: string, type: string, payload: any): BroadcastMessage {
        const message: BroadcastMessage = {
            id: crypto.randomUUID(),
            fromBotId,
            type,
            payload,
            timestamp: Date.now(),
        };

        this.messageBus.push(message);

        // Notify listeners (in a real app, this might be via WebSockets or Redis)
        this.listeners.forEach((callback) => callback(message));

        return message;
    }

    public getMessages(sinceTimestamp: number = 0): BroadcastMessage[] {
        return this.messageBus.filter(msg => msg.timestamp > sinceTimestamp);
    }

    public subscribe(botId: string, callback: (msg: BroadcastMessage) => void) {
        this.listeners.set(botId, callback);
    }

    public unsubscribe(botId: string) {
        this.listeners.delete(botId);
    }
}
