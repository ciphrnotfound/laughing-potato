"use client";

import React from "react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import SwarmBuilder from "@/components/SwarmBuilder";

export default function SwarmBuilderPage() {
    return (
        <DashboardPageShell
            title="Visual Swarm Builder"
            description="Design, visualize, and animate your multi-agent swarms."
        >
            <div className="h-[calc(100vh-140px)] -mt-4">
                <SwarmBuilder />
            </div>
        </DashboardPageShell>
    );
}
