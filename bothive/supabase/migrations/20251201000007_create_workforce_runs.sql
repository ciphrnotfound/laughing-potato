create table if not exists public.workforce_runs (
    id text primary key,
    user_id uuid,
    request text not null,
    result jsonb,
    status text default 'completed',
    created_at timestamptz default timezone('utc', now())
);

alter table public.workforce_runs enable row level security;

create policy "workforce runs readable by owner" on public.workforce_runs
    for select
    using (auth.uid() = user_id);

create policy "workforce runs insert" on public.workforce_runs
    for insert
    with check (true);
