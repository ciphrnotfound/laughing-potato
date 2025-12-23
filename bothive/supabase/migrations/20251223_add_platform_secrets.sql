-- Add Integration Secrets Table
-- This table stores sensitive platform-level credentials like OAuth secrets
-- It is separate from the integrations table to ensure better security and RLS control

CREATE TABLE IF NOT EXISTS integration_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(integration_id, key)
);

-- Enable RLS
ALTER TABLE integration_secrets ENABLE ROW LEVEL SECURITY;

-- Policy: Only server-side code (service role) or the developer of the integration can read secrets
-- For now, we allow the creator of the integration to view/manage their secrets
CREATE POLICY "Developers can manage their own integration secrets"
  ON integration_secrets
  FOR ALL
  USING (
    integration_id IN (
      SELECT id FROM integrations WHERE developer_id = auth.uid()
    )
  );

-- Add helper column to integrations if missing (to track owners)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'integrations'::regclass AND attname = 'developer_id') THEN
        ALTER TABLE integrations ADD COLUMN developer_id UUID REFERENCES auth.users(id);
    END IF;
END $$;
