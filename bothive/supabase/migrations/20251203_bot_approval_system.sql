-- Add bot deployment status system
-- This tracks bot approval status and developer verification

-- Create developer_profiles table (can't modify auth.users directly)
CREATE TABLE IF NOT EXISTS developer_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  verified_developer BOOLEAN DEFAULT FALSE,
  developer_since TIMESTAMP,
  total_deployments INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_developer_profiles_verified ON developer_profiles(verified_developer);

-- Enable RLS
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own developer profile"
  ON developer_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can create their own developer profile"
  ON developer_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own developer profile"
  ON developer_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create bots table if it doesn't exist (or add columns if it does)
CREATE TABLE IF NOT EXISTS bots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT DEFAULT 'bot',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add new columns if they don't exist (for existing tables)
ALTER TABLE bots ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending_review';
ALTER TABLE bots ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);
ALTER TABLE bots ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS pricing_tier TEXT; -- Developer chooses pricing
ALTER TABLE bots ADD COLUMN IF NOT EXISTS channels TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE bots ADD COLUMN IF NOT EXISTS hivelang_code TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS system_prompt TEXT;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS capabilities TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE bots ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS install_count INTEGER DEFAULT 0;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS rating_average DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Fix existing data to have valid values before adding constraints
UPDATE bots SET status = 'pending' WHERE status IS NULL OR status NOT IN ('pending', 'approved', 'rejected');
UPDATE bots SET approval_status = 'pending_review' WHERE approval_status IS NULL;
UPDATE bots SET pricing_tier = 'free' WHERE pricing_tier IS NULL; -- Default only for existing rows

-- Add constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_status') THEN
    ALTER TABLE bots ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'valid_tier') THEN
    ALTER TABLE bots ADD CONSTRAINT valid_tier CHECK (pricing_tier IN ('free', 'basic', 'pro', 'enterprise'));
  END IF;
END $$;

-- Add index for quick lookups
CREATE INDEX IF NOT EXISTS idx_bots_user_id ON bots(user_id);
CREATE INDEX IF NOT EXISTS idx_bots_status ON bots(status);
CREATE INDEX IF NOT EXISTS idx_bots_published ON bots(is_published);

-- Function to auto-approve bots from verified developers
CREATE OR REPLACE FUNCTION auto_approve_bot()
RETURNS TRIGGER AS $$
DECLARE
  dev_verified BOOLEAN;
  dev_since TIMESTAMP;
  years_active NUMERIC;
BEGIN
  -- Get developer info from developer_profiles
  SELECT verified_developer, developer_since
  INTO dev_verified, dev_since
  FROM developer_profiles
  WHERE user_id = NEW.user_id;
  
  -- Calculate years of experience
  IF dev_since IS NOT NULL THEN
    years_active := EXTRACT(EPOCH FROM (NOW() - dev_since)) / (365.25 * 24 * 60 * 60);
  ELSE
    years_active := 0;
  END IF;
  
  -- Auto-approve if developer is verified AND has 1+ years experience
  IF dev_verified = TRUE AND years_active >= 1.0 THEN
    NEW.status := 'approved';
    NEW.approval_status := 'auto_approved';
    NEW.approved_at := NOW();
  ELSE
    NEW.status := 'pending';
    NEW.approval_status := 'pending_review';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-approve on insert
DROP TRIGGER IF EXISTS trigger_auto_approve_bot ON bots;
CREATE TRIGGER trigger_auto_approve_bot
  BEFORE INSERT ON bots
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_bot();

-- Function to update user's total deployments
CREATE OR REPLACE FUNCTION increment_user_deployments()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile if doesn't exist, then increment
  INSERT INTO developer_profiles (user_id, total_deployments)
  VALUES (NEW.user_id, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET total_deployments = developer_profiles.total_deployments + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

--Trigger to increment deployment count
DROP TRIGGER IF EXISTS trigger_increment_deployments ON bots;
CREATE TRIGGER trigger_increment_deployments
  AFTER INSERT ON bots
  FOR EACH ROW
  EXECUTE FUNCTION increment_user_deployments();

-- RLS Policies
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;

-- Users can see their own bots
CREATE POLICY "Users can view their own bots"
  ON bots FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create bots
CREATE POLICY "Users can create bots"
  ON bots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own bots
CREATE POLICY "Users can update their own bots"
  ON bots FOR UPDATE
  USING (auth.uid() = user_id);

-- Everyone can see approved, published bots
CREATE POLICY "Everyone can see published approved bots"
  ON bots FOR SELECT
  USING (status = 'approved' AND is_published = TRUE);

-- Create bot_deployment_logs table
CREATE TABLE IF NOT EXISTS bot_deployment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  status TEXT NOT NULL, -- 'success', 'pending', 'failed'
  message TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deployment_logs_bot ON bot_deployment_logs(bot_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_user ON bot_deployment_logs(user_id);

-- Enable RLS
ALTER TABLE bot_deployment_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their deployment logs"
  ON bot_deployment_logs FOR SELECT
  USING (auth.uid() = user_id);
