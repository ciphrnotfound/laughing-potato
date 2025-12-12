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

        // Get the integration
        const { data: integration, error: fetchError } = await supabase
            .from("integrations")
            .select("install_count")
            .eq("id", id)
            .single();

        if (fetchError || !integration) {
            return NextResponse.json({ error: "Integration not found" }, { status: 404 });
        }

        // Increment install count
        const { error: updateError } = await supabase
            .from("integrations")
            .update({ install_count: (integration.install_count || 0) + 1 })
            .eq("id", id);

        if (updateError) {
            console.error("Error updating install count:", updateError);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            install_count: (integration.install_count || 0) + 1
        });
    } catch (error: any) {
        console.error("Error in POST /api/integrations/[id]/install:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
