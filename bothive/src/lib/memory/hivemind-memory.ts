import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role to bypass RLS for now, or we can pass the user's client
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

export class HiveMindMemory {
    /**
     * Store a memory for a specific user
     */
    static async remember(userId: string, key: string, value: string, tags: string[] = []) {
        try {
            const { error } = await adminClient
                .from('user_memories')
                .upsert({
                    user_id: userId,
                    memory_key: key,
                    memory_value: value,
                    context_tags: tags,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, memory_key' });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('[HiveMindMemory] Remember failed:', error);
            return false;
        }
    }

    /**
     * Recall a specific memory
     */
    static async recall(userId: string, key: string): Promise<string | null> {
        try {
            const { data, error } = await adminClient
                .from('user_memories')
                .select('memory_value')
                .eq('user_id', userId)
                .eq('memory_key', key)
                .single();

            if (error || !data) return null;
            return data.memory_value;
        } catch (error) {
            console.error('[HiveMindMemory] Recall failed:', error);
            return null;
        }
    }

    /**
     * Recall all memories for a user (to inject into context)
     */
    static async recallAll(userId: string): Promise<Record<string, string>> {
        try {
            const { data, error } = await adminClient
                .from('user_memories')
                .select('memory_key, memory_value')
                .eq('user_id', userId);

            if (error || !data) return {};

            return data.reduce((acc, curr) => ({
                ...acc,
                [curr.memory_key]: curr.memory_value
            }), {});
        } catch (error) {
            console.error('[HiveMindMemory] Recall all failed:', error);
            return {};
        }
    }

    /**
     * Forget a memory
     */
    static async forget(userId: string, key: string) {
        try {
            await adminClient
                .from('user_memories')
                .delete()
                .eq('user_id', userId)
                .eq('memory_key', key);
            return true;
        } catch (error) {
            return false;
        }
    }
}
