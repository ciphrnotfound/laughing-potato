"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import TestPlayground from "@/components/builder/TestPlayground";
import {
    IconRobot,
    IconRefresh,
    IconSearch,
    IconLoader,
    IconArrowLeft,
    IconSparkles,
    IconLayoutGrid,
    IconSettings
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

interface InstalledBot {
    id: string;
    name: string;
    description: string;
    icon_url?: string;
    hivelang_code?: string;
    code?: string;
    category?: string;
    capabilities?: string[];
    system_prompt?: string;
}

export default function WorkspacePage() {
    const { theme } = useTheme();
    const { profile } = useAppSession();
    const isDark = theme === "dark";
    const supabase = createClientComponentClient();

    const [bots, setBots] = useState<InstalledBot[]>([]);
    const [selectedBot, setSelectedBot] = useState<InstalledBot | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const fetchBots = useCallback(async () => {
        if (!profile) return;
        try {
            setRefreshing(true);
            const [{ data: userBots }, { data: installedIntegrations }] = await Promise.all([
                supabase.from("bots").select("*").eq("user_id", profile.id),
                supabase.from("user_integrations").select("*, integrations(*)").eq("user_id", profile.id)
            ]);

            const allBots: InstalledBot[] = [];

            if (userBots) {
                userBots.forEach(b => allBots.push({
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    icon_url: b.icon_url,
                    hivelang_code: b.hivelang_code || b.code,
                    capabilities: b.capabilities,
                    system_prompt: b.system_prompt,
                    category: "Custom"
                }));
            }

            if (installedIntegrations) {
                installedIntegrations.forEach((i: any) => {
                    if (i.integrations) {
                        allBots.push({
                            id: i.integrations.id,
                            name: i.integrations.name,
                            description: i.integrations.description,
                            icon_url: i.integrations.icon_url,
                            hivelang_code: i.integrations.hivelang_code,
                            capabilities: i.integrations.capabilities,
                            system_prompt: i.integrations.system_prompt,
                            category: "Integration"
                        });
                    }
                });
            }

            setBots(allBots);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [profile, supabase]);

    useEffect(() => {
        fetchBots();
    }, [fetchBots]);

    const filteredBots = bots.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <IconLoader className="w-8 h-8 text-violet-500 animate-spin" />
                <p className="text-sm text-neutral-500 font-medium">Syncing with the Hive...</p>
            </div>
        </div>
    );

    // Playground View
    if (selectedBot) {
        return (
            <div className="min-h-[calc(100vh-4rem)] bg-black py-8">
                <div className="max-w-5xl mx-auto px-6 mb-8 flex items-center justify-between">
                    <button
                        onClick={() => setSelectedBot(null)}
                        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors group"
                    >
                        <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Switch Agent
                    </button>

                    <div className="flex items-center gap-4">
                        <Link
                            href={`/dashboard/bots/${selectedBot.id}`}
                            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors flex items-center gap-1.5"
                        >
                            <IconSettings className="w-3.5 h-3.5" />
                            Configure {selectedBot.name}
                        </Link>
                    </div>
                </div>

                <TestPlayground
                    botName={selectedBot.name}
                    systemPrompt={selectedBot.system_prompt}
                    hivelangCode={selectedBot.hivelang_code}
                />
            </div>
        );
    }

    // Selection View
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-black px-6 py-12">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center p-3 rounded-2xl bg-violet-600/10 border border-violet-500/20 mb-6"
                    >
                        <IconSparkles className="w-8 h-8 text-violet-500" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-bold text-white mb-4 tracking-tight"
                    >
                        Agent Workspace
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-neutral-500 max-w-lg mx-auto"
                    >
                        Select an agent from your workforce to begin an orchestration session in the high-fidelity playground.
                    </motion.p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
                    <div className="relative w-full sm:max-w-md">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search your agents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                        />
                    </div>
                    <button
                        onClick={fetchBots}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-400 hover:text-white bg-neutral-900/50 border border-neutral-800 rounded-xl transition-all"
                    >
                        <IconRefresh className={cn("w-4 h-4", refreshing && "animate-spin")} />
                        Refresh
                    </button>
                </div>

                {/* Grid */}
                {filteredBots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBots.map((bot, idx) => (
                            <motion.button
                                key={bot.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelectedBot(bot)}
                                className="group relative flex flex-col p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:border-violet-600/50 transition-all text-left overflow-hidden hover:shadow-2xl hover:shadow-violet-500/5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/0 to-purple-600/0 group-hover:from-violet-600/5 group-hover:to-purple-600/5 transition-colors" />

                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        {bot.icon_url ? (
                                            <img src={bot.icon_url} className="w-7 h-7 object-contain" />
                                        ) : (
                                            <IconRobot className="w-7 h-7 text-white/50 group-hover:text-violet-400 transition-colors" />
                                        )}
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 group-hover:text-violet-500 transition-colors">
                                        {bot.category}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">{bot.name}</h3>
                                <p className="text-sm text-neutral-500 line-clamp-2 mb-6 group-hover:text-neutral-400 transition-colors">
                                    {bot.description || "Unlocking the potential of autonomous intelligence."}
                                </p>

                                <div className="mt-auto pt-4 border-t border-neutral-800/50 flex items-center justify-between">
                                    <span className="text-xs text-neutral-600">Open Playground</span>
                                    <IconLayoutGrid className="w-4 h-4 text-neutral-700 group-hover:text-violet-500 transition-colors" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-neutral-800 rounded-2xl bg-neutral-900/20">
                        <IconRobot className="w-12 h-12 text-neutral-700 mb-4" />
                        <h3 className="text-white font-medium mb-1">No agents matched your search</h3>
                        <p className="text-neutral-600 text-sm">Try using different keywords or install new agents from the marketplace.</p>
                        <Link
                            href="/marketplace"
                            className="mt-6 text-sm text-violet-400 hover:text-violet-300 font-medium"
                        >
                            Explore Marketplace &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
