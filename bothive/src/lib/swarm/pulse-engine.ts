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
            // 1. Fetch active jobs from DB (mocked for now, assumes 'bot_triggers' table)
            // In a real scenario, this queries supabase
            const jobs = await this.fetchDueJobs();

            if (jobs.length > 0) {
                console.log(`⚡ Pulse: Waking up ${jobs.length} bots...`);
            }

            // 2. Execute Jobs
            for (const job of jobs) {
                this.wakeBot(job);
            }

        } catch (err) {
            console.error("Pulse Error:", err);
        }
    }

    private async fetchDueJobs(): Promise<PulseJob[]> {
        // TODO: Implement actual DB query
        // For prototype, we check if any active bots have "on schedule" blocks
        return [];
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
            // Log execution
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
