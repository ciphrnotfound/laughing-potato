export interface BusMessage {
    sender: string; // Agent role or orchestrator
    content: string;
    timestamp: number;
}

export class MessageBus {
    private readonly messages: BusMessage[] = [];

    publish(sender: string, content: string) {
        this.messages.push({ sender, content, timestamp: Date.now() });
    }

    // Retrieve conversation so far (optionally after a given timestamp)
    getHistory(since?: number): BusMessage[] {
        if (!since) return [...this.messages];
        return this.messages.filter((m) => m.timestamp > since);
    }
}
