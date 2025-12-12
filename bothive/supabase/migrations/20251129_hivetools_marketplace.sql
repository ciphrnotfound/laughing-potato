-- HiveTools Marketplace Database Schema
-- User installations and tool metadata

-- Tool installations table (user's installed tools)
CREATE TABLE IF NOT EXISTS user_tool_installations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    encrypted_credentials TEXT,
    credentials_iv TEXT,
    credentials_auth_tag TEXT,
    salt TEXT,
    installed_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    last_used_at TIMESTAMPTZ,
    UNIQUE(user_id, tool_name)
);

-- Tool analytics table (track downloads and usage)
CREATE TABLE IF NOT EXISTS tool_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name TEXT NOT NULL,
    downloads_count INT DEFAULT 0,
    active_users_count INT DEFAULT 0,
    total_executions BIGINT DEFAULT 0,
    average_rating DECIMAL(3,2),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tool_name)
);

-- Tool reviews table
CREATE TABLE IF NOT EXISTS tool_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_name TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, tool_name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_tool_installations_user_id ON user_tool_installations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_installations_tool_name ON user_tool_installations(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_analytics_tool_name ON tool_analytics(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_reviews_tool_name ON tool_reviews(tool_name);

-- RPC function to increment download count
CREATE OR REPLACE FUNCTION increment_tool_downloads(tool_name TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO tool_analytics (tool_name, downloads_count, updated_at)
    VALUES (tool_name, 1, now())
    ON CONFLICT (tool_name)
    DO UPDATE SET
        downloads_count = tool_analytics.downloads_count + 1,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- RPC function to update tool rating
CREATE OR REPLACE FUNCTION update_tool_rating(tool_name TEXT)
RETURNS VOID AS $$
DECLARE
    avg_rating DECIMAL(3,2);
BEGIN
    SELECT AVG(rating)::DECIMAL(3,2) INTO avg_rating
    FROM tool_reviews
    WHERE tool_reviews.tool_name = $1;
    
    INSERT INTO tool_analytics (tool_name, average_rating, updated_at)
    VALUES (tool_name, avg_rating, now())
    ON CONFLICT (tool_name)
    DO UPDATE SET
        average_rating = avg_rating,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- RPC function to get user's installed tools
CREATE OR REPLACE FUNCTION get_user_installed_tools(user_uuid UUID)
RETURNS TABLE (
    tool_name TEXT,
    installed_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        uit.tool_name,
        uit.installed_at,
        uit.last_used_at
    FROM user_tool_installations uit
    WHERE uit.user_id = user_uuid AND uit.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
