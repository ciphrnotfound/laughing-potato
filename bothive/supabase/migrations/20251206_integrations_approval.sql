
-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('communication', 'productivity', 'development', 'analytics', 'payment', 'storage', 'ai', 'other')),
  type TEXT NOT NULL CHECK (type IN ('oauth', 'api_key', 'webhook', 'custom')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
  icon_url TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  pricing_model TEXT DEFAULT 'free' CHECK (pricing_model IN ('free', 'paid', 'freemium')),
  documentation_url TEXT,
  setup_time TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Integrations are viewable by everyone if active" 
ON public.integrations FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can insert their own integrations" 
ON public.integrations FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own pending integrations" 
ON public.integrations FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view and update all integrations" 
ON public.integrations FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);
