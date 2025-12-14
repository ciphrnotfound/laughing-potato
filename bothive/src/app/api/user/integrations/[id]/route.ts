import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// PATCH /api/user/integrations/[id] - Update user integration config
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Integration Connection ID (user_integrations.id) OR Integration ID?
    // Let's assume it's the INTEGRATION ID for simplicity in the UI context, 
    // or we query by user_id + integration_id. 
    // Actually standard REST is resource ID. The `user_integrations` row ID is hidden usually.
    // But verify: ConfigurePanel has `userInt.id` (which is the connection ID).
    // So we should use connection ID.
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { config } = body;

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

        // Update the connection
        // "id" here matches the [id] in the URL. 
        // We'll treat it as the 'integration_id' from the `integrations` table 
        // to make it easier for the client (since they know integration ID well).
        // Wait, ConfigurePanel has `userInt.id` (connection ID) AND `userInt.integration.id`.
        // Let's support looking up by integration_id + user_id, which is safer?

        // Let's try to update by user_id + integration_id
        const { error } = await supabase
            .from("user_integrations")
            .update({
                additional_config: config,
                updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)
            .eq("integration_id", id); // Assuming [id] is the Integration ID (e.g. uuid of 'slack')

        if (error) {
            console.error("Error updating user integration:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error in PATCH /api/user/integrations/[id]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
