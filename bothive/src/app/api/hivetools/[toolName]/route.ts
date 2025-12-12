import { NextRequest, NextResponse } from "next/server";
import { theHive } from "@/lib/plugins";

interface RouteParams {
    params: Promise<{
        toolName: string;
    }>;
}

/**
 * GET /api/hivetools/[toolName] - Get details for a specific HiveTool
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { toolName } = await params;
        await theHive.initialize();

        const tool = theHive.getHiveTool(toolName);

        if (!tool) {
            return NextResponse.json(
                { error: "HiveTool not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            tool: {
                name: tool.name,
                displayName: tool.metadata.displayName,
                description: tool.description,
                category: tool.metadata.category,
                author: tool.metadata.author,
                version: tool.metadata.version,
                isOfficial: tool.metadata.isOfficial,
                isPremium: tool.metadata.isPremium,
                requiresAuth: tool.metadata.requiresAuth,
                authType: tool.metadata.authType,
                documentationUrl: tool.metadata.documentationUrl,
                iconUrl: tool.metadata.iconUrl,
                tags: tool.metadata.tags,
                downloads: tool.metadata.downloads || 0,
                rating: tool.metadata.rating || 0,
                capability: tool.capability,
            }
        });
    } catch (error) {
        console.error('Error fetching HiveTool:', error);
        return NextResponse.json(
            { error: "Failed to fetch HiveTool details" },
            { status: 500 }
        );
    }
}
