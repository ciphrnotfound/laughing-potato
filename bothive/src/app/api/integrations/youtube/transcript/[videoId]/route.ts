import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { YoutubeTranscript } from 'youtube-transcript';

interface RouteParams {
    params: Promise<{ videoId: string }>;
}

// GET /api/integrations/youtube/transcript/:videoId - Get video transcript
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

        const { searchParams } = new URL(request.url);
        const language = searchParams.get("language") || "en";

        // Fetch transcript using youtube-transcript library
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
                lang: language,
            });

            // Combine all transcript segments into one text
            const fullText = transcript.map((item: any) => item.text).join(" ");

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
                    capability_name: "get_transcript",
                    input_params: { videoId, language },
                    credits_used: 0,
                });
            }

            return NextResponse.json({
                success: true,
                transcript: {
                    full_text: fullText,
                    segments: transcript.map((item: any) => ({
                        text: item.text,
                        offset: item.offset,
                        duration: item.duration,
                    })),
                    language: language,
                    video_id: videoId,
                },
            });
        } catch (transcriptError: any) {
            return NextResponse.json(
                {
                    error: "Transcript not available for this video",
                    details: transcriptError.message,
                },
                { status: 404 }
            );
        }
    } catch (error: any) {
        console.error("Error fetching YouTube transcript:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
