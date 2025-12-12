/**
 * React hooks for bot management
 * Provides real-time data from the API
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Bot {
    id: string;
    user_id: string;
    workspace_id: string | null;
    name: string;
    description: string | null;
    slug: string;
    icon_url: string | null;
    tags: string[];
    category: string;
    deployment_status: 'draft' | 'deploying' | 'active' | 'paused' | 'failed' | 'archived';
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    avg_execution_time_ms: number | null;
    is_public: boolean;
    rating: number | null;
    created_at: string;
    updated_at: string;
}

/**
 * Hook to fetch all bots
 */
export function useBots(options?: {
    category?: string;
    is_public?: boolean;
    limit?: number;
}) {
    const [bots, setBots] = useState<Bot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchBots();
    }, [options?.category, options?.is_public, options?.limit]);

    const fetchBots = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            if (options?.category) params.append('category', options.category);
            if (options?.is_public !== undefined) params.append('is_public', String(options.is_public));
            if (options?.limit) params.append('limit', String(options.limit));

            const response = await fetch(`/api/bots?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch bots');
            }

            const data = await response.json();
            setBots(data.bots);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const createBot = async (botData: {
        name: string;
        code: string;
        description?: string;
        category?: string;
        tags?: string[];
        icon_url?: string;
    }) => {
        try {
            const response = await fetch('/api/bots', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(botData),
            });

            if (!response.ok) {
                throw new Error('Failed to create bot');
            }

            const data = await response.json();
            await fetchBots(); // Refresh list
            return data.bot;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    };

    const updateBot = async (id: string, updates: Partial<Bot>) => {
        try {
            const response = await fetch('/api/bots', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updates }),
            });

            if (!response.ok) {
                throw new Error('Failed to update bot');
            }

            const data = await response.json();
            await fetchBots(); // Refresh list
            return data.bot;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    };

    const deleteBot = async (id: string) => {
        try {
            const response = await fetch('/api/bots', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete bot');
            }

            await fetchBots(); // Refresh list
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    };

    return {
        bots,
        loading,
        error,
        refetch: fetchBots,
        createBot,
        updateBot,
        deleteBot,
    };
}

/**
 * Hook to fetch a single bot by ID
 */
export function useBot(botId: string | null) {
    const [bot, setBot] = useState<Bot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!botId) {
            setBot(null);
            setLoading(false);
            return;
        }

        fetchBot();
    }, [botId]);

    const fetchBot = async () => {
        if (!botId) return;

        try {
            setLoading(true);
            const { data, error: supabaseError } = await supabase
                .from('bots')
                .select('*')
                .eq('id', botId)
                .single();

            if (supabaseError) throw supabaseError;

            setBot(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return { bot, loading, error, refetch: fetchBot };
}

/**
 * Hook to subscribe to real-time bot updates
 */
export function useRealtimeBots() {
    const { bots, loading, error, refetch } = useBots();
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        // Subscribe to real-time changes
        const channel = supabase
            .channel('bots-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bots',
                },
                (payload) => {
                    console.log('Bot change detected:', payload);
                    setLastUpdate(new Date());
                    refetch();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refetch]);

    return { bots, loading, error, lastUpdate, refetch };
}
