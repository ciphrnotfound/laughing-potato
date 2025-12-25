import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

        // Fetch workspaces where user is owner or member
        const { data: ownedWorkspaces, error: ownedError } = await supabase
            .from("bot_workspaces")
            .select(includeMembers ? "*, workspace_members(*)" : "*")
            .eq("owner_id", user.id);

        const { data: memberWorkspaces, error: memberError } = await supabase
            .from("workspace_members")
            .select("workspace_id, bot_workspaces(*)")
            .eq("user_id", user.id);

        if (ownedError) {
            console.error("Error fetching owned workspaces:", ownedError);
        }

        // Combine and deduplicate
        const allWorkspaces = [
            ...(ownedWorkspaces || []),
            ...(memberWorkspaces?.map(m => (m as any).bot_workspaces).filter(Boolean) || [])
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
