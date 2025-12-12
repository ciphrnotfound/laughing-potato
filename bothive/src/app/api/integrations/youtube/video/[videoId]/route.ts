import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

interface RouteParams {
    params: Promise<{ videoId: string }>;
}

// GET /api/integrations/youtube/video/:videoId - Get video information
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        const { videoId } = await params;
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
                { error: "YouTube API key not configured. Please connect YouTube integration." },
                { status: 400 }
            );
        }

        // Fetch video info from YouTube Data API
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`
        );

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json({ error: error.error?.message || "YouTube API error" }, { status: response.status });
        }

        const data = await response.json();

        if (!data.items || data.items.length === 0) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        const video = data.items[0];

        // Log integration call
        await supabase.from("integration_calls").insert({
            user_id: user.id,
            integration_id: (
                await supabase
                    .from("integrations")
                    .select("id")
                    .eq("slug", "youtube")
                    .single()
            ).data?.id,
            capability_name: "get_video_info",
            input_params: { videoId },
            credits_used: 0, // YouTube is free
        });

        // Return formatted video info
        return NextResponse.json({
            success: true,
            video: {
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                channel: video.snippet.channelTitle,
                published_at: video.snippet.publishedAt,
                thumbnail: video.snippet.thumbnails.high.url,
                duration: video.contentDetails.duration,
                views: parseInt(video.statistics.viewCount || "0"),
                likes: parseInt(video.statistics.likeCount || "0"),
                comments: parseInt(video.statistics.commentCount || "0"),
            },
        });
    } catch (error: any) {
        console.error("Error fetching YouTube video:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
