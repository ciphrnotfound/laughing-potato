-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    discount_percent INTEGER NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (for validation)
CREATE POLICY "Allow read access for authenticated users" 
ON coupons FOR SELECT 
TO authenticated 
USING (true);

-- Allow full access to service role (admin)
CREATE POLICY "Allow full access for service role" 
ON coupons FOR ALL 
TO service_role 
USING (true);

-- Insert some initial default coupons (optional, can be removed if strictly dynamic)
INSERT INTO coupons (code, discount_percent) VALUES 
('LAUNCH20', 20),
('WELCOME10', 10)
ON CONFLICT (code) DO NOTHING;
