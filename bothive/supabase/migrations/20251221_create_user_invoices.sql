-- Create user_invoices table to track billing history
CREATE TABLE IF NOT EXISTS public.user_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL, -- in kobo
    currency TEXT NOT NULL DEFAULT 'NGN',
    status TEXT NOT NULL DEFAULT 'paid', -- paid, pending, failed
    plan_name TEXT NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,
    applied_coupon TEXT, -- Optional coupon code used
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_invoices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own invoices"
    ON public.user_invoices
    FOR SELECT
    USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_invoices_updated_at
    BEFORE UPDATE ON public.user_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
