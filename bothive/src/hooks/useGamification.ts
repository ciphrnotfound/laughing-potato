/**
 * React hooks for gamification features
 * Provides XP, achievements, and leaderboard data
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface UserGamification {
    user_id: string;
    level: number;
    xp: number;
    total_xp: number;
    streak_days: number;
    longest_streak: number;
    bots_created: number;
    bots_deployed: number;
    total_executions: number;
    achievements_unlocked: number;
}

export interface Achievement {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    icon_url: string | null;
    category: 'creation' | 'deployment' | 'execution' | 'social' | 'milestone' | 'special';
    xp_reward: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
    achievement?: Achievement;
}

/**
 * Hook to fetch user's gamification profile
 */
export function useGamification(userId?: string) {
    const [profile, setProfile] = useState<UserGamification | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [progress, setProgress] = useState({
        current_xp: 0,
        xp_to_next_level: 100,
        percentage: 0,
    });
    const [rank, setRank] = useState<number | null>(null);

    useEffect(() => {
        fetchGamification();
    }, [userId]);

    const fetchGamification = async () => {
        try {
            setLoading(true);
            const params = userId ? `?user_id=${userId}` : '';
            const response = await fetch(`/api/gamification${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch gamification data');
            }

            const data = await response.json();
            setProfile(data.profile);
            setProgress(data.progress);
            setRank(data.rank);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const awardXP = async (xp_amount: number, reason?: string) => {
        try {
            const response = await fetch('/api/gamification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xp_amount, reason }),
            });

            if (!response.ok) {
                throw new Error('Failed to award XP');
            }

            const data = await response.json();
            await fetchGamification(); // Refresh profile
            return data;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    };

    return {
        profile,
        progress,
        rank,
        loading,
        error,
        refetch: fetchGamification,
        awardXP,
    };
}

/**
 * Hook to fetch achievements
 */
export function useAchievements(userId?: string) {
    const [achievements, setAchievements] = useState<Achievement[] | UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchAchievements();
    }, [userId]);

    const fetchAchievements = async () => {
        try {
            setLoading(true);
            const params = userId ? `?user_id=${userId}` : '';
            const response = await fetch(`/api/achievements${params}`);

            if (!response.ok) {
                throw new Error('Failed to fetch achievements');
            }

            const data = await response.json();
            setAchievements(data.achievements);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const unlockAchievement = async (achievement_slug: string) => {
        try {
            const response = await fetch('/api/achievements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ achievement_slug }),
            });

            if (!response.ok) {
                throw new Error('Failed to unlock achievement');
            }

            const data = await response.json();
            await fetchAchievements(); // Refresh list
            return data;
        } catch (err) {
            throw err instanceof Error ? err : new Error('Unknown error');
        }
    };

    return {
        achievements,
        loading,
        error,
        refetch: fetchAchievements,
        unlockAchievement,
    };
}

/**
 * Hook to fetch leaderboard
 */
export function useLeaderboard(limit: number = 100) {
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [userRank, setUserRank] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        fetchLeaderboard();
    }, [limit]);

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/leaderboard?limit=${limit}`);

            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard');
            }

            const data = await response.json();
            setLeaderboard(data.leaderboard);
            setUserRank(data.user_rank);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return {
        leaderboard,
        userRank,
        loading,
        error,
        refetch: fetchLeaderboard,
    };
}

/**
 * Hook to subscribe to real-time gamification updates
 */
export function useRealtimeGamification(userId: string) {
    const { profile, loading, error, refetch } = useGamification(userId);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    useEffect(() => {
        if (!userId) return;

        // Subscribe to real-time changes
        const channel = supabase
            .channel('gamification-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_gamification',
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log('Gamification update:', payload);
                    setLastUpdate(new Date());
                    refetch();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, refetch]);

    return { profile, loading, error, lastUpdate, refetch };
}
