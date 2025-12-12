import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// POST /api/integrations/youtube/search - Search YouTube videos
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { query, maxResults = 5 } = body;

        if (!query) {
            return NextResponse.json({ error: "Query is required" }, { status: 400 });
        }

        // Get user's YouTube API key from user_integrations
        const { data: userIntegration } = await supabase
            .from("user_integrations")
            .select("api_key")
            .eq("user_id", user.id)
            .eq("integration_id", (
                await supabase
                    .from("integrations")
                    .select("id")
                    .eq("slug", "youtube")
                    .single()
            ).data?.id || "")
            .single();

        const apiKey = userIntegration?.api_key || process.env.YOUTUBE_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: "YouTube API key not configured" },
                { status: 400 }
            );
        }

        // Search YouTube using Data API
        const searchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`
        );

        if (!searchResponse.ok) {
            const error = await searchResponse.json();
            return NextResponse.json(
                { error: error.error?.message || "YouTube API error" },
                { status: searchResponse.status }
            );
        }

        const data = await searchResponse.json();

        // Log integration call
        const { data: integration } = await supabase
            .from("integrations")
            .select("id")
            .eq("slug", "youtube")
            .single();

        if (integration) {
            await supabase.from("integration_calls").insert({
                user_id: user.id,
                integration_id: integration.id,
                capability_name: "search_videos",
                input_params: { query, maxResults },
                credits_used: 0,
            });
        }

        // Format results
        const videos = data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            channel: item.snippet.channelTitle,
            published_at: item.snippet.publishedAt,
            thumbnail: item.snippet.thumbnails.high.url,
        }));

        return NextResponse.json({
            success: true,
            query: query,
            results: videos,
            count: videos.length,
        });
    } catch (error: any) {
        console.error("Error searching YouTube:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
