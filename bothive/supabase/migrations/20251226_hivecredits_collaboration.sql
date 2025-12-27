-- HiveCredits Economy & Bot Collaboration System
-- Extends existing wallet system with model pricing and collaboration features

-- =====================================================
-- MODEL PRICING TABLE
-- Allows dynamic pricing per AI model
-- =====================================================
CREATE TABLE IF NOT EXISTS public.model_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    hc_cost INTEGER NOT NULL, -- HiveCredits per call
    tier VARCHAR(20) DEFAULT 'standard', -- 'fast', 'standard', 'premium', 'frontier'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed default model pricing
INSERT INTO public.model_pricing (model_name, display_name, hc_cost, tier) VALUES
    ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 2, 'fast'),
    ('gpt-4-turbo', 'GPT-4 Turbo', 8, 'standard'),
    ('gpt-4', 'GPT-4', 15, 'premium'),
    ('gpt-4o', 'GPT-4o', 10, 'standard'),
    ('gpt-4o-mini', 'GPT-4o Mini', 3, 'fast'),
    ('claude-3-5-sonnet', 'Claude 3.5 Sonnet', 10, 'standard'),
    ('claude-3-opus', 'Claude 3 Opus', 20, 'premium'),
    ('gemini-pro', 'Gemini Pro', 5, 'fast'),
    ('gemini-1.5-pro', 'Gemini 1.5 Pro', 12, 'standard')
ON CONFLICT (model_name) DO UPDATE SET
    hc_cost = EXCLUDED.hc_cost,
    display_name = EXCLUDED.display_name,
    tier = EXCLUDED.tier,
    updated_at = NOW();

-- =====================================================
-- UPDATE BOTS TABLE FOR MONETIZATION
-- =====================================================
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bots' AND column_name = 'is_public_for_hire') THEN
        ALTER TABLE public.bots ADD COLUMN is_public_for_hire BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bots' AND column_name = 'collaboration_rate') THEN
        ALTER TABLE public.bots ADD COLUMN collaboration_rate INTEGER DEFAULT 5;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bots' AND column_name = 'capabilities') THEN
        ALTER TABLE public.bots ADD COLUMN capabilities TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- =====================================================
-- COLLABORATION WORKSPACES
-- Shared spaces where bots can work together
-- =====================================================
CREATE TABLE IF NOT EXISTS public.collaboration_workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- WORKSPACE MEMBERS
-- Users who can access the workspace
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.collaboration_workspaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(workspace_id, user_id)
);

-- =====================================================
-- WORKSPACE BOTS
-- Bots added to workspaces for collaboration
-- =====================================================
CREATE TABLE IF NOT EXISTS public.workspace_bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.collaboration_workspaces(id) ON DELETE CASCADE,
    bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
    added_by UUID REFERENCES public.users(id),
    collaboration_rate INTEGER DEFAULT 5, -- HC charged per collaboration
    is_available BOOLEAN DEFAULT true,
    capabilities TEXT[], -- What this bot can do
    added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(workspace_id, bot_id)
);

-- =====================================================
-- BOT COLLABORATIONS
-- Records of bot-to-bot collaboration requests
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bot_collaborations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES public.collaboration_workspaces(id) ON DELETE SET NULL,
    requester_bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
    helper_bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
    requester_user_id UUID REFERENCES public.users(id), -- Who owns the requester bot
    helper_user_id UUID REFERENCES public.users(id), -- Who owns the helper bot
    task_description TEXT,
    hc_offered INTEGER NOT NULL, -- HiveCredits offered for the work
    hc_paid INTEGER, -- Actual amount paid (after completion)
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'completed', 'failed', 'cancelled'
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- HC CREDIT PACKAGES
-- Purchasable credit bundles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.credit_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    hc_amount INTEGER NOT NULL,
    price_ngn INTEGER NOT NULL, -- Price in kobo (multiply by 100)
    bonus_percent INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed credit packages
INSERT INTO public.credit_packages (name, description, hc_amount, price_ngn, bonus_percent, display_order) VALUES
    ('Starter', 'Get started with BotHive', 500, 500000, 0, 1),
    ('Builder', 'For regular bot builders', 2200, 2000000, 10, 2),
    ('Pro', 'Power users and teams', 6000, 5000000, 20, 3),
    ('Enterprise', 'Large scale operations', 25000, 20000000, 25, 4)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE public.model_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Model pricing is readable by all authenticated users
CREATE POLICY "Anyone can view model pricing" ON public.model_pricing
    FOR SELECT USING (true);

-- Credit packages are readable by all
CREATE POLICY "Anyone can view credit packages" ON public.credit_packages
    FOR SELECT USING (true);

-- Workspaces: owners and members can view
CREATE POLICY "Users can view own or member workspaces" ON public.collaboration_workspaces
    FOR SELECT USING (
        owner_id = auth.uid() OR
        id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create workspaces" ON public.collaboration_workspaces
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update workspaces" ON public.collaboration_workspaces
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete workspaces" ON public.collaboration_workspaces
    FOR DELETE USING (owner_id = auth.uid());

-- Workspace members policies
CREATE POLICY "Members can view workspace members" ON public.workspace_members
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM public.collaboration_workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage members" ON public.workspace_members
    FOR ALL USING (
        workspace_id IN (
            SELECT id FROM public.collaboration_workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
        )
    );

-- Workspace bots policies
CREATE POLICY "Members can view workspace bots" ON public.workspace_bots
    FOR SELECT USING (
        workspace_id IN (
            SELECT id FROM public.collaboration_workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Members can add bots" ON public.workspace_bots
    FOR INSERT WITH CHECK (
        workspace_id IN (
            SELECT id FROM public.collaboration_workspaces WHERE owner_id = auth.uid()
            UNION
            SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner', 'member')
        )
    );

-- Bot collaborations policies
CREATE POLICY "Users can view own collaborations" ON public.bot_collaborations
    FOR SELECT USING (requester_user_id = auth.uid() OR helper_user_id = auth.uid());

CREATE POLICY "Users can request collaborations" ON public.bot_collaborations
    FOR INSERT WITH CHECK (requester_user_id = auth.uid());

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_bots_workspace ON public.workspace_bots(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_bots_bot ON public.workspace_bots(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_collaborations_requester ON public.bot_collaborations(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_bot_collaborations_helper ON public.bot_collaborations(helper_user_id);
CREATE INDEX IF NOT EXISTS idx_bot_collaborations_status ON public.bot_collaborations(status);
CREATE INDEX IF NOT EXISTS idx_model_pricing_tier ON public.model_pricing(tier);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's HC balance from wallet
CREATE OR REPLACE FUNCTION public.get_user_hc_balance(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
    RETURN COALESCE(
        (SELECT balance FROM public.wallets WHERE user_id = p_user_id),
        0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add credits to user's wallet
CREATE OR REPLACE FUNCTION public.add_user_credits(
    p_user_id UUID,
    p_amount DECIMAL,
    p_type VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_wallet_id UUID;
BEGIN
    -- Get or create wallet
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id;
    
    IF v_wallet_id IS NULL THEN
        INSERT INTO public.wallets (user_id, balance, currency)
        VALUES (p_user_id, 0, 'HC')
        RETURNING id INTO v_wallet_id;
    END IF;
    
    -- Update balance
    UPDATE public.wallets SET balance = balance + p_amount, last_updated_at = NOW()
    WHERE id = v_wallet_id;
    
    -- Log transaction
    INSERT INTO public.transactions (wallet_id, amount, type, description, metadata)
    VALUES (v_wallet_id, p_amount, p_type, p_description, p_metadata);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to spend credits from user's wallet
CREATE OR REPLACE FUNCTION public.spend_user_credits(
    p_user_id UUID,
    p_amount DECIMAL,
    p_type VARCHAR,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_wallet_id UUID;
    v_balance DECIMAL;
BEGIN
    -- Get wallet and balance
    SELECT id, balance INTO v_wallet_id, v_balance 
    FROM public.wallets WHERE user_id = p_user_id;
    
    IF v_wallet_id IS NULL OR v_balance < p_amount THEN
        RETURN FALSE; -- Insufficient balance
    END IF;
    
    -- Deduct balance
    UPDATE public.wallets SET balance = balance - p_amount, last_updated_at = NOW()
    WHERE id = v_wallet_id;
    
    -- Log transaction (negative amount for spending)
    INSERT INTO public.transactions (wallet_id, amount, type, description, metadata)
    VALUES (v_wallet_id, -p_amount, p_type, p_description, p_metadata);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
