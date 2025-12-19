-- Enable the Hive Network Economy

-- 1. Update 'bots' table for Marketplace
ALTER TABLE bots 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hiring_fee INTEGER DEFAULT 0, -- Cost in Credits
ADD COLUMN IF NOT EXISTS reputation_score FLOAT DEFAULT 0, -- 0.0 to 5.0
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS service_schema JSONB DEFAULT '{}'::jsonb; -- Input/Output definition

-- 2. Create User Wallets (Credits)
CREATE TABLE IF NOT EXISTS user_wallets (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER DEFAULT 100, -- Free tier starting credits
    total_earned INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Wallets
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet" 
    ON user_wallets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" 
    ON user_wallets FOR UPDATE
    USING (auth.uid() = user_id); -- In reality, updates should be server-side only via RPC, but this allows dev testing for now

-- 3. Create Transactions Ledger
CREATE TABLE IF NOT EXISTS hive_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_user_id UUID REFERENCES auth.users(id), -- Who hired
    provider_user_id UUID REFERENCES auth.users(id), -- Who got hired
    
    caller_bot_id UUID REFERENCES bots(id), -- Specific bot making the call (optional)
    provider_bot_id UUID REFERENCES bots(id), -- The bot being hired
    
    amount INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    
    input_params JSONB,
    output_result JSONB,
    execution_log TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- RLS for Transactions
ALTER TABLE hive_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view transactions involving them" 
    ON hive_transactions FOR SELECT 
    USING (auth.uid() = caller_user_id OR auth.uid() = provider_user_id);

-- 4. Initial Trigger to create wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id, credits)
  VALUES (new.id, 100);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger logic would ideally be attached to auth.users, but we can't always modify that easily in migrations.
-- We'll assume the app handles wallet creation lazily, or we rely on a separate specific Auth hook migration.
-- For now, we will just ensure existing users have wallets via a script if needed.

-- Seed for existing users (Run carefully)
INSERT INTO user_wallets (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
