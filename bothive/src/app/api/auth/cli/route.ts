import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/auth/cli
 * Validates an API key and returns CLI configuration for the user.
 * This is what 'bothive login' hits.
 */
export async function POST(req: NextRequest) {
    try {
        const { user_id, error } = await verifyApiKey(req);

        if (error || !user_id) {
            return NextResponse.json({
                success: false,
                error: "Invalid API Key. Please get a new key from https://bothive.ai/dashboard/developer/api-keys"
            }, { status: 401 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data: profile } = await supabaseAdmin
            .from("user_profiles")
            .select("full_name, role")
            .eq("user_id", user_id)
            .single();

        return NextResponse.json({
            success: true,
            user: {
                id: user_id,
                name: profile?.full_name || "Developer",
                role: profile?.role || "developer"
            },
            config: {
                registry: "https://registry.bothive.ai",
                telemetry: true
            }
        });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
