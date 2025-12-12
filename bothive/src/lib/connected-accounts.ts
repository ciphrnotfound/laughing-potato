import { supabase } from "@/lib/supabase";

export interface ConnectedAccount {
    id: string;
    userId: string;
    provider: string;
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt?: string;
    updatedAt?: string;
}

export async function getConnectedAccount(userId: string, provider: string): Promise<ConnectedAccount | null> {
    try {
        const { data, error } = await supabase
            .from("connected_accounts")
            .select("id, user_id, provider, access_token, refresh_token, expires_at, metadata, created_at, updated_at")
            .eq("user_id", userId)
            .eq("provider", provider)
            .maybeSingle();

        if (error) {
            console.error("Failed to load connected account", error);
            return null;
        }

        if (!data) {
            return null;
        }

        return {
            id: data.id as string,
            userId: data.user_id as string,
            provider: data.provider as string,
            accessToken: data.access_token as string,
            refreshToken: (data.refresh_token as string | null) ?? null,
            expiresAt: (data.expires_at as string | null) ?? null,
            metadata: (data.metadata as Record<string, unknown> | null) ?? null,
            createdAt: data.created_at as string | undefined,
            updatedAt: data.updated_at as string | undefined,
        } satisfies ConnectedAccount;
    } catch (error) {
        console.error("Unexpected error while fetching connected account", error);
        return null;
    }
}
