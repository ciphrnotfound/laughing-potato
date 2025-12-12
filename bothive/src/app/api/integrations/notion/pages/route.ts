import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Client } from "@notionhq/client";

// POST /api/integrations/notion/pages - Create a new Notion page
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
        const { parent_id, title, content } = body;

        if (!parent_id || !title) {
            return NextResponse.json(
                { error: "parent_id and title are required" },
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
                { error: "Notion not connected. Please connect Notion first." },
                { status: 400 }
            );
        }

        // Initialize Notion client
        const notion = new Client({ auth: userIntegration.access_token });

        // Create page
        const page = await notion.pages.create({
            parent: { page_id: parent_id },
            properties: {
                title: {
                    title: [
                        {
                            text: {
                                content: title,
                            },
                        },
                    ],
                },
            },
            children: content
                ? [
                    {
                        object: "block",
                        type: "paragraph",
                        paragraph: {
                            rich_text: [
                                {
                                    type: "text",
                                    text: {
                                        content: content,
                                    },
                                },
                            ],
                        },
                    },
                ]
                : [],
        });

        // Log integration call
        await supabase.from("integration_calls").insert({
            user_id: user.id,
            integration_id: userIntegration.integration_id,
            capability_name: "create_page",
            input_params: { parent_id, title },
            credits_used: 0,
        });

        return NextResponse.json({
            success: true,
            page: {
                id: page.id,
                url: (page as any).url || `https://notion.so/${page.id.replace(/-/g, '')}`,
                created_time: (page as any).created_time || new Date().toISOString(),
            },
        });
    } catch (error: any) {
        console.error("Error creating Notion page:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create page" },
            { status: 500 }
        );
    }
}
