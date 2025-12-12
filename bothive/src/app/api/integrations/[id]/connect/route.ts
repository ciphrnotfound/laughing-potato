import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/integrations/[id]/connect - Connect user to integration
export async function POST(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id: integration_id } = await params;
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

        // Check if integration exists
        const { data: integration } = await supabase
            .from("integrations")
            .select("*")
            .eq("id", integration_id)
            .single();

        if (!integration) {
            return NextResponse.json({ error: "Integration not found" }, { status: 404 });
        }

        // Validate required credentials based on auth_type
        if (integration.auth_type === "api_key" && !body.api_key) {
            return NextResponse.json(
                { error: "API key is required for this integration" },
                { status: 400 }
            );
        }

        if (integration.auth_type === "oauth2" && (!body.access_token || !body.refresh_token)) {
            return NextResponse.json(
                { error: "OAuth tokens are required for this integration" },
                { status: 400 }
            );
        }

        // Create or update user integration connection
        const { data, error } = await supabase
            .from("user_integrations")
            .upsert({
                user_id: user.id,
                integration_id: integration_id,
                access_token: body.access_token,
                refresh_token: body.refresh_token,
                api_key: body.api_key,
                additional_config: body.additional_config || {},
                expires_at: body.expires_at,
                status: "active",
                updated_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error("Error connecting integration:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ connection: data }, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/integrations/[id]/connect:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/integrations/[id]/connect - Disconnect user from integration
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { id: integration_id } = await params;
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

        // Delete connection
        const { error } = await supabase
            .from("user_integrations")
            .delete()
            .eq("user_id", user.id)
            .eq("integration_id", integration_id);

        if (error) {
            console.error("Error disconnecting integration:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error in DELETE /api/integrations/[id]/connect:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
