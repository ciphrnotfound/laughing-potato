-- Fix RLS policy for user_subscriptions
-- Add missing INSERT policy

CREATE POLICY "Users can insert own subscription" ON public.user_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
