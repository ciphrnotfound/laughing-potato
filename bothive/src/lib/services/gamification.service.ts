/**
 * Gamification service for managing XP, levels, and achievements
 */

import { supabase } from "@/lib/supabase";

export interface UserGamification {
    user_id: string;
    level: number;
    xp: number;
    total_xp: number;
    streak_days: number;
    longest_streak: number;
    last_activity_date: string;
    bots_created: number;
    bots_deployed: number;
    total_executions: number;
    achievements_unlocked: number;
    created_at: string;
    updated_at: string;
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
    requirement: any;
    is_hidden: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    progress: any;
    unlocked_at: string;
    achievement?: Achievement;
}

export interface LeaderboardEntry {
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    level: number;
    total_xp: number;
    achievements_unlocked: number;
    bots_created: number;
    streak_days: number;
    rank: number;
}

export class GamificationService {
    /**
     * Get or create user gamification profile
     */
    static async getUserProfile(user_id: string): Promise<UserGamification> {
        const { data, error } = await supabase
            .from('user_gamification')
            .select('*')
            .eq('user_id', user_id)
            .single();

        if (error && error.code === 'PGRST116') {
            // Profile doesn't exist, create it
            const { data: newProfile, error: createError } = await supabase
                .from('user_gamification')
                .insert({
                    user_id,
                    level: 1,
                    xp: 0,
                    total_xp: 0,
                    streak_days: 0,
                    longest_streak: 0,
                    last_activity_date: new Date().toISOString().split('T')[0],
                })
                .select()
                .single();

            if (createError) throw createError;
            return newProfile as UserGamification;
        }

        if (error) throw error;
        return data as UserGamification;
    }

    /**
     * Award XP to a user
     */
    static async awardXP(user_id: string, xp_amount: number, reason?: string) {
        // Get current profile
        const profile = await this.getUserProfile(user_id);

        // Calculate new values
        const newXP = profile.xp + xp_amount;
        const newTotalXP = profile.total_xp + xp_amount;
        const newLevel = this.calculateLevel(newTotalXP);

        // Update profile
        const { data, error } = await supabase
            .from('user_gamification')
            .update({
                xp: newXP,
                total_xp: newTotalXP,
                level: newLevel,
                last_activity_date: new Date().toISOString().split('T')[0],
            })
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) throw error;

        // Check for level-up achievements
        if (newLevel > profile.level) {
            await this.checkLevelAchievements(user_id, newLevel);
        }

        return {
            profile: data as UserGamification,
            xp_awarded: xp_amount,
            level_up: newLevel > profile.level,
            new_level: newLevel,
            reason,
        };
    }

    /**
     * Calculate level from total XP
     * Formula: level = floor(sqrt(total_xp / 100)) + 1
     */
    static calculateLevel(total_xp: number): number {
        return Math.max(1, Math.floor(Math.sqrt(total_xp / 100)) + 1);
    }

    /**
     * Calculate XP required for next level
     */
    static getXPForNextLevel(current_level: number): number {
        return Math.pow(current_level, 2) * 100;
    }

    /**
     * Get all achievements
     */
    static async getAchievements(options?: {
        category?: string;
        tier?: string;
        include_hidden?: boolean;
    }) {
        let query = supabase
            .from('achievements')
            .select('*')
            .eq('is_active', true)
            .order('tier', { ascending: true });

        if (options?.category) {
            query = query.eq('category', options.category);
        }

        if (options?.tier) {
            query = query.eq('tier', options.tier);
        }

        if (!options?.include_hidden) {
            query = query.eq('is_hidden', false);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as Achievement[];
    }

    /**
     * Get user's unlocked achievements
     */
    static async getUserAchievements(user_id: string) {
        const { data, error } = await supabase
            .from('user_achievements')
            .select(`
        *,
        achievement:achievements(*)
      `)
            .eq('user_id', user_id)
            .order('unlocked_at', { ascending: false });

        if (error) throw error;
        return data as UserAchievement[];
    }

    /**
     * Check and unlock an achievement
     */
    static async unlockAchievement(user_id: string, achievement_slug: string) {
        const { data, error } = await supabase.rpc('check_and_unlock_achievement', {
            p_user_id: user_id,
            p_achievement_slug: achievement_slug,
        });

        if (error) throw error;
        return data; // Returns true if unlocked, false if already unlocked or doesn't exist
    }

    /**
     * Check level-based achievements
     */
    private static async checkLevelAchievements(user_id: string, level: number) {
        const levelAchievements = [
            { level: 5, slug: 'level-5-reached' },
            { level: 10, slug: 'level-10-reached' },
            { level: 20, slug: 'level-20-reached' },
            { level: 50, slug: 'level-50-reached' },
        ];

        for (const { level: reqLevel, slug } of levelAchievements) {
            if (level >= reqLevel) {
                await this.unlockAchievement(user_id, slug);
            }
        }
    }

    /**
     * Get leaderboard
     */
    static async getLeaderboard(limit: number = 100) {
        // Refresh materialized view first
        await supabase.rpc('refresh_leaderboard');

        const { data, error } = await supabase
            .from('leaderboard')
            .select('*')
            .limit(limit);

        if (error) throw error;
        return data as LeaderboardEntry[];
    }

    /**
     * Get user's leaderboard rank
     */
    static async getUserRank(user_id: string) {
        const { data, error } = await supabase
            .from('leaderboard')
            .select('rank')
            .eq('user_id', user_id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data?.rank || null;
    }

    /**
     * Update daily streak
     */
    static async updateStreak(user_id: string) {
        const profile = await this.getUserProfile(user_id);
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = profile.last_activity_date;

        // If already updated today, skip
        if (lastActivity === today) {
            return profile;
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreakDays: number;

        if (lastActivity === yesterdayStr) {
            // Consecutive day
            newStreakDays = profile.streak_days + 1;
        } else {
            // Streak broken
            newStreakDays = 1;
        }

        const longestStreak = Math.max(profile.longest_streak, newStreakDays);

        const { data, error } = await supabase
            .from('user_gamification')
            .update({
                streak_days: newStreakDays,
                longest_streak: longestStreak,
                last_activity_date: today,
            })
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) throw error;

        // Check streak achievements
        if (newStreakDays >= 7) {
            await this.unlockAchievement(user_id, 'week-streak');
        }
        if (newStreakDays >= 30) {
            await this.unlockAchievement(user_id, 'month-streak');
        }

        return data as UserGamification;
    }

    /**
     * Get achievement progress for a user
     */
    static async getAchievementProgress(user_id: string, achievement_slug: string) {
        const achievement = await supabase
            .from('achievements')
            .select('*')
            .eq('slug', achievement_slug)
            .single();

        if (achievement.error) throw achievement.error;

        const userAchievement = await supabase
            .from('user_achievements')
            .select('*')
            .eq('user_id', user_id)
            .eq('achievement_id', achievement.data.id)
            .single();

        if (userAchievement.data) {
            // Already unlocked
            return {
                achievement: achievement.data,
                unlocked: true,
                progress: 100,
                unlocked_at: userAchievement.data.unlocked_at,
            };
        }

        // Calculate progress based on requirement
        const requirement = achievement.data.requirement;
        let progress = 0;

        // This is simplified - you'd implement actual progress calculation
        // based on the requirement type and user's current stats

        return {
            achievement: achievement.data,
            unlocked: false,
            progress,
        };
    }
}
