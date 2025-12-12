"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "@/lib/theme-context";
import { Bot, Play, Pause, Activity, Cpu, Zap, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useAppSession } from "@/lib/app-session-context";

// Defined type for our Bot based on Supabase
interface BotData {
    id: string;
    bot_name: string;
    role: string;
    description: string | null;
    status?: 'active' | 'idle' | 'working'; // This might not be in DB yet, mocking status for UI
    created_at: string;
}

export default function WorkforcePage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { profile } = useAppSession();

    const [bots, setBots] = useState<BotData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBots = async () => {
            if (!profile?.id) return;
            try {
                const { data, error } = await supabase
                    .from('bots')
                    .select('*')
                    .eq('user_id', profile.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Enhance data with mock status if not present
                const enhancedBots = (data || []).map(b => ({
                    ...b,
                    status: (Math.random() > 0.5 ? 'working' : 'idle') as 'working' | 'idle'
                }));

                setBots(enhancedBots);
            } catch (err) {
                console.error("Error fetching bots:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBots();
    }, [profile]);

    const activeCount = bots.filter(b => b.status === 'working').length;
    const totalCount = bots.length;

    return (
        <DashboardPageShell
            title="My Workforce"
            description="Manage your active AI agents and monitor their performance."
            headerAction={
                <Link
                    href="/dashboard/bots/new"
                    className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                        isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
                    )}
                >
                    <Bot className="w-4 h-4" />
                    Hire New Agent
                </Link>
            }
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: "Active Agents", value: activeCount.toString(), icon: Bot, color: "text-purple-500" },
                    { label: "Total Workforce", value: totalCount.toString(), icon: Zap, color: "text-amber-500" },
                    { label: "Avg. Response", value: "0.2s", icon: Activity, color: "text-emerald-500" },
                ].map((stat, i) => (
                    <div
                        key={stat.label}
                        className={cn(
                            "p-6 rounded-2xl border backdrop-blur-sm",
                            isDark ? "bg-white/5 border-white/10" : "bg-white/50 border-black/5"
                        )}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className={cn("text-sm font-medium", isDark ? "text-neutral-400" : "text-neutral-500")}>{stat.label}</span>
                            <stat.icon className={cn("w-5 h-5", stat.color)} />
                        </div>
                        <div className={cn("text-3xl font-bold", isDark ? "text-white" : "text-neutral-900")}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : bots.length === 0 ? (
                <div className={cn(
                    "flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed text-center",
                    isDark ? "border-white/10" : "border-black/10"
                )}>
                    <Bot className="w-12 h-12 text-neutral-500 mb-4" />
                    <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-neutral-900")}>No Agents Hired Yet</h3>
                    <p className="text-neutral-500 mb-6 max-w-md">Your workforce is empty. Hire your first AI agent to start automating tasks.</p>
                    <Link
                        href="/dashboard/bots/new"
                        className={cn(
                            "px-4 py-2 rounded-lg font-medium",
                            isDark ? "bg-white text-black" : "bg-black text-white"
                        )}
                    >
                        Hire Agent
                    </Link>
                </div>
            ) : (
                /* Workforce Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bots.map((agent, i) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                                "group relative p-6 rounded-2xl border transition-all duration-300",
                                isDark
                                    ? "bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10"
                                    : "bg-white border-black/5 hover:border-black/10 hover:shadow-lg"
                            )}
                        >
                            {/* Status Indicator */}
                            <div className="absolute top-6 right-6 flex items-center gap-2">
                                <span className={cn(
                                    "flex h-2.5 w-2.5 rounded-full",
                                    agent.status === "working" ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"
                                )} />
                                <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                                    {agent.status}
                                </span>
                            </div>

                            {/* Icon & Name */}
                            <div className="mb-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                                    isDark ? "bg-white/10 text-white group-hover:bg-purple-500/20 group-hover:text-purple-400" : "bg-neutral-100 text-neutral-900"
                                )}>
                                    <Bot className="w-6 h-6" />
                                </div>
                                <h3 className={cn("text-xl font-semibold mb-1", isDark ? "text-white" : "text-neutral-900")}>{agent.bot_name}</h3>
                                <p className="text-sm text-neutral-500">{agent.role || "General Assistant"}</p>
                            </div>

                            {/* Task Info (Mocked for now since tasks aren't linked in this view yet) */}
                            <div className={cn(
                                "p-4 rounded-xl mb-6 text-sm",
                                isDark ? "bg-black/20 border border-white/5" : "bg-neutral-50"
                            )}>
                                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                                    <Activity className="w-4 h-4" />
                                    <span>Current Activity</span>
                                </div>
                                <p className={cn("font-medium truncate", isDark ? "text-white/80" : "text-neutral-700")}>
                                    {agent.status === 'working' ? `Processing request...` : "Standing by"}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <Link
                                    href={`/dashboard/bots/${agent.id}`}
                                    className={cn(
                                        "flex-1 py-2.5 rounded-lg font-medium text-center transition-colors flex items-center justify-center gap-2",
                                        isDark
                                            ? "bg-white text-black hover:bg-white/90"
                                            : "bg-black text-white hover:bg-black/90"
                                    )}
                                >
                                    <Play className="w-4 h-4" />
                                    View Details
                                </Link>
                                <button className={cn(
                                    "p-2.5 rounded-lg border transition-colors",
                                    isDark
                                        ? "border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white"
                                        : "border-black/10 hover:bg-neutral-50 text-neutral-500 hover:text-black"
                                )}>
                                    <Pause className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardPageShell>
    );
}
