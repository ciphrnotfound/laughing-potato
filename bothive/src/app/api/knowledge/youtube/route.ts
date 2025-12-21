import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { processDocument } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const { url, kbId } = await request.json();

        if (!url || !kbId) {
            return NextResponse.json({ error: "YouTube URL and KB ID required" }, { status: 400 });
        }

        // 1. Auth check
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) { return cookieStore.get(name)?.value; },
                    set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }); },
                    remove(name: string, options: any) { cookieStore.set({ name, value: '', ...options }); },
                },
            }
        );
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Extract Transcript
        // Simplified URL parsing to get Video ID
        const videoIdMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        if (!videoId) {
            return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
        }

        let transcriptText = "";
        try {
            const transcript = await YoutubeTranscript.fetchTranscript(videoId);
            transcriptText = transcript.map(t => t.text).join(" ");
        } catch (e: any) {
            return NextResponse.json({ error: `Could not fetch transcript: ${e.message}` }, { status: 404 });
        }

        // 3. Create Document Record
        const { data: doc, error: docError } = await supabase
            .from("documents")
            .insert({
                kb_id: kbId,
                user_id: user.id,
                title: `YouTube: ${videoId}`,
                source_type: 'youtube',
                metadata: { videoId, url }
            })
            .select()
            .single();

        if (docError || !doc) {
            throw new Error(docError?.message || "Failed to create document record");
        }

        // 4. Process & Embed (RAG)
        await processDocument(doc.id, transcriptText, supabase);

        return NextResponse.json({ success: true, document: doc });

    } catch (error: any) {
        console.error("YouTube processing error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
