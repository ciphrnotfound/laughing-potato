-- Enable RLS on user_integrations if not already enabled
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON user_integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON user_integrations;

-- Policy: Users can see only their own integration connections
CREATE POLICY "Users can view own integrations"
ON user_integrations
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own integrations
CREATE POLICY "Users can update own integrations"
ON user_integrations
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own integrations
CREATE POLICY "Users can delete own integrations"
ON user_integrations
FOR DELETE
USING (auth.uid() = user_id);

-- Policy: Users can insert their own integrations
CREATE POLICY "Users can insert own integrations"
ON user_integrations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON user_integrations TO authenticated;
