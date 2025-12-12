import { aiClient } from "@/lib/ai-client";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Simple text splitter
function splitText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
}

export async function generateEmbedding(text: string) {
    const response = await aiClient.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
}

export async function processDocument(
    documentId: string, 
    content: string, 
    supabase: any
) {
    const chunks = splitText(content);
    
    // Process chunks in parallel (with limit)
    const embeddingPromises = chunks.map(async (chunk, index) => {
        try {
            const embedding = await generateEmbedding(chunk);
            return {
                document_id: documentId,
                content: chunk,
                embedding,
                chunk_index: index
            };
        } catch (e) {
            console.error(`Error embedding chunk ${index}:`, e);
            return null;
        }
    });

    const results = await Promise.all(embeddingPromises);
    const validChunks = results.filter(r => r !== null);

    if (validChunks.length > 0) {
        const { error } = await supabase
            .from('document_chunks')
            .insert(validChunks);
            
        if (error) console.error('Error storing chunks:', error);
    }
}
