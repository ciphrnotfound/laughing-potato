import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment variables are not fully configured. API calls will fail until they are set.");
}

let cachedClient: SupabaseClient | null = null;

function ensureClient(): SupabaseClient {
  if (!cachedClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase environment variables are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY or their server equivalents."
      );
    }
    cachedClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return cachedClient;
}

export function getSupabaseClient(): SupabaseClient {
  return ensureClient();
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = ensureClient();
    const value = Reflect.get(client as unknown as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
