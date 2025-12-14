import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// POST /api/integrations/[id]/install - Install an integration
export async function POST(
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

        // Get the integration to return count later (or just return success)
        const { data: integration, error: fetchError } = await supabase
            .from("integrations")
            .select("id, install_count")
            .eq("id", id)
            .single();

        if (fetchError || !integration) {
            return NextResponse.json({ error: "Integration not found" }, { status: 404 });
        }

        // 1. Create User Integration Record
        // Schema requires 'active' status and 'additional_config' column
        const { error: insertError } = await supabase
            .from("user_integrations")
            .upsert({
                user_id: user.id,
                integration_id: id,
                status: 'active',
                additional_config: {},
            }, { onConflict: 'user_id, integration_id' });

        if (insertError) {
            console.error("Error creating user integration:", insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        // Note: Database trigger 'trigger_increment_integration_installs' handles the count increment automatically.

        return NextResponse.json({
            success: true,
            // We return the old count + 1 safely, assuming trigger worked
            install_count: (integration.install_count || 0) + 1,
            installed: true
        });
    } catch (error: any) {
        console.error("Error in POST /api/integrations/[id]/install:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
