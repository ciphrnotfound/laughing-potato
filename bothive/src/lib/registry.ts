import { AgentDefinition } from "./agentTypes";
import { agentsStorage } from "./storage";

class AgentRegistry {
  private agents: Map<string, AgentDefinition> = new Map();
  private initialized = false;

  async init() {
    if (this.initialized) return;
    try {
      const data = await agentsStorage.read();
      this.agents = new Map(Object.entries(data));
      this.initialized = true;
    } catch (error) {
      console.error("Failed to load agents:", error);
      this.initialized = true;
    }
  }

  async save() {
    const data = Object.fromEntries(this.agents);
    await agentsStorage.write(data);
  }

  async list(): Promise<AgentDefinition[]> {
    await this.init();
    return Array.from(this.agents.values());
  }

  async get(id: string): Promise<AgentDefinition | undefined> {
    await this.init();
    return this.agents.get(id);
  }

  async upsert(def: AgentDefinition): Promise<AgentDefinition> {
    await this.init();
    this.agents.set(def.id, def);
    await this.save();
    return def;
  }
}

export const agentRegistry = new AgentRegistry();



