import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { runDigitalWorkforceHeavy, WorkforceIteration } from "@/lib/workforce/orchestrator";
import { createClient } from "@supabase/supabase-js";
import { allTools } from "@/lib/tools/all-tools";
import { createSharedMemory } from "@/lib/sharedMemory";
import { ToolContext } from "@/lib/agentTypes";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

export type WorkforceJobData = {
  userId: string;
  request: string;
};

export const workforceQueue = new Queue<WorkforceJobData>("workforce", { connection });

// Supabase setup for persisting results
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Start a BullMQ worker to consume workforce jobs.
 */
export function startWorkforceWorker() {
  const worker = new Worker<WorkforceJobData>(
    "workforce",
    async (job: Job<WorkforceJobData>) => {
      const { userId, request } = job.data;

      // Build ToolContext
      const memStore = createSharedMemory(`job-${job.id}`);
      const sharedMemory: ToolContext["sharedMemory"] = {
        async get(key) { return memStore.get(key); },
        async set(key, val) { memStore.set(key, val); },
        async append(key, val) {
          const existing = memStore.get(key) ?? [];
          memStore.set(key, Array.isArray(existing) ? [...existing, val] : [existing, val]);
        },
      };
      const toolCtx: ToolContext = {
        metadata: {
          botId: "workforce-orchestrator",
          runId: String(job.id),
          userId,
        },
        sharedMemory,
      };

      const liveIterations: WorkforceIteration[] = [];

      // Run heavy orchestrator
      const result = await runDigitalWorkforceHeavy(request, {
        sharedTools: allTools,
        toolContext: toolCtx,
        onIteration: async (iterationPayload, index) => {
          liveIterations.push(iterationPayload);
          await job.updateProgress({
            percent: Math.round(((index + 1) / 3) * 100),
            iterations: liveIterations,
            lastUpdated: Date.now(),
          });
        },
      });

      if (supabase) {
        await supabase.from("workforce_runs").insert({
          id: job.id,
          user_id: userId,
          request,
          result: JSON.stringify(result),
          status: result.success ? "completed" : "failed",
          created_at: new Date().toISOString(),
        });
      }

      return result;
    },
    { connection }
  );

  worker.on("failed", (job: Job<WorkforceJobData> | undefined, err: Error) => {
    console.error("Workforce job failed", job?.id, err);
  });

  console.log("Workforce worker running");
  return worker;
}
