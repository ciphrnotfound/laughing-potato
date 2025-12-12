-- Phase 5: HiveStore Quality Features (CORRECTED & CLEANED)
-- Rating system, reviews, badges, and quality requirements

-- 1. Add columns to existing tables (safe to run multiple times)
ALTER TABLE bots ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0.0;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE bots ADD COLUMN IF NOT EXISTS quality_badge TEXT;

ALTER TABLE integrations ADD COLUMN IF NOT EXISTS average_rating DECIMAL(2,1) DEFAULT 0.0;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE integrations ADD COLUMN IF NOT EXISTS quality_badge TEXT;

-- 2. Drop existing review tables to ensure clean schema (fixes column mismatch errors)
DROP TABLE IF EXISTS bot_reviews CASCADE;
DROP TABLE IF EXISTS integration_reviews CASCADE;

-- 3. Create bot_reviews table
CREATE TABLE bot_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(bot_id, reviewer_id)
);

CREATE INDEX idx_bot_reviews_bot ON bot_reviews(bot_id);
CREATE INDEX idx_bot_reviews_reviewer ON bot_reviews(reviewer_id);

-- 4. Create integration_reviews table
CREATE TABLE integration_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(integration_id, reviewer_id)
);

CREATE INDEX idx_integration_reviews_integration ON integration_reviews(integration_id);
CREATE INDEX idx_integration_reviews_reviewer ON integration_reviews(reviewer_id);

-- 5. Functions and Triggers

-- Bot Rating Trigger
CREATE OR REPLACE FUNCTION update_bot_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_bot_id UUID;
BEGIN
    target_bot_id := COALESCE(NEW.bot_id, OLD.bot_id);
    
    UPDATE bots
    SET 
        average_rating = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM bot_reviews
            WHERE bot_id = target_bot_id
        ), 0.0),
        total_reviews = (
            SELECT COUNT(*)
            FROM bot_reviews
            WHERE bot_id = target_bot_id
        ),
        updated_at = NOW()
    WHERE id = target_bot_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_bot_rating ON bot_reviews;
CREATE TRIGGER trigger_update_bot_rating
    AFTER INSERT OR UPDATE OR DELETE ON bot_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_rating();

-- Integration Rating Trigger
CREATE OR REPLACE FUNCTION update_integration_rating()
RETURNS TRIGGER AS $$
DECLARE
    target_integration_id UUID;
BEGIN
    target_integration_id := COALESCE(NEW.integration_id, OLD.integration_id);
    
    UPDATE integrations
    SET 
        average_rating = COALESCE((
            SELECT ROUND(AVG(rating)::numeric, 1)
            FROM integration_reviews
            WHERE integration_id = target_integration_id
        ), 0.0),
        total_reviews = (
            SELECT COUNT(*)
            FROM integration_reviews
            WHERE integration_id = target_integration_id
        ),
        updated_at = NOW()
    WHERE id = target_integration_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_integration_rating ON integration_reviews;
CREATE TRIGGER trigger_update_integration_rating
    AFTER INSERT OR UPDATE OR DELETE ON integration_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_integration_rating();

-- 6. RLS Policies
ALTER TABLE bot_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "bot_reviews_select_policy" ON bot_reviews;
DROP POLICY IF EXISTS "bot_reviews_insert_policy" ON bot_reviews;
DROP POLICY IF EXISTS "bot_reviews_update_policy" ON bot_reviews;
DROP POLICY IF EXISTS "bot_reviews_delete_policy" ON bot_reviews;

DROP POLICY IF EXISTS "integration_reviews_select_policy" ON integration_reviews;
DROP POLICY IF EXISTS "integration_reviews_insert_policy" ON integration_reviews;
DROP POLICY IF EXISTS "integration_reviews_update_policy" ON integration_reviews;
DROP POLICY IF EXISTS "integration_reviews_delete_policy" ON integration_reviews;

-- Everyone can read reviews
CREATE POLICY "bot_reviews_select_policy"
    ON bot_reviews FOR SELECT
    USING (true);

CREATE POLICY "integration_reviews_select_policy"
    ON integration_reviews FOR SELECT
    USING (true);

-- Users can create reviews
CREATE POLICY "bot_reviews_insert_policy"
    ON bot_reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "integration_reviews_insert_policy"
    ON integration_reviews FOR INSERT
    WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own reviews
CREATE POLICY "bot_reviews_update_policy"
    ON bot_reviews FOR UPDATE
    USING (auth.uid() = reviewer_id);

CREATE POLICY "integration_reviews_update_policy"
    ON integration_reviews FOR UPDATE
    USING (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "bot_reviews_delete_policy"
    ON bot_reviews FOR DELETE
    USING (auth.uid() = reviewer_id);

CREATE POLICY "integration_reviews_delete_policy"
    ON integration_reviews FOR DELETE
    USING (auth.uid() = reviewer_id);
