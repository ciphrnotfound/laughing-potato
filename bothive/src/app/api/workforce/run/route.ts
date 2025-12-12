import { NextRequest, NextResponse } from "next/server";
import { runDigitalWorkforceHeavy as runDigitalWorkforce } from "@/lib/workforce/orchestrator";
import { allTools } from "@/lib/tools";
import { createSupabaseSharedMemory } from "@/lib/sharedMemorySupabase";
import { ToolContext } from "@/lib/agentTypes";

export async function POST(req: NextRequest) {
    const { userId, request } = await req.json();

    if (!request) {
        return NextResponse.json({ success: false, error: "Missing 'request' body param" }, { status: 400 });
    }

    const memStore = createSupabaseSharedMemory(`workforce-run-${Date.now()}`);
    const sharedMemory: ToolContext["sharedMemory"] = {
        async get(key) {
            return memStore.get(key);
        },
        async set(key, value) {
            memStore.set(key, value);
        },
        async append(key, value) {
            await memStore.append(key, value);
        },
    };

    const toolContext: ToolContext = {
        metadata: {
            botId: "workforce-orchestrator",
            runId: "workforce-run",
            userId,
        },
        sharedMemory,
    };

    const sharedTools = allTools;

    // Run workforce orchestrator
    const result = await runDigitalWorkforce(request, {
        sharedTools,
        toolContext,
    });

    return NextResponse.json(result);
}
