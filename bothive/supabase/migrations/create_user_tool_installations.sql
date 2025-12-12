-- Create user_tool_installations table
CREATE TABLE IF NOT EXISTS public.user_tool_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    encrypted_credentials TEXT NOT NULL,
    credentials_iv TEXT NOT NULL,
    credentials_auth_tag TEXT NOT NULL,
    salt TEXT NOT NULL,
    installed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, tool_name)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_tool_installations_user_id 
ON public.user_tool_installations(user_id);

CREATE INDEX IF NOT EXISTS idx_user_tool_installations_tool_name 
ON public.user_tool_installations(tool_name);

-- Enable Row Level Security
ALTER TABLE public.user_tool_installations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own installations
CREATE POLICY "Users can view own installations" 
ON public.user_tool_installations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own installations
CREATE POLICY "Users can insert own installations" 
ON public.user_tool_installations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own installations
CREATE POLICY "Users can update own installations" 
ON public.user_tool_installations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own installations
CREATE POLICY "Users can delete own installations" 
ON public.user_tool_installations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to increment download count (optional, for future stats)
CREATE OR REPLACE FUNCTION increment_tool_downloads(tool_name TEXT)
RETURNS VOID AS $$
BEGIN
    -- This is a placeholder - you can implement actual stats tracking later
    -- For now, it just succeeds without doing anything
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
