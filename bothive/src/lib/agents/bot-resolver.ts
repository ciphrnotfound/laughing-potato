import { supabase } from "@/lib/supabase";

/**
 * Bot Resolver - Fetch bots by name for composition
 */

export interface BotReference {
    id: string;
    name: string;
    hivelang_code: string;
    description?: string;
    user_id: string;
}

/**
 * Resolve a bot by name for the current user
 */
export async function resolveBot(
    botName: string,
    userId: string
): Promise<BotReference | null> {
    try {
        const { data: bot, error } = await supabase
            .from("bots")
            .select("id, name, hivelang_code, description, user_id")
            .eq("name", botName)
            .eq("user_id", userId)
            .single();

        if (error || !bot) {
            console.error(`Bot not found: ${botName} for user ${userId}`, error);
            return null;
        }

        return bot as BotReference;
    } catch (error) {
        console.error("Error resolving bot:", error);
        return null;
    }
}

/**
 * Resolve a bot by ID (for direct execution)
 */
export async function resolveBotById(
    botId: string,
    userId: string
): Promise<BotReference | null> {
    try {
        const { data: bot, error } = await supabase
            .from("bots")
            .select("id, name, hivelang_code, description, user_id")
            .eq("id", botId)
            .eq("user_id", userId)
            .single();

        if (error || !bot) {
            console.error(`Bot not found: ${botId}`, error);
            return null;
        }

        return bot as BotReference;
    } catch (error) {
        console.error("Error resolving bot by ID:", error);
        return null;
    }
}

/**
 * List all bots for a user (for dashboard)
 */
export async function getUserBots(userId: string): Promise<BotReference[]> {
    try {
        const { data: bots, error } = await supabase
            .from("bots")
            .select("id, name, hivelang_code, description, user_id")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching user bots:", error);
            return [];
        }

        return (bots || []) as BotReference[];
    } catch (error) {
        console.error("Error in getUserBots:", error);
        return [];
    }
}
