-- Add triggers column to bots table to store Cron/Event metadata
-- This allows the Scheduler to query "All bots with 'on every' triggers" efficiently
-- without parsing the full code of every bot.

ALTER TABLE bots ADD COLUMN IF NOT EXISTS triggers JSONB DEFAULT '{}'::jsonb;

-- Detailed structure of 'triggers':
-- {
--   "cron": [ { "schedule": "* * * * *" } ],
--   "events": [ { "event": "user.signup" } ]
-- }

-- Index for faster lookups (e.g. finding all bots listening to 'user.signup')
CREATE INDEX IF NOT EXISTS idx_bots_triggers ON bots USING gin (triggers);
