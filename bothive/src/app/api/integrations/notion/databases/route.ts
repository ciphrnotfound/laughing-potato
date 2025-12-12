import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Client } from "@notionhq/client";

// POST /api/integrations/notion/databases - Create database entry
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
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

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { database_id, properties } = body;

        if (!database_id || !properties) {
            return NextResponse.json(
                { error: "database_id and properties are required" },
                { status: 400 }
            );
        }

        // Get user's Notion access token
        const { data: userIntegration } = await supabase
            .from("user_integrations")
            .select("access_token, integration_id")
            .eq("user_id", user.id)
            .eq("integration_id", (
                await supabase
                    .from("integrations")
                    .select("id")
                    .eq("slug", "notion")
                    .single()
            ).data?.id || "")
            .single();

        if (!userIntegration?.access_token) {
            return NextResponse.json(
                { error: "Notion not connected" },
                { status: 400 }
            );
        }

        // Initialize Notion client
        const notion = new Client({ auth: userIntegration.access_token });

        // Create database entry (page in database)
        const page = await notion.pages.create({
            parent: { database_id: database_id },
            properties: properties,
        });

        // Log integration call
        await supabase.from("integration_calls").insert({
            user_id: user.id,
            integration_id: userIntegration.integration_id,
            capability_name: "create_database_entry",
            input_params: { database_id },
            credits_used: 0,
        });

        return NextResponse.json({
            success: true,
            entry: {
                id: page.id,
            },
        });
    } catch (error: any) {
        console.error("Error creating Notion database entry:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create entry" },
            { status: 500 }
        );
    }
}

// GET /api/integrations/notion/databases - List user's databases
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
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

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get user's Notion access token
        const { data: userIntegration } = await supabase
            .from("user_integrations")
            .select("access_token")
            .eq("user_id", user.id)
            .eq("integration_id", (
                await supabase
                    .from("integrations")
                    .select("id")
                    .eq("slug", "notion")
                    .single()
            ).data?.id || "")
            .single();

        if (!userIntegration?.access_token) {
            return NextResponse.json(
                { error: "Notion not connected" },
                { status: 400 }
            );
        }

        // Initialize Notion client
        const notion = new Client({ auth: userIntegration.access_token });

        // Search for databases
        const response = await notion.search({
            filter: {
                property: "object",
                value: "page",
            },
        });

        const databases = response.results.map((db: any) => ({
            id: db.id,
            title: db.title?.[0]?.plain_text || "Untitled",
            url: db.url,
            created_time: db.created_time,
        }));

        return NextResponse.json({
            success: true,
            databases: databases,
        });
    } catch (error: any) {
        console.error("Error fetching Notion databases:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch databases" },
            { status: 500 }
        );
    }
}
