import { NextRequest, NextResponse } from "next/server";
import { pulseEngine } from "@/lib/swarm/pulse-engine";

export async function POST(req: NextRequest) {
    try {
        // manually trigger a pulse cycle
        await pulseEngine.pulse();

        return NextResponse.json({
            status: "success",
            message: "Pulse cycle initiated",
            timestamp: Date.now()
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to pulse" }, { status: 500 });
    }
}
