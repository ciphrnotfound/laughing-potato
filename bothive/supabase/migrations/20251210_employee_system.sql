-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'staff', -- 'manager', 'developer', 'support', 'staff'
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'on_leave'
  avatar_url TEXT,
  hourly_rate NUMERIC DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Policies for employees
CREATE POLICY "Users can manage their own employees"
  ON public.employees
  FOR ALL
  USING (auth.uid() = owner_id);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.employee_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  related_bot_id UUID, -- Optional link to a bot for context
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'done'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.employee_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for tasks
CREATE POLICY "Users can manage tasks for their employees"
  ON public.employee_tasks
  FOR ALL
  USING (auth.uid() = owner_id);

-- Create messages table (simple internal messaging)
CREATE TABLE IF NOT EXISTS public.employee_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recipient_employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE, -- If null, it's a broadcast or note
  sender_type TEXT DEFAULT 'owner', -- 'owner' or 'employee' (for future expansion)
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.employee_messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can manage messages"
  ON public.employee_messages
  FOR ALL
  USING (auth.uid() = owner_id);

-- Add real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.employees;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.employee_messages;
