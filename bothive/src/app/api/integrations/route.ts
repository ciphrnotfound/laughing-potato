import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/integrations - List all integrations
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();

        // 1. Get current User (for mapping connections)
        const supabaseAuth = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value },
                    set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
                    remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }) },
                },
            }
        );
        const { data: { user } } = await supabaseAuth.auth.getUser();

        // 2. Init Admin Client (Bypass RLS)
        // We import the createClient from specifically supabase-js for the admin client 
        // to avoid any cookie/ssr confusion, although createServerClient would work too if config'd right.
        // But let's use the standard creating for admin tasks.
        const { createClient } = await import("@supabase/supabase-js");
        const adminDb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { searchParams } = new URL(request.url);
        const category = searchParams.get("category");
        const search = searchParams.get("search");
        const official = searchParams.get("official");

        // 3. Fetch Integrations (Admin Level)
        let query = adminDb
            .from("integrations")
            .select("*")
            .order("created_at", { ascending: false });

        if (category && category !== "all") query = query.eq("category", category);
        if (official === "true") query = query.eq("is_official", true);
        if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

        const { data: integrations, error: intError } = await query;

        if (intError) throw intError;

        // 4. Fetch User Connections (if logged in)
        let userConnections: any[] = [];
        if (user) {
            const { data: inviteData } = await adminDb
                .from("user_integrations")
                .select("integration_id, status")
                .eq("user_id", user.id);

            userConnections = inviteData || [];
        }

        // 5. Merge Data
        const enrichedIntegrations = integrations?.map((integration) => {
            const conn = userConnections.find(c => c.integration_id === integration.id);
            return {
                ...integration,
                is_connected: !!conn,
                connection_status: conn?.status || 'disconnected'
            };
        });

        return NextResponse.json({ integrations: enrichedIntegrations });

    } catch (error: any) {
        console.error("Error in GET /api/integrations:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/integrations - Create a new integration
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

        // Validate required fields
        if (!body.name || !body.slug) {
            return NextResponse.json(
                { error: "Missing required fields: name, slug" },
                { status: 400 }
            );
        }

        // Ensure unique slug by checking for existing and appending suffix if needed
        let finalSlug = body.slug;
        const { data: existingIntegration } = await supabase
            .from("integrations")
            .select("id")
            .eq("slug", finalSlug)
            .single();

        if (existingIntegration) {
            // Append timestamp suffix to make unique
            finalSlug = `${body.slug}_${Date.now().toString(36)}`;
        }

        // Create integration
        const { data, error } = await supabase
            .from("integrations")
            .insert({
                developer_id: user.id,
                name: body.name,
                slug: finalSlug,
                description: body.description,
                icon_url: body.icon_url,
                banner_url: body.banner_url,
                category: body.category || "other",
                auth_type: body.auth_type || "none",
                oauth_config: body.oauth_config,
                requires_api_key: body.requires_api_key || false,
                api_key_instructions: body.api_key_instructions,
                capabilities: body.capabilities || [],
                webhook_url: body.webhook_url,
                webhook_events: body.webhook_events,
                documentation_url: body.documentation_url,
                code_example: body.code_example,
                hivelang_code: body.hivelang_code,
                status: "pending", // New integrations start as pending for approval
                is_paid: body.is_paid || false,
                price_per_month: body.price_per_month,
                free_tier_limit: body.free_tier_limit,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating integration:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ integration: data }, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/integrations:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
