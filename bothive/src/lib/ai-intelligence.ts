/**
 * AI Intelligence Module
 * Learns from user interactions to improve response quality over time
 */

import { supabase } from "@/lib/supabase";

export interface InteractionData {
    message: string;
    response: string;
    intent?: any;
    userFeedback: 'positive' | 'negative' | 'neutral';
    rating?: number;
    resolutionTime: number;
}

export class AIIntelligence {
    /**
     * Learn from a user interaction
     */
    async learnFromInteraction(userId: string, data: InteractionData) {
        try {
            // Store learning data
            await supabase.from('ai_learning_data').insert({
                user_id: userId,
                message: data.message,
                response: data.response,
                intent_data: data.intent,
                user_feedback: data.userFeedback,
                rating: data.rating,
                resolution_time: data.resolutionTime,
                timestamp: new Date().toISOString(),
            });

            // Update user learning profile
            await this.updateLearningProfile(userId, data);

            return { success: true };
        } catch (error) {
            console.error('Error learning from interaction:', error);
            return { success: false, error };
        }
    }

    /**
     * Update user's learning profile with new insights
     */
    private async updateLearningProfile(userId: string, data: InteractionData) {
        const { data: profile } = await supabase
            .from('user_learning_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!profile) {
            // Create new profile
            await supabase.from('user_learning_profiles').insert({
                user_id: userId,
                total_interactions: 1,
                positive_interactions: data.userFeedback === 'positive' ? 1 : 0,
                negative_interactions: data.userFeedback === 'negative' ? 1 : 0,
                average_resolution_time: data.resolutionTime,
                average_rating: data.rating || 0,
                preferred_response_style: 'detailed', // Default
                common_intents: data.intent ? [data.intent] : [],
            });
        } else {
            // Update existing profile
            const totalInteractions = profile.total_interactions + 1;
            const positiveInteractions = profile.positive_interactions + (data.userFeedback === 'positive' ? 1 : 0);
            const negativeInteractions = profile.negative_interactions + (data.userFeedback === 'negative' ? 1 : 0);

            // Calculate rolling average resolution time
            const avgResolutionTime =
                (profile.average_resolution_time * profile.total_interactions + data.resolutionTime) /
                totalInteractions;

            // Calculate rolling average rating
            const avgRating =
                (profile.average_rating * profile.total_interactions + (data.rating || 0)) /
                totalInteractions;

            await supabase
                .from('user_learning_profiles')
                .update({
                    total_interactions: totalInteractions,
                    positive_interactions: positiveInteractions,
                    negative_interactions: negativeInteractions,
                    average_resolution_time: avgResolutionTime,
                    average_rating: avgRating,
                    last_interaction_at: new Date().toISOString(),
                })
                .eq('user_id', userId);
        }
    }

    /**
     * Get personalized response suggestions based on learning data
     */
    async getPersonalizedSuggestions(userId: string, intent: string) {
        const { data: profile } = await supabase
            .from('user_learning_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (!profile) {
            return { suggestions: [], responseStyle: 'detailed' };
        }

        // Get similar successful interactions
        const { data: similarInteractions } = await supabase
            .from('ai_learning_data')
            .select('*')
            .eq('user_id', userId)
            .eq('user_feedback', 'positive')
            .gte('rating', 4)
            .order('timestamp', { ascending: false })
            .limit(5);

        return {
            suggestions: similarInteractions || [],
            responseStyle: profile.preferred_response_style,
            avgSatisfaction: profile.average_rating,
        };
    }

    /**
     * Get learning insights for analytics
     */
    async getLearningInsights(userId: string) {
        const { data: profile } = await supabase
            .from('user_learning_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        const { data: recentFeedback } = await supabase
            .from('ai_feedback')
            .select('feedback, rating, timestamp')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false })
            .limit(20);

        if (!profile) {
            return {
                hasData: false,
                totalInteractions: 0,
                satisfactionRate: 0,
            };
        }

        const satisfactionRate = profile.total_interactions > 0
            ? (profile.positive_interactions / profile.total_interactions) * 100
            : 0;

        return {
            hasData: true,
            totalInteractions: profile.total_interactions,
            satisfactionRate: Math.round(satisfactionRate),
            averageRating: Math.round(profile.average_rating * 10) / 10,
            averageResolutionTime: Math.round(profile.average_resolution_time),
            recentFeedback: recentFeedback || [],
            preferredStyle: profile.preferred_response_style,
        };
    }
}

// Export singleton instance
export const aiIntelligence = new AIIntelligence();
