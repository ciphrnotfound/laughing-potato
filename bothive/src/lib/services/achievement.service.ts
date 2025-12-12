import { supabase } from '@/lib/supabase';

export interface Achievement {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    category: string;
    requirements: any;
    created_at: string;
}

export interface UserAchievement {
    id: string;
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
    achievement: Achievement;
}

export class AchievementService {
    /**
     * Get all achievements
     */
    static async getAllAchievements(): Promise<Achievement[]> {
        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .order('tier', { ascending: true });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get user's unlocked achievements
     */
    static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        const { data, error } = await supabase
            .from('user_achievements')
            .select(`
        *,
        achievement:achievements(*)
      `)
            .eq('user_id', userId)
            .order('unlocked_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Check and unlock achievement
     */
    static async checkAndUnlock(userId: string, achievementSlug: string): Promise<boolean> {
        const { data, error } = await supabase.rpc('check_and_unlock_achievement', {
            p_user_id: userId,
            p_achievement_slug: achievementSlug,
        });

        if (error) {
            console.error('Error unlocking achievement:', error);
            return false;
        }

        return data || false;
    }

    /**
     * Get achievement progress
     */
    static async getProgress(userId: string): Promise<{
        total: number;
        unlocked: number;
        percentage: number;
    }> {
        const [allAchievements, userAchievements] = await Promise.all([
            this.getAllAchievements(),
            this.getUserAchievements(userId),
        ]);

        const total = allAchievements.length;
        const unlocked = userAchievements.length;
        const percentage = total > 0 ? (unlocked / total) * 100 : 0;

        return { total, unlocked, percentage };
    }
}
