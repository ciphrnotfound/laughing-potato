import { NextRequest, NextResponse } from "next/server";
import { publishScheduledPosts } from "@/lib/autoposter";


export async function POST(req: NextRequest) {
    try {

        const cronSecret = req.headers.get('x-cron-secret');
        if (cronSecret !== process.env.CRON_SECRET && process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const result = await publishScheduledPosts();

        return NextResponse.json({
            success: true,
            published: result.published.length,
            failed: result.failed.length,
            details: result,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Autoposter error:', error);
        return NextResponse.json(
            { error: error.message || "Autoposter failed" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/autoposter/run - Check autoposter status
 */
export async function GET(req: NextRequest) {
    return NextResponse.json({
        status: "ready",
        endpoint: "/api/autoposter/run",
        method: "POST",
        description: "Execute scheduled post publishing",
    });
}
