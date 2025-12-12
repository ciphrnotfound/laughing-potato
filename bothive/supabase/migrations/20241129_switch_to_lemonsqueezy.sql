-- Update schema for Lemon Squeezy
-- Rename Stripe columns to generic or Lemon Squeezy specific names

-- 1. User Subscriptions
ALTER TABLE public.user_subscriptions 
RENAME COLUMN stripe_customer_id TO lemon_squeezy_customer_id;

ALTER TABLE public.user_subscriptions 
RENAME COLUMN stripe_subscription_id TO lemon_squeezy_subscription_id;

ALTER TABLE public.user_subscriptions 
RENAME COLUMN price_id TO lemon_squeezy_variant_id;

-- Remove Stripe Connect columns (we'll use manual payouts)
ALTER TABLE public.user_subscriptions 
DROP COLUMN IF EXISTS stripe_connect_account_id;

ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS payout_method TEXT, -- 'paypal', 'wise', etc.
ADD COLUMN IF NOT EXISTS payout_details JSONB; -- Email, account info

-- 2. Marketplace Integrations
ALTER TABLE public.marketplace_integrations 
RENAME COLUMN stripe_price_id TO lemon_squeezy_variant_id;

ALTER TABLE public.marketplace_integrations 
RENAME COLUMN stripe_product_id TO lemon_squeezy_product_id;

-- 3. User Purchases
ALTER TABLE public.user_integration_purchases 
RENAME COLUMN payment_intent_id TO lemon_squeezy_order_id;

ALTER TABLE public.user_integration_purchases 
RENAME COLUMN subscription_id TO lemon_squeezy_subscription_id;

-- 4. Revenue Transactions
ALTER TABLE public.revenue_transactions 
RENAME COLUMN stripe_charge_id TO lemon_squeezy_order_id;

ALTER TABLE public.revenue_transactions 
DROP COLUMN IF EXISTS stripe_payout_id;

-- 5. Developer Earnings
ALTER TABLE public.developer_earnings 
DROP COLUMN IF EXISTS stripe_payout_id;

-- 6. Payout Requests
ALTER TABLE public.payout_requests 
DROP COLUMN IF EXISTS stripe_payout_id;

ALTER TABLE public.payout_requests 
DROP COLUMN IF EXISTS stripe_arrival_date;

ALTER TABLE public.payout_requests 
ADD COLUMN IF NOT EXISTS payout_method TEXT,
ADD COLUMN IF NOT EXISTS transaction_reference TEXT; -- Manual transfer ref
