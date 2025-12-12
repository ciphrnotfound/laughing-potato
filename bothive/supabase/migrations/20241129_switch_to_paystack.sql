-- Update schema for Paystack
-- Rename Lemon Squeezy columns to Paystack specific names

-- 1. User Subscriptions
ALTER TABLE public.user_subscriptions 
RENAME COLUMN lemon_squeezy_customer_id TO paystack_customer_code;

ALTER TABLE public.user_subscriptions 
RENAME COLUMN lemon_squeezy_subscription_id TO paystack_subscription_code;

ALTER TABLE public.user_subscriptions 
RENAME COLUMN lemon_squeezy_variant_id TO paystack_plan_code;

-- 2. Marketplace Integrations
ALTER TABLE public.marketplace_integrations 
RENAME COLUMN lemon_squeezy_variant_id TO paystack_plan_code;

ALTER TABLE public.marketplace_integrations 
RENAME COLUMN lemon_squeezy_product_id TO paystack_product_id; -- Optional, mostly plan_code used

-- 3. User Purchases
ALTER TABLE public.user_integration_purchases 
RENAME COLUMN lemon_squeezy_order_id TO paystack_reference;

ALTER TABLE public.user_integration_purchases 
RENAME COLUMN lemon_squeezy_subscription_id TO paystack_subscription_code;

-- 4. Revenue Transactions
ALTER TABLE public.revenue_transactions 
RENAME COLUMN lemon_squeezy_order_id TO paystack_reference;
