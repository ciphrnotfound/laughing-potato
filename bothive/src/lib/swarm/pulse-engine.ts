/**
 * Proactive Pulse Engine
 * The "Heartbeat" of BotHive that wakes up proactive agents.
 */

import { createClient } from "@supabase/supabase-js";
import { executeHiveLangProgram } from "@/lib/agents/hivelang-executor";
import { swarmManager } from "@/lib/swarm-communication";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type PulseTrigger = 'schedule' | 'event' | 'webhook';

export interface PulseJob {
    id: string;
    bot_id: string;
    trigger_type: PulseTrigger;
    trigger_config: any; // e.g. { cron: "0 * * * *" } or { event: "new_email" }
    last_run: string | null;
    next_run: string | null;
    is_active: boolean;
}

class ProactivePulseEngine {
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;
    private listeners: Function[] = [];

    constructor() { }

    /**
     * Start the Pulse Engine (Heartbeat)
     * Runs every 60 seconds to check for scheduled jobs
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log("💓 Proactive Pulse Engine Started");

        // Initial check
        this.pulse();

        // Loop
        this.intervalId = setInterval(() => this.pulse(), 60000);
    }

    stop() {
        if (this.intervalId) clearInterval(this.intervalId);
        this.isRunning = false;
        console.log("🛑 Pulse Engine Stopped");
    }

    /**
     * The Heartbeat: Checks for jobs and wakes up bots
     */
    async pulse() {
        this.notifyListeners({ type: 'pulse', timestamp: Date.now() });

        try {
            const jobs = await this.fetchDueJobs();

            if (jobs.length > 0) {
                console.log(`⚡ Pulse: Waking up ${jobs.length} bots...`);
            }

            for (const job of jobs) {
                await this.wakeBot(job);
            }

        } catch (err) {
            console.error("Pulse Error:", err);
        }
    }

    private async fetchDueJobs(): Promise<PulseJob[]> {
        const nowIso = new Date().toISOString();

        const { data, error } = await supabase
            .from("pulse_jobs")
            .select("id, bot_id, trigger_type, trigger_config, last_run, next_run, is_active")
            .eq("is_active", true)
            .lte("next_run", nowIso)
            .limit(50);

        if (error) {
            console.error("Pulse fetchDueJobs error:", error);
            return [];
        }

        return (data ?? []) as PulseJob[];
    }

    private computeNextRun(job: PulseJob): string | null {
        const base = new Date();
        const cfg = job.trigger_config || {};

        if (job.trigger_type === "schedule") {
            const intervalSeconds =
                typeof cfg.interval_seconds === "number"
                    ? cfg.interval_seconds
                    : typeof cfg.intervalMinutes === "number"
                        ? cfg.intervalMinutes * 60
                        : 60;

            const next = new Date(base.getTime() + intervalSeconds * 1000);
            return next.toISOString();
        }

        return null;
    }

    /**
     * Wake up a bot and execute its proactive logic
     */
    async wakeBot(job: PulseJob) {
        this.notifyListeners({ type: 'wake', botId: job.bot_id });

        // Fetch bot code
        const { data: bot } = await supabase.from('bots').select('*').eq('id', job.bot_id).single();
        if (!bot) return;

        // Execute "on schedule" or "on pulse" block
        // We inject a special input so the Hivelang code knows it's a proactive run
        const result = await executeHiveLangProgram(
            bot.hivelang_code,
            {
                input: "PULSE_TRIGGER",
                trigger: job.trigger_type,
                timestamp: new Date().toISOString()
            },
            [], // Default tools
            { metadata: { userId: bot.user_id, botId: bot.id } }
        );

        if (result.success) {
            console.log(`✅ Bot ${bot.name} executed successfully via Pulse.`);

            const nextRun = this.computeNextRun(job);

            await supabase
                .from("pulse_jobs")
                .update({
                    last_run: new Date().toISOString(),
                    next_run: nextRun,
                    updated_at: new Date().toISOString()
                })
                .eq("id", job.id);

            const output = result.output?.slice(0, 2000) ?? "";
            const executionTimeMs = 0;

            await supabase.from("pulse_logs").insert({
                job_id: job.id,
                bot_id: bot.id,
                status: "success",
                output,
                execution_time_ms: executionTimeMs
            });
        }
    }

    /**
     * Real-time listeners for the Neural Visualizer
     */
    onPulse(callback: Function) {
        this.listeners.push(callback);
    }

    private notifyListeners(event: any) {
        this.listeners.forEach(cb => cb(event));
    }
}

export const pulseEngine = new ProactivePulseEngine();
