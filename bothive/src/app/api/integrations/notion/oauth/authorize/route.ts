import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";

// GET /api/integrations/notion/oauth/authorize - Redirect to Notion OAuth
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id") || searchParams.get("state");

        if (!userId) {
            return NextResponse.json({ error: "user_id or state is required" }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const redirectUri = `${appUrl}/api/integrations/notion/oauth/callback`;

        // 1. Fetch integration and secrets from DB
        const supabase = createRouteHandlerClient<Database>({ cookies });
        const { data: integration } = await supabase
            .from("integrations")
            .select("id, slug")
            .eq("slug", "notion")
            .single();

        let notionClientId = process.env.NOTION_CLIENT_ID;

        if (integration) {
            const { data: secrets } = await supabase
                .from("integration_secrets")
                .select("key, value")
                .eq("integration_id", integration.id);

            const dbClientId = secrets?.find((s: any) => s.key === "CLIENT_ID")?.value;
            if (dbClientId) notionClientId = dbClientId;
        }

        if (!notionClientId) {
            return NextResponse.json(
                { error: "Notion OAuth not configured" },
                { status: 500 }
            );
        }

        // Build Notion OAuth URL
        const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
        authUrl.searchParams.set("client_id", notionClientId);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("owner", "user");
        authUrl.searchParams.set("redirect_uri", redirectUri);
        authUrl.searchParams.set("state", userId); // Pass user_id as state

        // Redirect to Notion
        return NextResponse.redirect(authUrl.toString());
    } catch (error: any) {
        console.error("Error initiating Notion OAuth:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
