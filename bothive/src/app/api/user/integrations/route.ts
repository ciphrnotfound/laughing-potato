import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// GET /api/user/integrations - Get user's connected integrations
export async function GET(request: NextRequest) {
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

        // Get user's connections with integration details
        const { data, error } = await supabase
            .from("user_integrations")
            .select(`
        *,
        integration:integrations (
          id,
          name,
          slug,
          description,
          icon_url,
          category,
          auth_type
        )
      `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching user integrations:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Remove sensitive data before sending to client
        const sanitized = data?.map(conn => ({
            ...conn,
            access_token: conn.access_token ? "***" : null,
            refresh_token: conn.refresh_token ? "***" : null,
            api_key: conn.api_key ? "***" : null,
        }));

        return NextResponse.json({ connections: sanitized });
    } catch (error: any) {
        console.error("Error in GET /api/user/integrations:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
