"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity,
    Cpu,
    ArrowUpRight,
    Search,
    BrainCircuit,
    Loader2,
    Clock,
    Zap,
    Code,
    Plus,
    Users,
    ChevronRight,
    MoreVertical,
    BarChart3
} from "lucide-react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { useGlassAlert } from "@/components/ui/glass-alert";
import Link from "next/link";

interface PulseEvent {
    id: string;
    source: string;
    botName: string;
    action: string;
    status: 'success' | 'warning' | 'error' | 'processing';
    timestamp: string;
    details: string;
    logs?: any[];
}

export default function PulseCenterPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { showAlert } = useGlassAlert();
    const [events, setEvents] = useState<PulseEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

    const fetchEvents = async () => {
        try {
            const res = await fetch("/api/bots/executions");
            const data = await res.json();
            if (data.executions) {
                setEvents(data.executions.map((ex: any) => ({
                    ...ex,
                    timestamp: new Date(ex.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    source: ex.source === 'api' ? 'Inbound' : ex.source === 'event' ? 'Autonomous Fix' : 'Internal',
                    logs: ex.output_data?.logs || ex.execution_logs || []
                })));
            }
        } catch (error) {
            console.error("Failed to fetch pulse events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        const interval = setInterval(fetchEvents, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredEvents = events.filter(e =>
        e.botName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.details.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardPageShell
            title="Pulse Center"
            description="Autonomous swarm heartbeat and executive monitoring"
            headerAction={
                <Link href="/builder">
                    <button className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Bot
                    </button>
                </Link>
            }
        >
            {/* Search - Exact Workspace Style */}
            <div className="mb-8">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search activity logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:border-violet-500/50",
                            isDark
                                ? "bg-white/[0.03] border-white/10 text-white placeholder:text-neutral-600"
                                : "bg-white border-black/10 text-black placeholder:text-neutral-400"
                        )}
                    />
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main List Area */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-24 rounded-2xl border border-white/5 bg-white/[0.02] animate-pulse" />
                            ))}
                        </div>
                    ) : filteredEvents.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <div className="w-14 h-14 rounded-xl bg-white/[0.03] border border-white/5 mx-auto mb-4 flex items-center justify-center">
                                <Activity className="w-6 h-6 text-neutral-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">No activity detected</h3>
                            <p className="text-neutral-500 text-sm">Waiting for your first bot execution pulse.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredEvents.map((event, index) => (
                                <motion.div
                                    key={event.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className={cn(
                                        "group relative p-6 rounded-2xl border transition-all duration-300",
                                        isDark
                                            ? "bg-[#111113] border-white/5 hover:border-violet-500/30 hover:bg-[#161619]"
                                            : "bg-white border-black/5 hover:border-violet-500/30 hover:bg-neutral-50 shadow-sm hover:shadow-md",
                                        expandedEvent === event.id && "ring-1 ring-violet-500/50"
                                    )}
                                    onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg",
                                                event.source === 'Autonomous Fix' ? "bg-violet-500/10" : isDark ? "bg-white/5" : "bg-neutral-100"
                                            )}>
                                                {event.source === 'Autonomous Fix' ? (
                                                    <Zap className={cn("w-6 h-6", isDark ? "text-violet-400" : "text-violet-600")} />
                                                ) : (
                                                    <Cpu className={cn("w-6 h-6", isDark ? "text-violet-400" : "text-violet-600")} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={cn("text-lg font-bold mb-0.5", isDark ? "text-white" : "text-neutral-900")}>
                                                    {event.botName}
                                                </h3>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                                        event.status === 'success' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                            "bg-violet-500/10 text-violet-500 border border-violet-500/20"
                                                    )}>
                                                        {event.action}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-mono",
                                                        event.source === 'Autonomous Fix' ? "text-violet-400" : "text-neutral-500"
                                                    )}>
                                                        {event.source}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-neutral-500 mb-1">{event.timestamp}</p>
                                            <div className={cn(
                                                "p-2 rounded-lg transition-transform",
                                                expandedEvent === event.id ? "rotate-90 bg-violet-500/20 text-violet-400" : "opacity-0 group-hover:opacity-100 bg-white/5 text-white"
                                            )}>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Swarm Thought */}
                                    <AnimatePresence>
                                        {expandedEvent === event.id && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="mt-6 pt-6 border-t border-white/5 overflow-hidden"
                                            >
                                                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Swarm Thought & Reasoning</h4>
                                                <div className="space-y-3">
                                                    {event.logs && event.logs.length > 0 ? (
                                                        event.logs.map((log: any, i: number) => (
                                                            <div key={i} className="flex gap-3 text-sm">
                                                                <div className="mt-1">
                                                                    {log.type === 'call' ? (
                                                                        <Code className="w-3.5 h-3.5 text-violet-400" />
                                                                    ) : (
                                                                        <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className={isDark ? "text-neutral-300" : "text-neutral-700"}>
                                                                        {log.type === 'call' ? (
                                                                            <span className="font-mono text-xs bg-white/5 px-1.5 py-0.5 rounded mr-2 text-violet-300">
                                                                                {log.tool}
                                                                            </span>
                                                                        ) : null}
                                                                        {log.payload || JSON.stringify(log.args)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-neutral-600 italic">No detailed reasoning logs available for this execution.</p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar area - Stats & System Health */}
                <div className="space-y-6">
                    <div className={cn(
                        "p-6 rounded-2xl border transition-all duration-300",
                        isDark
                            ? "bg-[#111113] border-white/5"
                            : "bg-white border-black/5 shadow-sm"
                    )}>
                        <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2", isDark ? "text-neutral-500" : "text-neutral-400")}>
                            <BarChart3 className="w-4 h-4" />
                            System Overview
                        </h3>
                        <div className="space-y-4">
                            <StatRow label="Active Bots" value={events.length > 0 ? Array.from(new Set(events.map(e => e.botName))).length.toString() : "0"} />
                            <StatRow label="Global Pulses" value={events.length.toString()} />
                            <StatRow label="API Success Rate" value="99.9%" />
                        </div>
                    </div>

                    <div className={cn(
                        "p-6 rounded-2xl border transition-all duration-300",
                        isDark
                            ? "bg-[#111113] border-white/5"
                            : "bg-white border-black/5 shadow-sm"
                    )}>
                        <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2", isDark ? "text-neutral-500" : "text-neutral-400")}>
                            <Clock className="w-4 h-4" />
                            System Health
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="text-neutral-500">API Latency</span>
                                    <span className="font-mono text-emerald-500">42ms</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[95%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="text-neutral-500">Database Uptime</span>
                                    <span className="font-mono text-emerald-500">99.98%</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[99%]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardPageShell>
    );
}

function StatRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <span className="text-sm text-neutral-500">{label}</span>
            <span className="text-sm font-bold">{value}</span>
        </div>
    );
}
