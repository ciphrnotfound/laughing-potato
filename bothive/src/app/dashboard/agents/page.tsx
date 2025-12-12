"use client";

import { useEffect, useState } from "react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { IconUserBolt, IconPlus, IconBrain } from "@tabler/icons-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface AgentPersona {
    id: string;
    name: string;
    role: string;
    description: string;
}

export default function AgentsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [agents, setAgents] = useState<AgentPersona[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAgents() {
            try {
                const { data, error } = await supabase.from("agents").select("*");
                if (error) throw error;
                setAgents(data || []);
            } catch (e) {
                console.error("Failed to load agents", e);
            } finally {
                setLoading(false);
            }
        }
        fetchAgents();
    }, []);

    return (
        <DashboardPageShell
            title="Agents"
            description="Available AI personas you can hire for your workforce."
            headerAction={
                <Link
                    href="/dashboard/agents/market"
                    className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                        isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"
                    )}
                >
                    <IconPlus className="w-4 h-4" />
                    Browse Agent Market
                </Link>
            }
        >
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map((agent, i) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className={cn(
                                "group flex flex-col p-6 rounded-2xl border transition-all duration-300",
                                isDark
                                    ? "bg-white/5 border-white/10 hover:border-blue-500/50 hover:bg-white/10"
                                    : "bg-white border-black/5 hover:border-black/10 hover:shadow-lg"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                                    isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                                )}>
                                    <IconUserBolt className="w-6 h-6" />
                                </div>
                                <span className={cn(
                                    "text-xs font-semibold px-2 py-1 rounded-full",
                                    isDark ? "bg-white/10 text-neutral-300" : "bg-neutral-100 text-neutral-600"
                                )}>
                                    {agent.role || "General"}
                                </span>
                            </div>

                            <h3 className={cn("text-xl font-bold mb-2", isDark ? "text-white" : "text-neutral-900")}>
                                {agent.name}
                            </h3>
                            <p className={cn("text-sm flex-1 mb-6", isDark ? "text-neutral-400" : "text-neutral-500")}>
                                {agent.description}
                            </p>

                            <button className={cn(
                                "w-full py-2.5 rounded-lg font-medium border transition-colors flex items-center justify-center gap-2",
                                isDark
                                    ? "border-white/10 hover:bg-white/5 text-white"
                                    : "border-black/10 hover:bg-neutral-50 text-black"
                            )}>
                                <IconBrain className="w-4 h-4" />
                                Hire This Agent
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardPageShell>
    );
}
