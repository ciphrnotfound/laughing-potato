-- Add hivelang_code and other missing columns to integrations table if they don't exist
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS hivelang_code TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS icon_url TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS documentation_url TEXT;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS developer_id UUID REFERENCES auth.users(id);

-- Ensure slug is unique if not already constraint
-- ALTER TABLE integrations ADD CONSTRAINT integrations_slug_key UNIQUE (slug); 
-- (Commented out to avoid error if it already exists, usually better to check first or just ignore for now)

-- Allow authenticated users to insert into integrations (for custom integrations)
-- This might need a robust policy, but for now enable insert for authenticated users
CREATE POLICY "Enable insert for authenticated users" ON integrations
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow creators to update their own integrations
CREATE POLICY "Enable update for creators" ON integrations
    FOR UPDATE
    USING (auth.uid() = developer_id);
