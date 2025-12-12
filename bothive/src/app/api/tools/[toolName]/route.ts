import { NextRequest, NextResponse } from "next/server";
import { theHive } from "@/lib/plugins";

interface RouteParams {
    params: Promise<{
        toolName: string;
    }>;
}

/**
 * GET /api/tools/[toolName] - Get specific tool details
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { toolName } = await params;
        await theHive.initialize();

        const tool = theHive.getTool(toolName);

        if (!tool) {
            return NextResponse.json(
                { error: "Tool not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            tool: {
                name: tool.name,
                displayName: tool.metadata.displayName,
                description: tool.description,
                category: tool.metadata.category,
                capability: tool.capability,
                author: tool.metadata.author,
                version: tool.metadata.version,
                requiresAuth: tool.metadata.requiresAuth,
                authType: tool.metadata.authType,
                isOfficial: tool.metadata.isOfficial,
                isPremium: tool.metadata.isPremium,
                documentationUrl: tool.metadata.documentationUrl,
                iconUrl: tool.metadata.iconUrl,
                tags: tool.metadata.tags,
                registeredAt: tool.registeredAt,
            },
        });
    } catch (error: any) {
        console.error('Tool details API error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch tool details" },
            { status: 500 }
        );
    }
}
