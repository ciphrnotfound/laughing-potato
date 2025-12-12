
import { ToolDescriptor } from "@/lib/agentTypes";
import { aiClient } from "@/lib/ai-client";
import { generateEmbedding } from "@/lib/rag";
import { getSupabaseClient } from "@/lib/supabase"; // Use generic client or context supabase?
// Actually context doesn't provide generic Supabase usually, but we can try importing.
// Better to reuse ctx.tenant.firebase if available? No, RAG is usually Postgres/pgvector in this stack.
// Checking rag.ts again... it exports generateEmbedding but doesn't export the query logic.
// I'll need to implement the vector search here or in rag.ts and export it.

// Let's implement a simple vector search here using the generic supabase client for now.
// Real app should probably have a service for this.

export const knowledgeTools: ToolDescriptor[] = [
    {
        name: "knowledge.search",
        capability: "knowledge.search",
        description: "Search the knowledge base using semantic search.",
        async run(args, ctx) {
            const query = typeof args.query === "string" ? args.query : "";
            const threshold = typeof args.threshold === "number" ? args.threshold : 0.7;
            const limit = typeof args.limit === "number" ? args.limit : 5;

            if (!query) return { success: false, output: "Query is required" };

            try {
                const embedding = await generateEmbedding(query);

                // We assume there's a match_documents function in Postgres
                const { getSupabaseClient } = await import("@/lib/supabase");
                const supabase = getSupabaseClient();

                const { data, error } = await supabase.rpc('match_documents', {
                    query_embedding: embedding,
                    match_threshold: threshold,
                    match_count: limit
                });

                if (error) throw error;

                const results = data.map((d: any) => d.content).join("\n---\n");

                return {
                    success: true,
                    output: results || "No matching knowledge found.",
                    data: { results: data }
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Knowledge search failed: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        }
    },
    {
        name: "knowledge.admissions",
        capability: "knowledge.search",
        description: "Retrieve specific admissions criteria or successful essay excerpts.",
        async run(args, ctx) {
            // Helper wrapper around knowledge.search with prepended context
            const topic = typeof args.topic === "string" ? args.topic : "";
            const college = typeof args.college === "string" ? args.college : "";

            const fullQuery = `Admissions criteria for ${college} regarding ${topic}`;

            // Reuse the search logic (copy-paste or call sibling tool if architecture allowed)
            // For now, inline implementation
            try {
                const embedding = await generateEmbedding(fullQuery);
                const { getSupabaseClient } = await import("@/lib/supabase");
                const supabase = getSupabaseClient();

                const { data, error } = await supabase.rpc('match_documents', {
                    query_embedding: embedding,
                    match_threshold: 0.6,
                    match_count: 3
                });

                if (error) throw error;

                const results = data.map((d: any) => d.content).join("\n---\n");

                return {
                    success: true,
                    output: results || `No specific data found for ${college}.`,
                    data: { results: data }
                };
            } catch (error) {
                return {
                    success: false,
                    output: `Admissions search failed: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        }
    }
];
