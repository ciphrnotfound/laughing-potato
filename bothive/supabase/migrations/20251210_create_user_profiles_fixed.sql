-- Create user_profiles table if it doesn't exist (re-runnable)
create table if not exists public.user_profiles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null unique,
    first_name text,
    last_name text,
    team_name text,
    preferred_name text,
    role text, -- 'business', 'developer', 'student', etc.
    use_case text,
    agent_style text, -- 'technical', 'balanced', 'playful'
    onboarding_completed boolean default false,
    onboarding_completed_at timestamptz,
    created_at timestamptz default timezone('utc'::text, now()) not null,
    updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Policies (safe creation)
do $$ 
begin
    if not exists (select 1 from pg_policies where tablename = 'user_profiles' and policyname = 'Users can view their own profile') then
        create policy "Users can view their own profile" on public.user_profiles for select using (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where tablename = 'user_profiles' and policyname = 'Users can update their own profile') then
        create policy "Users can update their own profile" on public.user_profiles for update using (auth.uid() = user_id);
    end if;

    if not exists (select 1 from pg_policies where tablename = 'user_profiles' and policyname = 'Users can insert their own profile') then
        create policy "Users can insert their own profile" on public.user_profiles for insert with check (auth.uid() = user_id);
    end if;
end $$;

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists on_profile_updated on public.user_profiles;
create trigger on_profile_updated before update on public.user_profiles
    for each row execute procedure public.handle_updated_at();

-- Grant access
grant usage on schema public to anon, authenticated;
grant all on public.user_profiles to anon, authenticated;
