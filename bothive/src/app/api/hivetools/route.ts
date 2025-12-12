import { NextRequest, NextResponse } from "next/server";
import { theHive } from "@/lib/plugins";

/**
 * GET /api/hivetools - Browse the HiveTool marketplace 🐝
 */
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const isOfficial = searchParams.get('official');
        const isPremium = searchParams.get('premium');

        // Initialize the Hive
        await theHive.initialize();

        let tools;

        // Apply filters
        if (search) {
            tools = theHive.searchHive(search);
        } else if (category || isOfficial !== null || isPremium !== null) {
            tools = theHive.filterHiveTools({
                category: category || undefined,
                isOfficial: isOfficial === 'true' ? true : isOfficial === 'false' ? false : undefined,
                isPremium: isPremium === 'true' ? true : isPremium === 'false' ? false : undefined,
            });
        } else {
            tools = theHive.getAllHiveTools();
        }

        // Get Hive stats
        const stats = theHive.getHiveStats();

        return NextResponse.json({
            hivetools: tools.map(tool => ({
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
                downloads: tool.metadata.downloads,
                rating: tool.metadata.rating,
            })),
            stats,
            total: tools.length,
        });
    } catch (error: any) {
        console.error('HiveTools API error:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch HiveTools" },
            { status: 500 }
        );
    }
}
