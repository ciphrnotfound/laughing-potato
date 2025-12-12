import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { processDocument } from "@/lib/rag";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const kbId = formData.get("kbId") as string;

        if (!file || !kbId) {
            return NextResponse.json({ error: "File and Knowledge Base ID required" }, { status: 400 });
        }

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

        // 1. Create Document Record
        const { data: doc, error: docError } = await supabase
            .from("documents")
            .insert({
                kb_id: kbId,
                user_id: user.id,
                title: file.name,
                source_type: file.type.includes('pdf') ? 'pdf' : 'text',
                metadata: { size: file.size, type: file.type }
            })
            .select()
            .single();

        if (docError || !doc) {
            throw new Error(docError?.message || "Failed to create document record");
        }

        // 2. Extract Text (Simplified for MVP - assuming text/md files or we'd need PDF parsing lib)
        // For now, we only robustly handle text-based files. Real PDF parsing requires 'pdf-parse'
        const textContent = await file.text();

        // 3. Process & Embed (RAG)
        // Run in background (non-blocking) in a real edge/serverless setup, 
        // but here we await to ensure success for the demo
        await processDocument(doc.id, textContent, supabase);

        return NextResponse.json({ success: true, document: doc });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
