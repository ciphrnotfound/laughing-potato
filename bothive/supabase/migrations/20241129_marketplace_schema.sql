-- ============================================
-- BOTHIVE INTEGRATION MARKETPLACE
-- Database Schema
-- ============================================

-- ============================================
-- 1. USER TIERS & SUBSCRIPTIONS
-- ============================================

-- User account types and subscription status
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tier information
    tier TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'enterprise'
    is_developer BOOLEAN DEFAULT FALSE,
    
    -- Stripe subscription (for Pro/Enterprise)
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT,
    subscription_status TEXT, -- 'active', 'canceled', 'past_due', 'trialing'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Billing
    billing_email TEXT,
    price_id TEXT, -- Stripe price ID
    
    -- Developer info (if is_developer = true)
    developer_name TEXT,
    developer_bio TEXT,
    developer_website TEXT,
    stripe_connect_account_id TEXT UNIQUE, -- For payouts
    payout_enabled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ============================================
-- 2. MARKETPLACE INTEGRATIONS
-- ============================================

-- All integrations available in the marketplace
CREATE TABLE IF NOT EXISTS public.marketplace_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    developer_id UUID NOT NULL REFERENCES auth.users(id),
    category TEXT NOT NULL, -- 'social', 'productivity', 'communication', 'ecommerce', 'developer', 'marketing'
    
    -- Description
    short_description TEXT NOT NULL,
    long_description TEXT,
    icon_url TEXT,
    cover_image_url TEXT,
    screenshots JSONB DEFAULT '[]'::jsonb, -- Array of URLs
    
    -- Pricing
    pricing_model TEXT NOT NULL DEFAULT 'free', -- 'free', 'one_time', 'subscription'
    price DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    billing_interval TEXT, -- 'monthly', 'yearly' (null for free/one_time)
    stripe_price_id TEXT, -- Stripe price ID for subscriptions
    stripe_product_id TEXT, -- Stripe product ID
    
    -- Technical details
    integration_type TEXT NOT NULL, -- 'api', 'oauth', 'webhook'
    auth_method TEXT, -- 'api_key', 'oauth2', 'bearer', 'none'
    capabilities JSONB DEFAULT '[]'::jsonb, -- Array of what it can do
    
    -- Code/Implementation
    sdk_package_url TEXT, -- NPM package or GitHub release
    sdk_version TEXT,
    entry_point TEXT, -- Main class/function name
    documentation_url TEXT,
    
    -- Status & Review
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'suspended'
    review_notes TEXT,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMPTZ,
    
    -- Stats
    total_installs INTEGER DEFAULT 0,
    active_installs INTEGER DEFAULT 0,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Tags for search
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- ============================================
-- 3. USER PURCHASES & SUBSCRIPTIONS
-- ============================================

-- Track user purchases of integrations
CREATE TABLE IF NOT EXISTS public.user_integration_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES marketplace_integrations(id) ON DELETE CASCADE,
    
    -- Purchase type
    purchase_type TEXT NOT NULL, -- 'free', 'one_time', 'subscription'
    
    -- Payment (one-time)
    payment_intent_id TEXT, -- Stripe payment intent (for one-time)
    amount_paid DECIMAL(10,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    payment_status TEXT, -- 'pending', 'completed', 'failed', 'refunded'
    
    -- Subscription (recurring)
    subscription_id TEXT, -- Stripe subscription ID
    subscription_status TEXT, -- 'active', 'canceled', 'past_due'
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    
    -- Installation
    is_installed BOOLEAN DEFAULT TRUE,
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    uninstalled_at TIMESTAMPTZ,
    
    -- Credentials (encrypted)
    encrypted_credentials TEXT,
    credentials_iv TEXT,
    credentials_auth_tag TEXT,
    credentials_salt TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, integration_id)
);

-- ============================================
-- 4. REVENUE TRACKING & PAYOUTS
-- ============================================

-- Transaction log for all purchases
CREATE TABLE IF NOT EXISTS public.revenue_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference
    purchase_id UUID NOT NULL REFERENCES user_integration_purchases(id),
    integration_id UUID NOT NULL REFERENCES marketplace_integrations(id),
    buyer_id UUID NOT NULL REFERENCES auth.users(id),
    seller_id UUID NOT NULL REFERENCES auth.users(id), -- Integration developer
    
    -- Transaction details
    transaction_type TEXT NOT NULL, -- 'purchase', 'subscription', 'refund'
    gross_amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Fee calculation
    buyer_tier TEXT NOT NULL, -- 'free', 'pro', 'enterprise', 'developer'
    platform_fee_percent DECIMAL(5,2) NOT NULL, -- e.g., 15.00, 20.00, 40.00
    platform_fee_amount DECIMAL(10,2) NOT NULL,
    seller_net_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment provider
    stripe_charge_id TEXT,
    stripe_payout_id TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    seller_paid BOOLEAN DEFAULT FALSE,
    seller_paid_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Developer earnings summary (for quick lookups)
CREATE TABLE IF NOT EXISTS public.developer_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES marketplace_integrations(id) ON DELETE SET NULL,
    
    -- Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    
    -- Earnings
    total_gross DECIMAL(12,2) DEFAULT 0,
    total_platform_fees DECIMAL(12,2) DEFAULT 0,
    total_net DECIMAL(12,2) DEFAULT 0,
    
    -- Stats
    transaction_count INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    
    -- Payout
    payout_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'failed'
    stripe_payout_id TEXT,
    paid_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payout requests from developers
CREATE TABLE IF NOT EXISTS public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    developer_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Amount
    requested_amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'rejected'
    rejection_reason TEXT,
    
    -- Stripe
    stripe_payout_id TEXT,
    stripe_arrival_date TIMESTAMPTZ,
    
    -- Timestamps
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- ============================================
-- 5. REVIEWS & RATINGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.integration_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id UUID NOT NULL REFERENCES marketplace_integrations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_title TEXT,
    review_text TEXT,
    
    -- Helpful votes
    helpful_count INTEGER DEFAULT 0,
    
    -- Verified purchase
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    purchase_id UUID REFERENCES user_integration_purchases(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(integration_id, user_id)
);

-- ============================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================

-- User subscriptions
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_tier ON public.user_subscriptions(tier);
CREATE INDEX idx_user_subscriptions_is_developer ON public.user_subscriptions(is_developer);

-- Marketplace integrations
CREATE INDEX idx_marketplace_integrations_developer_id ON public.marketplace_integrations(developer_id);
CREATE INDEX idx_marketplace_integrations_status ON public.marketplace_integrations(status);
CREATE INDEX idx_marketplace_integrations_category ON public.marketplace_integrations(category);
CREATE INDEX idx_marketplace_integrations_pricing_model ON public.marketplace_integrations(pricing_model);

-- User purchases
CREATE INDEX idx_user_integration_purchases_user_id ON public.user_integration_purchases(user_id);
CREATE INDEX idx_user_integration_purchases_integration_id ON public.user_integration_purchases(integration_id);
CREATE INDEX idx_user_integration_purchases_status ON public.user_integration_purchases(is_installed);

-- Revenue transactions
CREATE INDEX idx_revenue_transactions_seller_id ON public.revenue_transactions(seller_id);
CREATE INDEX idx_revenue_transactions_buyer_id ON public.revenue_transactions(buyer_id);
CREATE INDEX idx_revenue_transactions_integration_id ON public.revenue_transactions(integration_id);
CREATE INDEX idx_revenue_transactions_created_at ON public.revenue_transactions(created_at);

-- Developer earnings
CREATE INDEX idx_developer_earnings_developer_id ON public.developer_earnings(developer_id);
CREATE INDEX idx_developer_earnings_period ON public.developer_earnings(period_start, period_end);

-- Reviews
CREATE INDEX idx_integration_reviews_integration_id ON public.integration_reviews(integration_id);
CREATE INDEX idx_integration_reviews_user_id ON public.integration_reviews(user_id);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- User subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON public.user_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.user_subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Marketplace integrations
ALTER TABLE public.marketplace_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved integrations" ON public.marketplace_integrations
    FOR SELECT USING (status = 'approved' OR developer_id = auth.uid());

CREATE POLICY "Developers can insert integrations" ON public.marketplace_integrations
    FOR INSERT WITH CHECK (auth.uid() = developer_id);

CREATE POLICY "Developers can update own integrations" ON public.marketplace_integrations
    FOR UPDATE USING (auth.uid() = developer_id);

-- User purchases
ALTER TABLE public.user_integration_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" ON public.user_integration_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases" ON public.user_integration_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchases" ON public.user_integration_purchases
    FOR UPDATE USING (auth.uid() = user_id);

-- Revenue transactions
ALTER TABLE public.revenue_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sellers can view own transactions" ON public.revenue_transactions
    FOR SELECT USING (auth.uid() = seller_id);

-- Developer earnings
ALTER TABLE public.developer_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can view own earnings" ON public.developer_earnings
    FOR SELECT USING (auth.uid() = developer_id);

-- Reviews
ALTER TABLE public.integration_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.integration_reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own reviews" ON public.integration_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.integration_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Calculate platform fee based on user tier
CREATE OR REPLACE FUNCTION calculate_platform_fee(
    buyer_tier TEXT,
    gross_amount DECIMAL
) RETURNS TABLE (
    fee_percent DECIMAL,
    fee_amount DECIMAL,
    net_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN buyer_tier = 'developer' THEN 15.00
            WHEN buyer_tier = 'pro' THEN 20.00
            WHEN buyer_tier = 'enterprise' THEN 10.00
            ELSE 40.00 -- free tier
        END AS fee_percent,
        ROUND(gross_amount * (
            CASE 
                WHEN buyer_tier = 'developer' THEN 0.15
                WHEN buyer_tier = 'pro' THEN 0.20
                WHEN buyer_tier = 'enterprise' THEN 0.10
                ELSE 0.40
            END
        ), 2) AS fee_amount,
        ROUND(gross_amount * (
            CASE 
                WHEN buyer_tier = 'developer' THEN 0.85
                WHEN buyer_tier = 'pro' THEN 0.80
                WHEN buyer_tier = 'enterprise' THEN 0.90
                ELSE 0.60
            END
        ), 2) AS net_amount;
END;
$$ LANGUAGE plpgsql;

-- Update integration stats after purchase
CREATE OR REPLACE FUNCTION update_integration_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_installed = TRUE THEN
        UPDATE marketplace_integrations
        SET 
            total_installs = total_installs + 1,
            active_installs = active_installs + 1
        WHERE id = NEW.integration_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.is_installed = TRUE AND OLD.is_installed = FALSE THEN
            UPDATE marketplace_integrations
            SET active_installs = active_installs + 1
            WHERE id = NEW.integration_id;
        ELSIF NEW.is_installed = FALSE AND OLD.is_installed = TRUE THEN
            UPDATE marketplace_integrations
            SET active_installs = active_installs - 1
            WHERE id = NEW.integration_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_integration_stats
AFTER INSERT OR UPDATE ON user_integration_purchases
FOR EACH ROW EXECUTE FUNCTION update_integration_stats();

-- Update integration rating after review
CREATE OR REPLACE FUNCTION update_integration_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketplace_integrations
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM integration_reviews
            WHERE integration_id = NEW.integration_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM integration_reviews
            WHERE integration_id = NEW.integration_id
        )
    WHERE id = NEW.integration_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_integration_rating
AFTER INSERT OR UPDATE OR DELETE ON integration_reviews
FOR EACH ROW EXECUTE FUNCTION update_integration_rating();
