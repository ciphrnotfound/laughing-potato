import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";

// GET /api/integrations/notion/oauth/callback - Handle Notion OAuth callback
export async function GET(request: NextRequest) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        const state = searchParams.get("state"); // user_id
        const error = searchParams.get("error");

        if (error) {
            return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=${error}`);
        }

        if (!code || !state) {
            return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=missing_params`);
        }

        let clientId = process.env.NOTION_CLIENT_ID;
        let clientSecret = process.env.NOTION_CLIENT_SECRET;

        // Fetch integration and secrets from DB
        const cookieStore = await cookies();
        const supabase = createServerClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options })
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: '', ...options })
                    },
                },
            }
        );

        const { data: integration } = await supabase
            .from("integrations")
            .select("id")
            .eq("slug", "notion")
            .single();

        if (integration) {
            const { data: secrets } = await supabase
                .from("integration_secrets")
                .select("key, value")
                .eq("integration_id", integration.id);

            const dbClientId = secrets?.find((s: any) => s.key === "CLIENT_ID")?.value;
            const dbClientSecret = secrets?.find((s: any) => s.key === "CLIENT_SECRET")?.value;

            if (dbClientId) clientId = dbClientId;
            if (dbClientSecret) clientSecret = dbClientSecret;
        }

        const redirectUri = `${appUrl}/api/integrations/notion/oauth/callback`;

        if (!clientId || !clientSecret) {
            return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=config_missing`);
        }

        // Exchange code for access token
        const tokenResponse = await fetch("https://api.notion.com/v1/oauth/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                grant_type: "authorization_code",
                code: code,
                redirect_uri: redirectUri,
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Notion token exchange error:", errorData);
            return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=token_exchange_failed`);
        }

        const tokenData = await tokenResponse.json();

        if (!integration) {
            return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=integration_not_found`);
        }

        // Store user integration connection
        const { error: insertError } = await (supabase as any)
            .from("user_integrations")
            .upsert({
                user_id: state, // user_id from state
                integration_id: (integration as any).id,
                access_token: tokenData.access_token,
                additional_config: {
                    workspace_id: tokenData.workspace_id,
                    workspace_name: tokenData.workspace_name,
                    workspace_icon: tokenData.workspace_icon,
                    bot_id: tokenData.bot_id,
                    owner: tokenData.owner,
                },
                status: "active",
            }, { onConflict: 'user_id, integration_id' });

        if (insertError) {
            console.error("Error storing Notion connection:", insertError);
            return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=storage_failed`);
        }

        // Success! Redirect back to integrations page
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?success=notion_connected`);
    } catch (error: any) {
        console.error("Error in Notion OAuth callback:", error);
        return NextResponse.redirect(`${appUrl}/dashboard/integrations?error=callback_failed`);
    }
}
