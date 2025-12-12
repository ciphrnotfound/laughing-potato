import { NextRequest, NextResponse } from "next/server";
import { theHive } from "@/lib/plugins";

/**
 * GET /api/tools - Get all available tools
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const isOfficial = searchParams.get('official');
        const isPremium = searchParams.get('premium');

        // Initialize registry if needed
        await theHive.initialize();

        let tools;

        // Apply filters
        if (search) {
            tools = theHive.searchTools(search);
        } else if (category || isOfficial !== null || isPremium !== null) {
            tools = theHive.filterTools({
                category: category || undefined,
                isOfficial: isOfficial === 'true' ? true : isOfficial === 'false' ? false : undefined,
                isPremium: isPremium === 'true' ? true : isPremium === 'false' ? false : undefined,
            });
        } else {
            tools = theHive.getAllTools();
        }

        // Get stats
        const stats = theHive.getStats();

        return NextResponse.json({
            tools: tools.map(tool => ({
                name: tool.name,
                displayName: tool.metadata.displayName,
                description: tool.description,
                category: tool.metadata.category,
                author: tool.metadata.author,
                version: tool.metadata.version,
                requiresAuth: tool.metadata.requiresAuth,
                authType: tool.metadata.authType,
                isOfficial: tool.metadata.isOfficial,
                isPremium: tool.metadata.isPremium,
                iconUrl: tool.metadata.iconUrl,
                tags: tool.metadata.tags,
            })),
            stats,
            total: tools.length,
        });
    } catch (error: any) {
        console.error('Tools API error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch tools" },
            { status: 500 }
        );
    }
}
