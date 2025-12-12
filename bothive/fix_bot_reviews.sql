-- Run this in your Supabase SQL Editor

-- 1. Ensure bot_reviews table exists with correct columns
CREATE TABLE IF NOT EXISTS public.bot_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add user_id column if it was missing (safe to run even if it exists)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bot_reviews' AND column_name = 'user_id') THEN
        ALTER TABLE public.bot_reviews ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Enable Row Level Security
ALTER TABLE public.bot_reviews ENABLE ROW LEVEL SECURITY;

-- 4. Recreate Policies to ensure access
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.bot_reviews;
CREATE POLICY "Reviews are viewable by everyone" ON public.bot_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own reviews" ON public.bot_reviews;
CREATE POLICY "Users can insert their own reviews" ON public.bot_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.bot_reviews;
CREATE POLICY "Users can update their own reviews" ON public.bot_reviews FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.bot_reviews;
CREATE POLICY "Users can delete their own reviews" ON public.bot_reviews FOR DELETE USING (auth.uid() = user_id);

-- 5. Grant permissions to authenticated and anon roles
GRANT SELECT ON public.bot_reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bot_reviews TO authenticated;
