import { supabase } from "@/lib/supabase";
import type { SharedMemory } from "@/lib/agentTypes";

export function createSharedMemory(runId: string): SharedMemory {
  return {
    async get(key) {
      const { data, error } = await supabase
        .from("bot_runs")
        .select("context")
        .eq("id", runId)
        .maybeSingle();

      if (error) {
        console.error("sharedMemory.get error", error);
        return undefined;
      }

      return data?.context?.[key];
    },
    async set(key, value) {
      const { error } = await supabase.rpc("bot_runs_set_context", {
        run_id: runId,
        key,
        value,
      });

      if (error) {
        console.error("sharedMemory.set error", error);
      }
    },
    async append(key, value) {
      const { error } = await supabase.rpc("bot_runs_append_context", {
        run_id: runId,
        key,
        value,
      });

      if (error) {
        console.error("sharedMemory.append error", error);
      }
    },
  };
}
