import { createClient } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Verifies an API key from the request headers.
 * Looks for 'x-api-key' or 'Authorization: Bearer <key>'
 */
export async function verifyApiKey(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key") ||
        req.headers.get("Authorization")?.replace("Bearer ", "");

    if (!apiKey) {
        return { user: null, error: "Missing API Key" };
    }

    // Initialize admin client to query api_keys table
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: keyData, error } = await supabaseAdmin
        .from("api_keys")
        .select("user_id")
        .eq("key", apiKey)
        .single();

    if (error || !keyData) {
        return { user: null, error: "Invalid API Key" };
    }

    // Update last_used_at timestamp
    await supabaseAdmin
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("key", apiKey);

    return { user_id: keyData.user_id, error: null };
}
