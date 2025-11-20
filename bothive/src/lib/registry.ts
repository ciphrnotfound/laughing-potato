import { AgentDefinition } from "./agentTypes";
import { agentsStorage } from "./storage";

function isAgentDefinition(value: unknown): value is AgentDefinition {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AgentDefinition>;
  const hasId = typeof candidate.id === "string" && candidate.id.trim().length > 0;
  const hasName = typeof candidate.name === "string" && candidate.name.trim().length > 0;
  const skillsValid = Array.isArray(candidate.skills);
  if (!hasId || !hasName || !skillsValid) {
    return false;
  }
  if (candidate.memoryKeys && !Array.isArray(candidate.memoryKeys)) {
    return false;
  }
  return true;
}

class AgentRegistry {
  private agents: Map<string, AgentDefinition> = new Map();
  private initialized = false;

  async init() {
    if (this.initialized) return;
    try {
      const data = await agentsStorage.read();
      const entries: [string, AgentDefinition][] = [];
      for (const [id, value] of Object.entries(data ?? {})) {
        if (isAgentDefinition(value)) {
          const normalized: AgentDefinition = {
            id: value.id ?? id,
            name: value.name,
            description: value.description ?? "",
            skills: Array.isArray(value.skills) ? value.skills : [],
            memoryKeys: value.memoryKeys && Array.isArray(value.memoryKeys) ? value.memoryKeys : [],
          };
          entries.push([normalized.id, normalized]);
        }
      }
      this.agents = new Map(entries);
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



