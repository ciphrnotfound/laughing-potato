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
    // Deprecated cache - moving to direct DB access

    async init() {
        // No-op for DB version
    }

    async list(userId: string): Promise<AgentDefinition[]> {
        const { getSupabaseClient } = await import("./supabase");
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from("agents")
            .select("*")
            .eq("user_id", userId);

        if (error) {
            console.error("Failed to list agents:", error);
            return [];
        }

        return data.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description || "",
            skills: Array.isArray(row.skills) ? row.skills as string[] : [],
            memoryKeys: Array.isArray(row.memory_keys) ? row.memory_keys as string[] : [],
        }));
    }

    async get(id: string): Promise<AgentDefinition | undefined> {
        const { getSupabaseClient } = await import("./supabase");
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from("agents")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return undefined;

        return {
            id: data.id,
            name: data.name,
            description: data.description || "",
            skills: Array.isArray(data.skills) ? data.skills as string[] : [],
            memoryKeys: Array.isArray(data.memory_keys) ? data.memory_keys as string[] : [],
        };
    }

    async upsert(def: AgentDefinition, userId: string): Promise<AgentDefinition> {
        const { getSupabaseClient } = await import("./supabase");
        const supabase = getSupabaseClient();

        const payload = {
            id: def.id, // If ID is provided, use it
            user_id: userId,
            name: def.name,
            description: def.description,
            skills: def.skills,
            memory_keys: def.memoryKeys
        };

        const { data, error } = await supabase
            .from("agents")
            .upsert(payload)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            description: data.description || "",
            skills: Array.isArray(data.skills) ? data.skills as string[] : [],
            memoryKeys: Array.isArray(data.memory_keys) ? data.memory_keys as string[] : [],
        };
    }
}

export const agentRegistry = new AgentRegistry();



