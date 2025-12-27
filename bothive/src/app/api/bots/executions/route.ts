import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch executions for all bots owned by the user
        // We join with the bots table to get the bot name and to filtering by user_id
        const { data: executions, error } = await supabase
            .from("bot_executions")
            .select(`
                id,
                input_data,
                output_data,
                source,
                created_at,
                bots!inner (
                    name,
                    user_id
                )
            `)
            .eq("bots.user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) {
            console.error("Error fetching bot executions:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            executions: executions.map(ex => ({
                id: ex.id,
                botName: (ex.bots as any).name,
                action: ex.source === 'api' ? 'External Tool Call' : 'Widget Interaction',
                details: ex.input_data,
                output: ex.output_data,
                timestamp: ex.created_at,
                status: 'success'
            }))
        });

    } catch (error: any) {
        console.error("Execution Feed Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
