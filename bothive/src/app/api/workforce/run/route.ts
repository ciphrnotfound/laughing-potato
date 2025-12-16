import { NextRequest, NextResponse } from "next/server";
import { runDigitalWorkforceHeavy as runDigitalWorkforce } from "@/lib/workforce/orchestrator";
import { generalTools, codingTools, studyTools, socialTools, messagingTools, integrationTools, agentTools } from "@/lib/tools";
import { createSharedMemory } from "@/lib/sharedMemory";
import { ToolContext } from "@/lib/agentTypes";

export async function POST(req: NextRequest) {
    const { userId, request } = await req.json();

    if (!request) {
        return NextResponse.json({ success: false, error: "Missing 'request' body param" }, { status: 400 });
    }

    const memStore = createSharedMemory("workforce-run");
    const sharedMemory: ToolContext["sharedMemory"] = {
        async get(key) {
            return memStore.get(key);
        },
        async set(key, value) {
            memStore.set(key, value);
        },
        async append(key, value) {
            const existing = (await memStore.get(key)) ?? [];
            if (Array.isArray(existing)) {
                existing.push(value);
                memStore.set(key, existing);
            } else {
                memStore.set(key, [existing, value]);
            }
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

    const sharedTools = [
        ...generalTools,
        ...codingTools,
        ...studyTools,
        ...socialTools,
        ...messagingTools,
        ...integrationTools,
        ...agentTools,
    ];

    // Run workforce orchestrator
    const result = await runDigitalWorkforce(request, {
        sharedTools,
        toolContext,
    });

    return NextResponse.json(result);
}
