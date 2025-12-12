
import { ToolDescriptor } from "@/lib/agentTypes";

/**
 * Google Docs Integration (Stub)
 * Allows for reading drafts and leaving comments.
 */
export const googleDocsTools: ToolDescriptor[] = [
    {
        name: "integration.gdocs.read",
        capability: "integration.gdocs",
        description: "Read the content of a Google Doc",
        async run(args, ctx) {
            const docId = typeof args.docId === "string" ? args.docId : "";

            // Stub implementation
            return {
                success: true,
                output: `[MOCK] Content of Google Doc ${docId}.\n\n"The realization hit me as I stood in the rain..."`,
                data: { docId, content: "Mock content" }
            };
        }
    },
    {
        name: "integration.gdocs.comment",
        capability: "integration.gdocs",
        description: "Add a comment to a specific part of a Google Doc",
        async run(args, ctx) {
            const docId = typeof args.docId === "string" ? args.docId : "";
            const comment = typeof args.comment === "string" ? args.comment : "";
            const quote = typeof args.quote === "string" ? args.quote : "";

            // Stub implementation
            return {
                success: true,
                output: `[MOCK] Added comment to ${docId} on text "${quote}": "${comment}"`,
                data: { docId, comment, quote }
            };
        }
    }
];
