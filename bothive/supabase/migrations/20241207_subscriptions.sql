-- Bothive Subscription & Usage System
-- Run this migration in Supabase SQL Editor

-- 1. Subscription tier enum
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'boost', 'developer', 'business');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add tier columns to users (or profiles table if you use that)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tier subscription_tier DEFAULT 'free',
ADD COLUMN IF NOT EXISTS tier_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS paystack_customer_code TEXT;

-- 3. Usage tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL, -- Format: '2024-12'
    ai_messages_used INT DEFAULT 0,
    bots_created INT DEFAULT 0,
    integrations_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- 4. Developer reputation table
CREATE TABLE IF NOT EXISTS public.dev_reputation (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_bots INT DEFAULT 0,
    approved_bots INT DEFAULT 0,
    rejected_bots INT DEFAULT 0,
    avg_rating DECIMAL(2,1) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    total_downloads INT DEFAULT 0,
    is_trusted BOOLEAN DEFAULT FALSE,
    trust_granted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bot requests table (for Boost tier free bot)
CREATE TABLE IF NOT EXISTS public.bot_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    use_case TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    assigned_to UUID REFERENCES auth.users(id),
    resulting_bot_id UUID REFERENCES public.bots(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Subscription history for audit
CREATE TABLE IF NOT EXISTS public.subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_tier subscription_tier,
    to_tier subscription_tier NOT NULL,
    reason TEXT, -- 'upgrade', 'downgrade', 'expired', 'admin'
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Enable RLS
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dev_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_history ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies
-- Usage tracking: users can only see their own
CREATE POLICY "Users can view own usage" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update usage" ON public.usage_tracking
    FOR UPDATE USING (auth.uid() = user_id);

-- Dev reputation: anyone can view, only system updates
CREATE POLICY "Anyone can view reputation" ON public.dev_reputation
    FOR SELECT USING (true);

-- Bot requests: users can see their own
CREATE POLICY "Users can view own bot requests" ON public.bot_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bot requests" ON public.bot_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 9. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON public.usage_tracking(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_dev_reputation_trusted ON public.dev_reputation(is_trusted) WHERE is_trusted = true;
CREATE INDEX IF NOT EXISTS idx_bot_requests_status ON public.bot_requests(status);

-- 10. Function to get current month usage
CREATE OR REPLACE FUNCTION get_current_usage(p_user_id UUID)
RETURNS TABLE(ai_messages_used INT, bots_created INT) AS $$
BEGIN
    RETURN QUERY
    SELECT COALESCE(ut.ai_messages_used, 0), COALESCE(ut.bots_created, 0)
    FROM public.usage_tracking ut
    WHERE ut.user_id = p_user_id 
    AND ut.month_year = TO_CHAR(NOW(), 'YYYY-MM');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS INT AS $$
DECLARE
    v_current_month VARCHAR(7);
    v_new_count INT;
BEGIN
    v_current_month := TO_CHAR(NOW(), 'YYYY-MM');
    
    INSERT INTO public.usage_tracking (user_id, month_year, ai_messages_used)
    VALUES (p_user_id, v_current_month, 1)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET 
        ai_messages_used = usage_tracking.ai_messages_used + 1,
        updated_at = NOW()
    RETURNING ai_messages_used INTO v_new_count;
    
    RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
