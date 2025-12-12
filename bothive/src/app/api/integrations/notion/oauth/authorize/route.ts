import { NextRequest, NextResponse } from "next/server";

// GET /api/integrations/notion/oauth/authorize - Redirect to Notion OAuth
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");

        if (!userId) {
            return NextResponse.json({ error: "user_id is required" }, { status: 400 });
        }

        const notionClientId = process.env.NOTION_CLIENT_ID;
        const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/notion/oauth/callback`;

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
