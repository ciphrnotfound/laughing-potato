"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from "@supabase/supabase-js";
import { cn } from '@/lib/utils';
import { Bot, Command, Database, Server } from 'lucide-react';
import { useTheme } from 'next-themes';

interface VisualizerNode {
    id: string;
    label: string;
    type: 'bot' | 'hub';
    status: 'idle' | 'active';
    x: number;
    y: number;
}

interface PulseEvent {
    id: number;
    sourceVal: string;
    targetVal: string;
    timestamp: number;
}

export const NeuralHive = () => {
    const [nodes, setNodes] = useState<VisualizerNode[]>([]);
    const [pulses, setPulses] = useState<PulseEvent[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // 1. Fetch Data
    useEffect(() => {
        const fetchBots = async () => {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            const { data: bots } = await supabase.from('bots').select('*').limit(12);

            if (!containerRef.current) return;
            const { clientWidth: w, clientHeight: h } = containerRef.current;

            const centerX = w / 2;
            const centerY = h / 2;

            const botNodes: VisualizerNode[] = (bots || []).map((bot: any, i: number, arr: any[]) => {
                const angle = (i / arr.length) * Math.PI * 2;
                const radius = Math.min(w, h) * 0.3;
                return {
                    id: bot.id,
                    label: bot.name,
                    type: 'bot',
                    status: Math.random() > 0.6 ? 'active' : 'idle',
                    x: centerX + Math.cos(angle) * radius,
                    y: centerY + Math.sin(angle) * radius,
                };
            });

            // Hub
            const hub: VisualizerNode = {
                id: 'hive-hub',
                label: 'HiveMind',
                type: 'hub',
                status: 'active',
                x: centerX,
                y: centerY,
            };

            setNodes([hub, ...botNodes]);
        };

        fetchBots();
        window.addEventListener('resize', fetchBots);
        return () => window.removeEventListener('resize', fetchBots);
    }, []);

    // 2. Pulse
    useEffect(() => {
        const interval = setInterval(() => {
            if (nodes.length < 2) return;
            const randomBot = nodes[Math.floor(Math.random() * (nodes.length - 1)) + 1];
            if (!randomBot) return;

            setPulses(prev => [...prev.slice(-4), {
                id: Math.random(),
                sourceVal: 'hive-hub',
                targetVal: randomBot.id,
                timestamp: Date.now()
            }]);

        }, 2000);
        return () => clearInterval(interval);
    }, [nodes]);

    return (
        <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-background">

            {/* 1. Grid Background (Subtle) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* 2. Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10">
                {nodes.slice(1).map((node) => {
                    const hub = nodes[0];
                    if (!hub) return null;
                    return (
                        <g key={`link-${node.id}`}>
                            <line
                                x1={hub.x} y1={hub.y} x2={node.x} y2={node.y}
                                stroke="currentColor"
                                className="text-border"
                                strokeWidth="1"
                            />
                        </g>
                    );
                })}

                {/* Pulses */}
                <AnimatePresence>
                    {pulses.map(pulse => {
                        const s = nodes.find(n => n.id === pulse.sourceVal);
                        const t = nodes.find(n => n.id === pulse.targetVal);
                        if (!s || !t) return null;
                        return (
                            <motion.circle
                                key={pulse.id}
                                r={3}
                                className="fill-primary"
                                initial={{ cx: s.x, cy: s.y, opacity: 0 }}
                                animate={{ cx: t.x, cy: t.y, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        );
                    })}
                </AnimatePresence>
            </svg>

            {/* 3. Nodes */}
            {nodes.map((node, i) => (
                <div
                    key={node.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 group cursor-default"
                    style={{ left: node.x, top: node.y }}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center border shadow-sm transition-all bg-card text-card-foreground",
                        node.type === 'hub' ? "border-primary/50 ring-4 ring-primary/10" : "hover:scale-105 hover:border-primary/50"
                    )}>
                        {node.type === 'hub' ? (
                            <Command className="w-6 h-6 text-primary" />
                        ) : (
                            <Bot className={cn("w-5 h-5", node.status === 'active' ? "text-primary" : "text-muted-foreground")} />
                        )}

                        {/* Status Dot */}
                        {node.status === 'active' && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                        )}
                    </div>

                    <span className="text-xs font-medium text-muted-foreground">
                        {node.label}
                    </span>
                </div>
            ))}
        </div>
    );
};
