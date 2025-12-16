import { workforceQueue } from "@/lib/queues/workforce";
import { createClient } from "@supabase/supabase-js";
import { WorkforceIteration } from "@/lib/workforce/orchestrator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

export interface WorkforceStatusPayload {
    success: boolean;
    status: string;
    jobId?: string;
    progress?: number;
    iterations?: WorkforceIteration[];
    result?: any;
    error?: string;
}

async function getPersistedResult(id: string) {
    if (!supabase) return null;
    const { data } = await supabase
        .from("workforce_runs")
        .select("*")
        .eq("id", id)
        .maybeSingle();
    return data;
}

export async function getWorkforceStatus(id: string): Promise<WorkforceStatusPayload> {
    const job = await workforceQueue.getJob(id);

    if (job) {
        const state = await job.getState();
        const progressData = job.progress as number | { percent?: number; iterations?: WorkforceIteration[] };
        const progress = typeof progressData === "number" ? progressData : progressData?.percent ?? 0;
        const liveIterations = Array.isArray((progressData as any)?.iterations)
            ? ((progressData as any)?.iterations as WorkforceIteration[])
            : undefined;

        if (state === "completed") {
            const persisted = await getPersistedResult(id);
            const resultPayload = persisted?.result ?? job.returnvalue;
            return {
                success: true,
                status: "completed",
                jobId: id,
                result: resultPayload,
                iterations: liveIterations,
            };
        }

        if (state === "failed") {
            return {
                success: true,
                status: "failed",
                jobId: id,
                error: job.failedReason,
                progress,
                iterations: liveIterations,
            };
        }

        return {
            success: true,
            status: state,
            jobId: id,
            progress,
            iterations: liveIterations,
        };
    }

    const persisted = await getPersistedResult(id);
    if (persisted) {
        const parsedResult = persisted.result;
        const resultIterations = typeof parsedResult === "object" && parsedResult?.iterations ? parsedResult.iterations : undefined;
        return {
            success: true,
            status: persisted.status ?? "completed",
            jobId: id,
            result: parsedResult,
            iterations: resultIterations,
        };
    }

    return { success: false, status: "unknown", error: "Job not found" };
}
