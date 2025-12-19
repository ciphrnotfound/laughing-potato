"use client";

import React, { useState } from 'react';
import { NeuralHive } from "@/components/visualizer/NeuralHive";
import { Zap, Play, Activity } from "lucide-react";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function NeuralDashboardPage() {
    const [isPulsing, setIsPulsing] = useState(false);

    const handleManualPulse = async () => {
        setIsPulsing(true);
        try {
            await fetch('/api/swarm/pulse', { method: 'POST' });
            toast.success("Pulse Triggered");
        } catch (e) {
            toast.error("Failed to pulse");
        } finally {
            setTimeout(() => setIsPulsing(false), 2000);
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Neural Hive</h2>
                    <p className="text-muted-foreground">
                        Real-time visualization of your proactive agent swarm.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleManualPulse}
                        disabled={isPulsing}
                        className={cn(
                            "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2",
                            isPulsing && "opacity-70"
                        )}
                    >
                        <Zap className={cn("mr-2 h-4 w-4", isPulsing && "animate-spin")} />
                        {isPulsing ? "Pulsing..." : "Trigger Pulse"}
                    </button>
                </div>
            </div>

            {/* Main Content Area - Matching the rounded border look of other dashboards */}
            <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden relative min-h-[500px]">
                <NeuralHive />
            </div>
        </div>
    );
}
