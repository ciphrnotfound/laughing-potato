import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Initialize Supabase Admin for authoritative lookups
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
    try {
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

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const includeMembers = searchParams.get("include_members") === "true";

        // Fetch workspaces where user is owner
        const { data: ownedWorkspaces } = await supabaseAdmin
            .from("bot_workspaces")
            .select(includeMembers ? "*, workspace_members(*)" : "*")
            .eq("owner_id", user.id);

        // Fetch memberships for this user
        const { data: memberships } = await supabaseAdmin
            .from("workspace_members")
            .select("workspace_id")
            .eq("user_id", user.id)
            .eq("status", "active");

        let memberWorkspaces: any[] = [];
        if (memberships && memberships.length > 0) {
            const workspaceIds = memberships.map(m => m.workspace_id);
            // Fetch those workspaces via Admin to bypass RLS
            const { data: wsData } = await supabaseAdmin
                .from("bot_workspaces")
                .select(includeMembers ? "*, workspace_members(*)" : "*")
                .in("id", workspaceIds);

            if (wsData) memberWorkspaces = wsData;
        }

        // Combine and deduplicate
        const allWorkspaces = [
            ...(ownedWorkspaces || []),
            ...memberWorkspaces
        ];

        const uniqueWorkspaces = allWorkspaces.reduce((acc: any[], ws) => {
            if (!acc.find(w => w.id === ws.id)) {
                acc.push(ws);
            }
            return acc;
        }, []);

        return NextResponse.json({ workspaces: uniqueWorkspaces });

    } catch (error: any) {
        console.error("Workspaces fetch error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch workspaces" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
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

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, description, slug } = await req.json();

        if (!name || !slug) {
            return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
        }

        // Check if slug is already taken
        const { data: existing } = await supabase
            .from("bot_workspaces")
            .select("id")
            .eq("slug", slug)
            .single();

        if (existing) {
            return NextResponse.json({ error: "This URL slug is already taken" }, { status: 400 });
        }

        // Create workspace
        const { data: workspace, error: createError } = await supabase
            .from("bot_workspaces")
            .insert({
                name,
                slug,
                owner_id: user.id
            })
            .select()
            .single();

        if (createError) {
            console.error("Workspace creation error:", createError);
            return NextResponse.json({ error: createError.message }, { status: 500 });
        }

        // Add owner as member
        await supabase
            .from("workspace_members")
            .insert({
                workspace_id: workspace.id,
                user_id: user.id,
                role: "owner",
                status: "active"
            });

        // Create notification for workspace creation
        await supabase
            .from("notifications")
            .insert({
                user_id: user.id,
                type: "workspace_created",
                title: "Workspace Created",
                message: `Your workspace "${name}" has been created successfully.`,
                metadata: { workspace_id: workspace.id, workspace_name: name },
                read: false
            });

        return NextResponse.json({ workspace, success: true });

    } catch (error: any) {
        console.error("Workspace creation error:", error);
        return NextResponse.json({ error: error.message || "Failed to create workspace" }, { status: 500 });
    }
}
