
/**
 * Supabase-based Shared Memory for bot execution
 * Allows tools to communicate and share data during bot runs with persistence
 */

import { createClient } from "@supabase/supabase-js";

let supabase: any = null;

function getSupabaseClient() {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables for shared memory");
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export interface SharedMemory {
  data: Record<string, any>;
  set(key: string, value: any): Promise<void>;
  get(key: string): Promise<any>;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  keys(): string[];
  values(): any[];
  entries(): [string, any][];
  append(key: string, value: any): Promise<void>;
}

/**
 * Create a new Supabase-based shared memory instance
 */
export function createSupabaseSharedMemory(namespace: string = 'default'): SharedMemory {
  const localCache: Record<string, any> = {};
  const tableName = 'workforce_shared_memory';

  return {
    data: localCache,
    
    async set(key: string, value: any) {
      const serializedValue = JSON.stringify(value);
      localCache[key] = value;
      
      try {
        const client = getSupabaseClient();
        const { error } = await client
          .from(tableName)
          .upsert({
            namespace,
            key,
            value: serializedValue,
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Failed to set shared memory value:', error);
          // If table doesn't exist, log a warning - migration should handle table creation
          if (error.code === 'PGRST116') {
            console.warn('Shared memory table not found. Please run migrations to create the workforce_shared_memory table.');
          }
        }
      } catch (err) {
        console.error('Error setting shared memory value:', err);
      }
    },
    
    async get(key: string) {
      // Check local cache first
      if (key in localCache) {
        return localCache[key];
      }
      
      try {
        // Fetch from Supabase
        const client = getSupabaseClient();
        const { data, error } = await client
          .from(tableName)
          .select('value')
          .eq('namespace', namespace)
          .eq('key', key)
          .single();
        
        if (error || !data) {
          return undefined;
        }
        
        const parsedValue = JSON.parse(data.value);
        localCache[key] = parsedValue;
        return parsedValue;
      } catch (err) {
        console.error('Failed to get shared memory value:', err);
        return undefined;
      }
    },
    
    has(key: string) {
      return key in localCache;
    },
    
    delete(key: string) {
      const existed = key in localCache;
      delete localCache[key];
      
      // Also delete from Supabase
      const client = getSupabaseClient();
      client
        .from(tableName)
        .delete()
        .eq('namespace', namespace)
        .eq('key', key);
      
      return existed;
    },
    
    clear() {
      Object.keys(localCache).forEach(key => delete localCache[key]);
      
      // Clear from Supabase
      const client = getSupabaseClient();
      client
        .from(tableName)
        .delete()
        .eq('namespace', namespace);
    },
    
    keys() {
      return Object.keys(localCache);
    },
    
    values() {
      return Object.values(localCache);
    },
    
    entries() {
      return Object.entries(localCache);
    },
    
    async append(key: string, value: any) {
      const existing = await this.get(key) || [];
      const newArray = Array.isArray(existing) ? [...existing, value] : [existing, value];
      await this.set(key, newArray);
    },
  };
}

/**
 * Migration to create the shared memory table
 */
export const createSharedMemoryMigration = `
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
`;