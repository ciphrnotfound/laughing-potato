-- Proactive Engine: durable job queue + execution logs + credit charging
-- This enables bots to run in the background (scheduled/event-driven) even when users are offline.

-- =====================================================
-- JOB QUEUE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bot_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,

  -- Trigger semantics
  trigger_type TEXT NOT NULL DEFAULT 'manual', -- manual | schedule | event | webhook
  trigger_source TEXT, -- e.g. 'cron', 'github', 'email', 'timer'

  -- Execution semantics
  status TEXT NOT NULL DEFAULT 'queued', -- queued | running | succeeded | failed | cancelled
  priority INTEGER NOT NULL DEFAULT 100,
  run_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,

  -- Inputs/outputs
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  error TEXT,

  -- Credits
  credits_reserved INTEGER NOT NULL DEFAULT 0,
  credits_used INTEGER NOT NULL DEFAULT 0,
  model TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS bot_jobs_due_idx ON public.bot_jobs (status, run_at, priority);
CREATE INDEX IF NOT EXISTS bot_jobs_user_idx ON public.bot_jobs (user_id);
CREATE INDEX IF NOT EXISTS bot_jobs_bot_idx ON public.bot_jobs (bot_id);

-- Keep updated_at in sync
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bot_jobs_updated_at ON public.bot_jobs;
CREATE TRIGGER trg_bot_jobs_updated_at
BEFORE UPDATE ON public.bot_jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- SCHEDULES (simple cron-like schedules for bots)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bot_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,

  enabled BOOLEAN NOT NULL DEFAULT true,

  -- Basic schedule definition
  schedule_type TEXT NOT NULL DEFAULT 'interval', -- interval | daily | weekly | cron
  interval_minutes INTEGER, -- for interval
  timezone TEXT DEFAULT 'UTC',
  cron TEXT, -- optional future use

  -- Next run
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_run_at TIMESTAMPTZ,

  -- Default job input
  input JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS bot_schedules_next_idx ON public.bot_schedules (enabled, next_run_at);

DROP TRIGGER IF EXISTS trg_bot_schedules_updated_at ON public.bot_schedules;
CREATE TRIGGER trg_bot_schedules_updated_at
BEFORE UPDATE ON public.bot_schedules
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- =====================================================
-- RLS
-- =====================================================

ALTER TABLE public.bot_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_schedules ENABLE ROW LEVEL SECURITY;

-- Jobs are visible to their owners
DROP POLICY IF EXISTS "bot_jobs_select_own" ON public.bot_jobs;
CREATE POLICY "bot_jobs_select_own" ON public.bot_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Only owners can insert jobs for themselves
DROP POLICY IF EXISTS "bot_jobs_insert_own" ON public.bot_jobs;
CREATE POLICY "bot_jobs_insert_own" ON public.bot_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Only owners can update/cancel their jobs
DROP POLICY IF EXISTS "bot_jobs_update_own" ON public.bot_jobs;
CREATE POLICY "bot_jobs_update_own" ON public.bot_jobs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Schedules are visible to their owners
DROP POLICY IF EXISTS "bot_schedules_select_own" ON public.bot_schedules;
CREATE POLICY "bot_schedules_select_own" ON public.bot_schedules
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bot_schedules_insert_own" ON public.bot_schedules;
CREATE POLICY "bot_schedules_insert_own" ON public.bot_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bot_schedules_update_own" ON public.bot_schedules;
CREATE POLICY "bot_schedules_update_own" ON public.bot_schedules
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- WORKER FUNCTIONS (SECURITY DEFINER)
-- =====================================================

-- Atomically claim due jobs.
-- This is called by a trusted worker (server/cron) using service role.
CREATE OR REPLACE FUNCTION public.claim_due_bot_jobs(
  p_limit INTEGER DEFAULT 10,
  p_lock_seconds INTEGER DEFAULT 300,
  p_worker_id TEXT DEFAULT 'worker'
)
RETURNS SETOF public.bot_jobs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT id
    FROM public.bot_jobs
    WHERE status = 'queued'
      AND run_at <= v_now
    ORDER BY priority ASC, run_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.bot_jobs j
  SET status = 'running',
      locked_at = v_now,
      locked_by = p_worker_id,
      started_at = COALESCE(started_at, v_now),
      attempts = attempts + 1
  FROM due
  WHERE j.id = due.id
  RETURNING j.*;
END;
$$;

-- Enqueue jobs from schedules that are due.
CREATE OR REPLACE FUNCTION public.enqueue_due_schedules(
  p_limit INTEGER DEFAULT 50
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_count INTEGER := 0;
BEGIN
  WITH due AS (
    SELECT *
    FROM public.bot_schedules
    WHERE enabled = true
      AND next_run_at <= v_now
    ORDER BY next_run_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  ), inserted AS (
    INSERT INTO public.bot_jobs (user_id, bot_id, trigger_type, trigger_source, status, run_at, input)
    SELECT user_id, bot_id, 'schedule', 'scheduler', 'queued', v_now, input
    FROM due
    RETURNING id
  )
  SELECT COUNT(*) INTO v_count FROM inserted;

  -- advance next_run_at for processed schedules
  UPDATE public.bot_schedules s
  SET last_run_at = v_now,
      next_run_at = CASE
        WHEN s.schedule_type = 'interval' AND s.interval_minutes IS NOT NULL THEN v_now + make_interval(mins => s.interval_minutes)
        ELSE v_now + make_interval(mins => 60)
      END
  FROM due
  WHERE s.id = due.id;

  RETURN v_count;
END;
$$;

-- NOTE: credit reservation/charging is performed in application code using spend_user_credits.
-- Keeping that logic centralized avoids duplicating business rules.
