import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
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
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        // Try to find workspace by slug or ID
        let workspace;

        // First try by slug
        const { data: bySlug } = await supabase
            .from("bot_workspaces")
            .select("id, name, slug, owner_id, created_at")
            .eq("slug", id)
            .single();

        if (bySlug) {
            workspace = bySlug;
        } else {
            // Try by ID
            const { data: byId } = await supabase
                .from("bot_workspaces")
                .select("id, name, slug, owner_id, created_at")
                .eq("id", id)
                .single();
            workspace = byId;
        }

        if (!workspace) {
            return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
        }

        // Get member count
        const { count } = await supabase
            .from("workspace_members")
            .select("*", { count: "exact", head: true })
            .eq("workspace_id", workspace.id)
            .eq("status", "active");

        return NextResponse.json({
            workspace: {
                ...workspace,
                member_count: count || 0
            }
        });

    } catch (error: any) {
        console.error("Workspace info error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch workspace" }, { status: 500 });
    }
}
