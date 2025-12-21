-- User Bot Installations Table
CREATE TABLE IF NOT EXISTS public.user_bot_installs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bot_id UUID NOT NULL REFERENCES public.bots(id) ON DELETE CASCADE,
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active', -- 'active', 'archived'
    
    -- Track if it was a paid installation
    purchase_id UUID, -- Link to a purchase record if applicable
    
    UNIQUE(user_id, bot_id)
);

-- RLS Policies
ALTER TABLE public.user_bot_installs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own installs" ON public.user_bot_installs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can install bots" ON public.user_bot_installs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own installs" ON public.user_bot_installs
    FOR ALL USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_bot_installs_user_id ON public.user_bot_installs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bot_installs_bot_id ON public.user_bot_installs(bot_id);
