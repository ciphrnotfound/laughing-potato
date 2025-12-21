import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/v1/agents
 * Example of a public-facing API route secured by API keys.
 */
export async function GET(req: NextRequest) {
    try {
        // 1. Verify API Key
        const { user_id, error } = await verifyApiKey(req);

        if (error || !user_id) {
            return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch Agents for this user
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data: agents, error: dbError } = await supabaseAdmin
            .from("bots") // 'bots' is the underlying table for agents
            .select("id, name, slug, description, status, created_at")
            .eq("user_id", user_id);

        if (dbError) {
            console.error("Database error:", dbError);
            return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: agents || [],
            metadata: {
                count: (agents || []).length,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error: any) {
        console.error("API v1 error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
