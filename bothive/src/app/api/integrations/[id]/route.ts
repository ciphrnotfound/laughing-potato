import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/integrations/[id] - Get integration details
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

        const { data, error } = await supabase
            .from("integrations")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching integration:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "Integration not found" }, { status: 404 });
        }

        return NextResponse.json({ integration: data });
    } catch (error: any) {
        console.error("Error in GET /api/integrations/[id]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH /api/integrations/[id] - Update integration
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

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

        // Check if user owns this integration
        const { data: existing } = await supabase
            .from("integrations")
            .select("developer_id")
            .eq("id", id)
            .single();

        if (!existing || existing.developer_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Update integration
        const { data, error } = await supabase
            .from("integrations")
            .update({
                name: body.name,
                description: body.description,
                icon_url: body.icon_url,
                category: body.category,
                auth_type: body.auth_type,
                oauth_config: body.oauth_config,
                requires_api_key: body.requires_api_key,
                api_key_instructions: body.api_key_instructions,
                capabilities: body.capabilities,
                webhook_url: body.webhook_url,
                webhook_events: body.webhook_events,
                documentation_url: body.documentation_url,
                code_example: body.code_example,
                status: body.status,
                is_paid: body.is_paid,
                price_per_month: body.price_per_month,
                free_tier_limit: body.free_tier_limit,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating integration:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ integration: data });
    } catch (error: any) {
        console.error("Error in PATCH /api/integrations/[id]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE /api/integrations/[id] - Delete integration
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

        // Check if user owns this integration
        const { data: existing } = await supabase
            .from("integrations")
            .select("developer_id")
            .eq("id", id)
            .single();

        if (!existing || existing.developer_id !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Delete integration
        const { error } = await supabase
            .from("integrations")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting integration:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error in DELETE /api/integrations/[id]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
