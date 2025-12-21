import { NextRequest, NextResponse } from "next/server";
import { verifyApiKey } from "@/lib/auth-utils";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/cli/publish
 * Allows CLI to publish a new bot/agent.
 */
export async function POST(req: NextRequest) {
    try {
        const { user_id, error } = await verifyApiKey(req);

        if (error || !user_id) {
            return NextResponse.json({ error: "Unauthorized CLI Access" }, { status: 401 });
        }

        const body = await req.json();
        const { name, slug, description, hivelang, version } = body;

        if (!name || !hivelang) {
            return NextResponse.json({ error: "Missing required fields: name, hivelang" }, { status: 400 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Check if slug exists or update existing
        const { data: existingBot } = await supabaseAdmin
            .from("bots")
            .select("id")
            .eq("slug", slug)
            .eq("user_id", user_id)
            .single();

        let result;
        if (existingBot) {
            result = await supabaseAdmin
                .from("bots")
                .update({
                    name,
                    description,
                    hivelang_code: hivelang,
                    updated_at: new Date().toISOString()
                })
                .eq("id", existingBot.id);
        } else {
            result = await supabaseAdmin
                .from("bots")
                .insert({
                    user_id,
                    name,
                    slug: slug || name.toLowerCase().replace(/ /g, '-'),
                    description,
                    hivelang_code: hivelang,
                    status: 'active'
                });
        }

        if (result.error) throw result.error;

        return NextResponse.json({
            success: true,
            message: `Successfully published ${name}@${version || 'latest'}`,
            url: `https://bothive.ai/dashboard/bots/${slug}`
        });

    } catch (e: any) {
        console.error("CLI Publish error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
