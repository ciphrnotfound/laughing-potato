-- Migration: 20251217_pulse_engine.sql
-- Description: Core tables for the Proactive Pulse Engine

-- 1. Pulse Jobs Table (Scheduled triggers)
CREATE TABLE IF NOT EXISTS pulse_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('schedule', 'event', 'webhook')),
    trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- e.g. { "cron": "0 * * * *" }
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Pulse Logs (Execution History for "Heavyweight" auditing)
CREATE TABLE IF NOT EXISTS pulse_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES pulse_jobs(id) ON DELETE SET NULL,
    bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'running')),
    output TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE pulse_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pulse_logs ENABLE ROW LEVEL SECURITY;

-- Users can see their own jobs/logs
CREATE POLICY "Users can view own pulse jobs" ON pulse_jobs
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM bots WHERE id = pulse_jobs.bot_id));

CREATE POLICY "Users can manage own pulse jobs" ON pulse_jobs
    FOR ALL USING (auth.uid() = (SELECT user_id FROM bots WHERE id = pulse_jobs.bot_id));

CREATE POLICY "Users can view own pulse logs" ON pulse_logs
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM bots WHERE id = pulse_logs.bot_id));
