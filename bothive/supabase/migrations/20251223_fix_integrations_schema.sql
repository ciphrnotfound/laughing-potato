-- Fix Integrations Schema
-- Adds missing columns expected by the UI and seed scripts

ALTER TABLE integrations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add 'type' if it doesn't exist (previously it might have been 'auth_type')
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS type TEXT;

-- Migrate data from auth_type to type if type is null
UPDATE integrations SET type = auth_type WHERE type IS NULL AND auth_type IS NOT NULL;

-- Ensure type index exists
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);

-- Add pricing and setup info
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'free';
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS setup_time TEXT DEFAULT '2 minutes';

-- Fix category constraint to include all UI categories
ALTER TABLE integrations DROP CONSTRAINT IF EXISTS valid_category;
ALTER TABLE integrations ADD CONSTRAINT valid_category CHECK (category IN (
  'productivity', 'social', 'media', 'communication', 'ai', 'finance', 
  'education', 'health', 'other', 'developer', 'analytics', 'payment', 'storage'
));
