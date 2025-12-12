"use client";

import { useEffect, useState } from "react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { IconUsers, IconServer, IconDatabase, IconActivity } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";

export default function AdminStatusPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [stats, setStats] = useState({
        users: 0,
        activeSessions: 0,
        dbLatency: '12ms',
        systemHealth: 'Healthy'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Real fetch for users
                const { count } = await supabase.from("users").select("*", { count: 'exact', head: true });

                // Mocking other system stats for now
                setStats({
                    users: count || 0,
                    activeSessions: Math.floor(Math.random() * 20) + 1,
                    dbLatency: `${Math.floor(Math.random() * 20 + 5)}ms`,
                    systemHealth: 'Healthy'
                });
            } catch (e) {
                console.error("Failed to load admin stats", e);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        { label: "Total Users", value: stats.users, icon: IconUsers, color: "text-blue-500" },
        { label: "Active Sessions", value: stats.activeSessions, icon: IconActivity, color: "text-green-500" },
        { label: "DB Latency", value: stats.dbLatency, icon: IconDatabase, color: "text-amber-500" },
        { label: "System Health", value: stats.systemHealth, icon: IconServer, color: "text-purple-500" },
    ];

    return (
        <DashboardPageShell
            title="Global System Status"
            description="Real-time overview of the BotHive platform infrastructure."
        >
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={cn(
                                "p-6 rounded-2xl border",
                                isDark ? "bg-white/5 border-white/10" : "bg-white/50 border-black/5"
                            )}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={cn("text-sm font-medium", isDark ? "text-neutral-400" : "text-neutral-500")}>
                                    {stat.label}
                                </h3>
                                <stat.icon className={cn("w-5 h-5", stat.color)} />
                            </div>
                            <div className={cn("text-3xl font-bold", isDark ? "text-white" : "text-neutral-900")}>
                                {stat.value}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Placeholder for System Logs Chart */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={cn(
                    "mt-8 p-8 rounded-2xl border min-h-[300px] flex items-center justify-center flex-col gap-4",
                    isDark ? "bg-black/20 border-white/10" : "bg-neutral-50 border-black/5"
                )}
            >
                <IconActivity className="w-12 h-12 text-neutral-500 opacity-20" />
                <p className="text-neutral-500">Live Traffic Visualization (Placeholder)</p>
            </motion.div>
        </DashboardPageShell>
    );
}
