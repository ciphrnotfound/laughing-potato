-- RESTORE BOTS TABLE AND POLICIES
-- Fixes missing bots table from empty migration files

-- 1. Create bots table
CREATE TABLE IF NOT EXISTS public.bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    configuration JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    
    -- Monetization fields
    is_public_for_hire BOOLEAN DEFAULT false,
    collaboration_rate INTEGER DEFAULT 5,
    capabilities TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable RLS
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;

-- 3. Policies
DROP POLICY IF EXISTS "Users can view public bots" ON public.bots;
CREATE POLICY "Users can view public bots" ON public.bots
    FOR SELECT USING (is_public_for_hire = true OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own bots" ON public.bots;
CREATE POLICY "Users can insert own bots" ON public.bots
    FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own bots" ON public.bots;
CREATE POLICY "Users can update own bots" ON public.bots
    FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own bots" ON public.bots;
CREATE POLICY "Users can delete own bots" ON public.bots
    FOR DELETE USING (user_id = auth.uid());

-- 4. Seed some public bots (owned by a random user or NULL/System? 
-- Since user_id is NOT NULL foreign key, we can't easily seed efficiently without a known user ID.
-- We will assume the users will create their own bots or we seed with a placeholder if needed.
-- For now, let's skip seeding linked to specific users to avoid FK errors.)

-- Create index
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON public.bots(user_id);
CREATE INDEX IF NOT EXISTS idx_bots_is_public ON public.bots(is_public_for_hire);
