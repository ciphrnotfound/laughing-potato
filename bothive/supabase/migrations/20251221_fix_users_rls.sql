-- Enable RLS on users table and add selector policy
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own record
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Users can view their own record'
    ) THEN
        CREATE POLICY "Users can view their own record" ON public.users
            FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

-- Ensure service role can do everything
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' AND policyname = 'Service role has full access'
    ) THEN
        CREATE POLICY "Service role has full access" ON public.users
            FOR ALL TO service_role USING (true);
    END IF;
END $$;
