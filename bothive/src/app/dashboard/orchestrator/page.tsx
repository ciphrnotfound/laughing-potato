"use client";

import React from "react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import VisualWorkflowBuilder from "@/components/VisualWorkflowBuilder";

export default function OrchestratorPage() {
    return (
        <DashboardPageShell
            title="Swarm Orchestrator"
            description="Connect agents, triggers, and tools into autonomous swarms."
        >
            <div className="h-[calc(100vh-140px)] -mt-4">
                <VisualWorkflowBuilder workflowId="new" />
            </div>
        </DashboardPageShell>
    );
}
