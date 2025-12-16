"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import AIChatInterface from "@/components/AIChatInterface";
import {
    IconRobot,
    IconPlayerPlay,
    IconBuildingStore,
    IconArrowLeft,
    IconSparkles,
    IconCalendar,
    IconFileText,
    IconCircleCheck,
    IconClock,
    IconExternalLink,
    IconLoader,
    IconBolt,
    IconActivity,
    IconBrain,
    IconRefresh,
    IconSettings,
    IconPlus
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface InstalledBot {
    id: string;
    name: string;
    description: string;
    icon_url?: string;
    hivelang_code?: string;
    code?: string;
    category?: string;
    capabilities?: string[];
    installed_at?: string;
    status?: string;
    is_public?: boolean;
}

interface TaskAction {
    id: string;
    type: "notion" | "calendar" | "email" | "task" | "other";
    description: string;
    status: "pending" | "success" | "error";
    timestamp: Date;
    link?: string;
}

export default function MyBotsPage() {
    const { theme } = useTheme();
    const { profile } = useAppSession();
    const router = useRouter();
    const isDark = theme === "dark";
    const supabase = createClientComponentClient();

    const [installedBots, setInstalledBots] = useState<InstalledBot[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBot, setSelectedBot] = useState<InstalledBot | null>(null);
    const [taskActions, setTaskActions] = useState<TaskAction[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchInstalledBots = useCallback(async () => {
        if (!profile) return;

        try {
            const { data: userBots, error: botsError } = await supabase
                .from("bots")
                .select("*")
                .eq("user_id", profile.id)
                .order("created_at", { ascending: false });

            if (botsError) console.error("Error fetching bots:", botsError);

            const { data: installedIntegrations, error: intError } = await supabase
                .from("user_integrations")
                .select(`
          integration_id,
          created_at,
          integrations (
            id,
            name,
            description,
            icon_url,
            hivelang_code,
            category,
            capabilities
          )
        `)
                .eq("user_id", profile.id);

            if (intError) console.error("Error fetching integrations:", intError);

            const allBots: InstalledBot[] = [];

            if (userBots) {
                userBots.forEach((bot) => {
                    allBots.push({
                        id: bot.id,
                        name: bot.name,
                        description: bot.description || "Your custom bot",
                        icon_url: bot.icon_url,
                        hivelang_code: bot.hivelang_code || bot.code,
                        category: bot.category || "Custom",
                        capabilities: bot.capabilities,
                        status: bot.status,
                        is_public: bot.is_public,
                    });
                });
            }

            if (installedIntegrations) {
                installedIntegrations.forEach((install: any) => {
                    if (install.integrations?.hivelang_code) {
                        allBots.push({
                            id: install.integrations.id,
                            name: install.integrations.name,
                            description: install.integrations.description || "Installed bot",
                            icon_url: install.integrations.icon_url,
                            hivelang_code: install.integrations.hivelang_code,
                            category: install.integrations.category || "Integration",
                            capabilities: install.integrations.capabilities,
                            installed_at: install.created_at,
                        });
                    }
                });
            }

            setInstalledBots(allBots);
        } catch (error) {
            console.error("Error fetching installed bots:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [profile, supabase]);

    useEffect(() => {
        fetchInstalledBots();
    }, [fetchInstalledBots]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchInstalledBots();
    };

    const getActionIcon = (type: TaskAction["type"]) => {
        switch (type) {
            case "notion": return <IconFileText className="w-4 h-4" />;
            case "calendar": return <IconCalendar className="w-4 h-4" />;
            case "email": return <IconBolt className="w-4 h-4" />;
            case "task": return <IconCircleCheck className="w-4 h-4" />;
            default: return <IconActivity className="w-4 h-4" />;
        }
    };

    if (!profile) return null;

    // Bot Runner View
    if (selectedBot) {
        return (
            <div className="min-h-screen bg-black">
                {/* Header */}
                <div className="border-b border-neutral-800 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => setSelectedBot(null)}
                                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                            >
                                <IconArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            <div className="h-5 w-px bg-neutral-800" />
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                    <IconRobot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className="font-semibold text-white">{selectedBot.name}</h1>
                                    <p className="text-xs text-neutral-500">{selectedBot.category}</p>
                                </div>
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/bots/${selectedBot.id}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            <IconSettings className="w-4 h-4" />
                            Configure
                        </Link>
                    </div>
                </div>

                {/* Main */}
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
                        {/* Chat */}
                        <div className="lg:col-span-2 h-full">
                            <div className="h-full rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                                <AIChatInterface
                                    botCapabilities={selectedBot.capabilities || []}
                                    hivelangCode={selectedBot.hivelang_code || selectedBot.code}
                                />
                            </div>
                        </div>

                        {/* Activity Panel */}
                        <div className="h-full">
                            <div className="h-full rounded-xl border border-neutral-800 bg-neutral-950 flex flex-col">
                                <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-violet-600/20">
                                        <IconActivity className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white text-sm">Live Activity</h3>
                                        <p className="text-xs text-neutral-500">Real-time actions</p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4">
                                    {taskActions.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center">
                                            <div className="relative mb-6">
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 flex items-center justify-center border border-violet-500/20">
                                                    <IconBrain className="w-8 h-8 text-violet-400" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-neutral-950">
                                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                </div>
                                            </div>
                                            <p className="text-sm text-white mb-1">Ready to work</p>
                                            <p className="text-xs text-neutral-500 max-w-[180px]">
                                                Actions will appear here in real-time
                                            </p>
                                        </div>
                                    ) : (
                                        <AnimatePresence>
                                            {taskActions.map((action) => (
                                                <motion.div
                                                    key={action.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="p-3 rounded-lg border border-neutral-800 bg-neutral-900/50 mb-2"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={cn(
                                                            "p-1.5 rounded-md",
                                                            action.status === "success" ? "bg-green-500/20 text-green-400" :
                                                                action.status === "error" ? "bg-red-500/20 text-red-400" :
                                                                    "bg-violet-500/20 text-violet-400"
                                                        )}>
                                                            {getActionIcon(action.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-white truncate">{action.description}</p>
                                                            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                                                                <IconClock className="w-3 h-3" />
                                                                {action.timestamp.toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                        {action.link && (
                                                            <a href={action.link} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-neutral-800 rounded">
                                                                <IconExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Gallery View
    return (
        <div className="min-h-screen bg-black">
            {/* Hero Header */}
            <div className="relative overflow-hidden border-b border-neutral-800">
                {/* Purple gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-black to-purple-950/30" />
                <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />

                <div className="relative max-w-7xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-500/30">
                                    <IconRobot className="w-6 h-6 text-white" />
                                </div>
                                <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-violet-500/50 to-transparent" />
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-4xl md:text-5xl font-bold text-white mb-3"
                            >
                                My Workforce
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg text-neutral-400"
                            >
                                <span className="text-violet-400 font-medium">{installedBots.length}</span> AI agents ready to execute
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-3"
                        >
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-all rounded-lg"
                            >
                                <IconRefresh className={cn("w-4 h-4", refreshing && "animate-spin")} />
                            </button>
                            <Link
                                href="/marketplace"
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-violet-600 text-white hover:bg-violet-500 transition-colors rounded-lg shadow-lg shadow-violet-500/25"
                            >
                                <IconBuildingStore className="w-4 h-4" />
                                Marketplace
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-violet-600/20 flex items-center justify-center">
                                <IconLoader className="w-6 h-6 text-violet-400 animate-spin" />
                            </div>
                            <p className="text-neutral-500 text-sm">Loading your workforce...</p>
                        </div>
                    </div>
                ) : installedBots.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-600/20 to-purple-600/20 flex items-center justify-center border border-violet-500/20">
                            <IconRobot className="w-10 h-10 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No agents yet</h3>
                        <p className="text-neutral-500 mb-8 max-w-md mx-auto">
                            Create your first AI agent or browse the marketplace for ready-to-use solutions.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link
                                href="/dashboard/bots/new"
                                className="flex items-center gap-2 px-5 py-3 bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors rounded-lg"
                            >
                                <IconPlus className="w-4 h-4" />
                                Create Agent
                            </Link>
                            <Link
                                href="/marketplace"
                                className="flex items-center gap-2 px-5 py-3 text-sm border border-neutral-700 text-neutral-300 hover:bg-neutral-900 transition-colors rounded-lg"
                            >
                                <IconBuildingStore className="w-4 h-4" />
                                Browse Marketplace
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {installedBots.map((bot, index) => (
                            <motion.div
                                key={bot.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className={cn(
                                    "group relative p-6 rounded-xl transition-all duration-300",
                                    "bg-neutral-950 border border-neutral-800",
                                    "hover:border-violet-600/50 hover:bg-neutral-900/50",
                                    "hover:shadow-xl hover:shadow-violet-500/10"
                                )}>
                                    {/* Glow effect on hover */}
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-600/0 to-purple-600/0 group-hover:from-violet-600/5 group-hover:to-purple-600/5 transition-all" />

                                    {/* Status */}
                                    {bot.hivelang_code && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            <span className="text-xs text-green-400">Active</span>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className="relative w-14 h-14 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center mb-5 shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
                                        {bot.icon_url ? (
                                            <img src={bot.icon_url} alt={bot.name} className="w-7 h-7 object-contain" />
                                        ) : (
                                            <IconRobot className="w-7 h-7 text-white" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <h3 className="text-lg font-semibold text-white mb-1.5 relative">
                                        {bot.name}
                                    </h3>
                                    <p className="text-sm text-neutral-500 mb-4 line-clamp-2 min-h-[40px] relative">
                                        {bot.description}
                                    </p>

                                    {/* Category */}
                                    <div className="flex items-center gap-2 mb-5 relative">
                                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-violet-600/10 text-violet-400 border border-violet-500/20">
                                            {bot.category || "General"}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    <button
                                        onClick={() => setSelectedBot(bot)}
                                        disabled={!bot.hivelang_code}
                                        className={cn(
                                            "relative w-full flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all rounded-lg",
                                            bot.hivelang_code
                                                ? "bg-violet-600 text-white hover:bg-violet-500 shadow-lg shadow-violet-500/20"
                                                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                                        )}
                                    >
                                        <IconPlayerPlay className="w-4 h-4" />
                                        {bot.hivelang_code ? "Run Agent" : "No Code"}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
