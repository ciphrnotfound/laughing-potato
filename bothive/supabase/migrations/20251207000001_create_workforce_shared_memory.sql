

create table if not exists public.workforce_shared_memory (
    id uuid primary key default gen_random_uuid(),
    namespace text not null,
    key text not null,
    value text not null,
    updated_at timestamptz default timezone('utc', now()),
    unique(namespace, key)
);

-- Create index for faster lookups
create index if not exists idx_workforce_shared_memory_namespace_key 
    on public.workforce_shared_memory(namespace, key);

-- Enable RLS
alter table public.workforce_shared_memory enable row level security;

-- Create policies
create policy "workforce shared memory readable by all" on public.workforce_shared_memory
    for select
    using (true);

create policy "workforce shared memory writable by all" on public.workforce_shared_memory
    for all
    using (true);

-- Create function to initialize table
create or replace function create_workforce_shared_memory_table()
returns void as $$
begin
    -- Table creation is handled by the migration above
    -- This function exists for compatibility
end;
$$ language plpgsql;