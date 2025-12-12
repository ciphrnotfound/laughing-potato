-- Workflows table for storing user automation workflows
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
    
    -- Visual builder configuration (nodes, edges, settings)
    configuration JSONB NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
    
    -- Execution settings
    trigger_type TEXT DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'schedule', 'webhook')),
    schedule_cron TEXT, -- Cron expression for scheduled workflows
    
    -- Statistics
    runs_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workflow execution runs
CREATE TABLE IF NOT EXISTS public.workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
    
    -- Execution details
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Results and logs
    output JSONB,
    error_message TEXT,
    logs JSONB DEFAULT '[]'::jsonb, -- Array of log entries
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integration credentials (Gmail OAuth, etc.)
CREATE TABLE IF NOT EXISTS public.integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL, -- 'gmail', 'slack', 'notion', etc.
    
    -- Encrypted credentials and tokens
    credentials JSONB NOT NULL,
    
    -- Token expiration
    expires_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, integration_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_status ON public.workflows(status);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_id ON public.workflow_runs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_status ON public.workflow_runs(status);
CREATE INDEX IF NOT EXISTS idx_integration_credentials_user_id ON public.integration_credentials(user_id);

-- RLS Policies
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_credentials ENABLE ROW LEVEL SECURITY;

-- Users can only see their own workflows
CREATE POLICY workflows_user_policy ON public.workflows
    FOR ALL USING (auth.uid() = user_id);

-- Users can only see runs for their workflows
CREATE POLICY workflow_runs_user_policy ON public.workflow_runs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workflows 
            WHERE workflows.id = workflow_runs.workflow_id 
            AND workflows.user_id = auth.uid()
        )
    );

-- Users can only see their own credentials
CREATE POLICY integration_credentials_user_policy ON public.integration_credentials
    FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON public.workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integration_credentials_updated_at
    BEFORE UPDATE ON public.integration_credentials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
