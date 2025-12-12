-- Universal Integrations System Database Schema
-- This allows developers to create ANY integration (YouTube, WhatsApp, Notion, etc.)

-- ============================================
-- INTEGRATIONS TABLE
-- ============================================
-- Stores all available integrations (created by developers)
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL, -- "YouTube API", "Notion", "WhatsApp Business"
  slug TEXT UNIQUE NOT NULL, -- "youtube", "notion", "whatsapp"
  description TEXT,
  icon_url TEXT,
  category TEXT DEFAULT 'other', -- 'productivity', 'social', 'media', 'communication', 'ai', 'other'
  
  -- Authentication Configuration
  auth_type TEXT DEFAULT 'none', -- 'oauth2', 'api_key', 'webhook', 'none'
  oauth_config JSONB, -- {client_id, scopes, auth_url, token_url, redirect_uri}
  requires_api_key BOOLEAN DEFAULT FALSE,
  api_key_instructions TEXT, -- How to get API key
  
  -- Capabilities (what this integration can do)
  -- Example: [{"name": "get_video_info", "description": "Get video metadata", "params": ["video_id"], "returns": "object"}]
  capabilities JSONB DEFAULT '[]'::jsonb,
  
  -- Webhook configuration
  webhook_url TEXT, -- Base URL for webhooks
  webhook_events TEXT[], -- Supported webhook events
  
  -- Documentation
  documentation_url TEXT,
  code_example TEXT, -- HiveLang code example
  
  -- Status & Analytics
  status TEXT DEFAULT 'active', -- 'active', 'beta', 'deprecated', 'suspended'
  is_official BOOLEAN DEFAULT FALSE, -- BotHive official integrations
  is_verified BOOLEAN DEFAULT FALSE, -- Verified by BotHive team
  install_count INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0, -- Total API calls made
  
  -- Pricing (for paid integrations)
  is_paid BOOLEAN DEFAULT FALSE,
  price_per_month DECIMAL(10,2),
  free_tier_limit INTEGER, -- Free API calls per month
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_auth_type CHECK (auth_type IN ('oauth2', 'api_key', 'webhook', 'none')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'beta', 'deprecated', 'suspended')),
  CONSTRAINT valid_category CHECK (category IN ('productivity', 'social', 'media', 'communication', 'ai', 'finance', 'education', 'health', 'other'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_integrations_developer ON integrations(developer_id);
CREATE INDEX IF NOT EXISTS idx_integrations_slug ON integrations(slug);
CREATE INDEX IF NOT EXISTS idx_integrations_category ON integrations(category);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);
CREATE INDEX IF NOT EXISTS idx_integrations_official ON integrations(is_official);

-- ============================================
-- USER_INTEGRATIONS TABLE
-- ============================================
-- Stores user's connected integrations (OAuth tokens, API keys)
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  
  -- Credentials (should be encrypted in production)
  access_token TEXT, -- OAuth access token
  refresh_token TEXT, -- OAuth refresh token
  api_key TEXT, -- API key for key-based auth
  additional_config JSONB, -- Extra config (webhook secrets, etc.)
  
  -- Token expiry
  expires_at TIMESTAMP,
  
  -- Status & Usage
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'revoked', 'error'
  last_used_at TIMESTAMP,
  error_message TEXT, -- Last error if connection failed
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_connection_status CHECK (status IN ('active', 'expired', 'revoked', 'error')),
  UNIQUE(user_id, integration_id) -- One connection per user per integration
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_integrations_user ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_integration ON user_integrations(integration_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_status ON user_integrations(status);

-- ============================================
-- BOT_INTEGRATIONS TABLE
-- ============================================
-- Links bots to the integrations they use
CREATE TABLE IF NOT EXISTS bot_integrations (
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  
  -- Configuration
  required BOOLEAN DEFAULT TRUE, -- Is this integration required for the bot to work?
  config JSONB, -- Bot-specific integration config
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  
  PRIMARY KEY (bot_id, integration_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bot_integrations_bot ON bot_integrations(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_integrations_integration ON bot_integrations(integration_id);

-- ============================================
-- INTEGRATION_CALLS LOG TABLE
-- ============================================
-- Track API calls for analytics and billing
CREATE TABLE IF NOT EXISTS integration_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
  
  -- Call details
  capability_name TEXT NOT NULL, -- Which capability was called
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  response_time_ms INTEGER, -- How long the call took
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_integration_calls_user ON integration_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_calls_integration ON integration_calls(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_calls_bot ON integration_calls(bot_id);
CREATE INDEX IF NOT EXISTS idx_integration_calls_created ON integration_calls(created_at);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Integrations Table
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Anyone can view active integrations
CREATE POLICY "Anyone can view active integrations"
  ON integrations FOR SELECT
  USING (status = 'active' OR status = 'beta');

-- Developers can create integrations
CREATE POLICY "Developers can create integrations"
  ON integrations FOR INSERT
  WITH CHECK (auth.uid() = developer_id);

-- Developers can update their own integrations
CREATE POLICY "Developers can update their own integrations"
  ON integrations FOR UPDATE
  USING (auth.uid() = developer_id);

-- Developers can delete their own integrations
CREATE POLICY "Developers can delete their own integrations"
  ON integrations FOR DELETE
  USING (auth.uid() = developer_id);

-- User Integrations Table
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own connected integrations
CREATE POLICY "Users can view their own connected integrations"
  ON user_integrations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can connect integrations
CREATE POLICY "Users can connect integrations"
  ON user_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own connections
CREATE POLICY "Users can update their own connections"
  ON user_integrations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own connections
CREATE POLICY "Users can delete their own connections"
  ON user_integrations FOR DELETE
  USING (auth.uid() = user_id);

-- Bot Integrations Table
ALTER TABLE bot_integrations ENABLE ROW LEVEL SECURITY;

-- Anyone can see which integrations a bot uses
CREATE POLICY "Anyone can see bot integrations"
  ON bot_integrations FOR SELECT
  USING (true);

-- Bot owners can manage bot integrations
CREATE POLICY "Bot owners can manage bot integrations"
  ON bot_integrations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM bots WHERE bots.id = bot_integrations.bot_id AND bots.user_id = auth.uid()
    )
  );

-- Integration Calls Table
ALTER TABLE integration_calls ENABLE ROW LEVEL SECURITY;

-- Users can view their own call logs
CREATE POLICY "Users can view their own call logs"
  ON integration_calls FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert call logs
CREATE POLICY "System can insert call logs"
  ON integration_calls FOR INSERT
  WITH CHECK (true); -- Backend will handle this

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to increment integration install count
CREATE OR REPLACE FUNCTION increment_integration_installs()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE integrations
  SET install_count = install_count + 1
  WHERE id = NEW.integration_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger when user connects an integration
DROP TRIGGER IF EXISTS trigger_increment_integration_installs ON user_integrations;
CREATE TRIGGER trigger_increment_integration_installs
  AFTER INSERT ON user_integrations
  FOR EACH ROW
  EXECUTE FUNCTION increment_integration_installs();

-- Function to update integration usage count
CREATE OR REPLACE FUNCTION increment_integration_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE integrations
  SET usage_count = usage_count + 1
  WHERE id = NEW.integration_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger when integration is called
DROP TRIGGER IF EXISTS trigger_increment_integration_usage ON integration_calls;
CREATE TRIGGER trigger_increment_integration_usage
  AFTER INSERT ON integration_calls
  FOR EACH ROW
  EXECUTE FUNCTION increment_integration_usage();
