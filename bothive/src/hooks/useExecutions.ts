/**
 * React hooks for bot executions
 * Provides execution history and real-time status
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface BotExecution {
    id: string;
    bot_id: string;
    user_id: string | null;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
    input_data: any;
    output_data: any;
    error_data: any;
    execution_time_ms: number | null;
    tokens_used: number;
    estimated_cost_usd: number | null;
    created_at: string;
    completed_at: string | null;
}

/**
 * Hook to execute a bot
 */
export function useExecuteBot() {
    const [executing, setExecuting] = useState(false);
    const [execution, setExecution] = useState<BotExecution | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const execute = async (botId: string, inputData?: any) => {
        try {
            setExecuting(true);
            setError(null);

            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bot_id: botId,
                    input_data: inputData,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to execute bot');
            }

            const data = await response.json();
            setExecution(data.execution);
            return data.execution;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            throw error;
        } finally {
            setExecuting(false);
        }
    };

    return { execute, executing, execution, error };
}

/**
 * Hook to fetch execution details
 */
export function useExecution(executionId: string | null) {
    const [execution, setExecution] = useState<BotExecution | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!executionId) {
            setExecution(null);
            return;
        }

        fetchExecution();
    }, [executionId]);

    const fetchExecution = async () => {
        if (!executionId) return;

        try {
            setLoading(true);
            const response = await fetch(`/api/execute?id=${executionId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch execution');
            }

            const data = await response.json();
            setExecution(data.execution);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return { execution, loading, error, refetch: fetchExecution };
}

/**
 * Hook to fetch recent executions
 */
export function useRecentExecutions(limit: number = 10) {
    const [executions, setExecutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchExecutions();
    }, [limit]);

    const fetchExecutions = async () => {
        try {
            setLoading(true);
            const { data, error: supabaseError } = await supabase
                .from('bot_executions')
                .select('*, bots(name, slug)')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (supabaseError) throw supabaseError;

            setExecutions(data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return { executions, loading, error, refetch: fetchExecutions };
}

/**
 * Hook to subscribe to real-time execution updates
 */
export function useRealtimeExecution(executionId: string | null) {
    const { execution, loading, error, refetch } = useExecution(executionId);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        if (!executionId) return;

        // Subscribe to real-time changes for this execution
        const channel = supabase
            .channel(`execution-${executionId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bot_executions',
                    filter: `id=eq.${executionId}`,
                },
                (payload) => {
                    console.log('Execution update:', payload);
                    setLastUpdate(new Date());
                    refetch();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [executionId, refetch]);

    return { execution, loading, error, lastUpdate, refetch };
}

/**
 * Hook to subscribe to all executions in real-time
 */
export function useRealtimeExecutions(limit: number = 10) {
    const { executions, loading, error, refetch } = useRecentExecutions(limit);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        // Subscribe to real-time changes
        const channel = supabase
            .channel('executions-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'bot_executions',
                },
                (payload) => {
                    console.log('Executions update:', payload);
                    setLastUpdate(new Date());
                    refetch();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refetch]);

    return { executions, loading, error, lastUpdate, refetch };
}
