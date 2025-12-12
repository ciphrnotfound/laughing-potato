-- Migration: Beta 1 Storage Updates
-- Description: Adds tables for automation tasks and updates agents table to support skills/memory keys

-- 1. Automation Tasks Table
create table if not exists public.automation_tasks (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    title text not null,
    status text not null check (status in ('open', 'done')),
    due_date timestamptz,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS for tasks
alter table public.automation_tasks enable row level security;

create policy "Users can view their own tasks"
    on public.automation_tasks for select
    using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
    on public.automation_tasks for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
    on public.automation_tasks for update
    using (auth.uid() = user_id);

create policy "Users can delete their own tasks"
    on public.automation_tasks for delete
    using (auth.uid() = user_id);

-- 2. Update Agents Table (if exists, add columns)
-- Using 'do' block to safely add columns if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'agents' and column_name = 'skills') then
        alter table public.agents add column skills jsonb default '[]'::jsonb;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'agents' and column_name = 'memory_keys') then
        alter table public.agents add column memory_keys jsonb default '[]'::jsonb;
    end if;
end $$;

-- 3. Memories Table (Simple text storage for now, Vector later)
create table if not exists public.memories (
    id uuid not null primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    agent_id uuid references public.agents(id),
    content text not null,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);

alter table public.memories enable row level security;

create policy "Users can view their own memories"
    on public.memories for select
    using (auth.uid() = user_id);

create policy "Users can insert their own memories"
    on public.memories for insert
    with check (auth.uid() = user_id);
