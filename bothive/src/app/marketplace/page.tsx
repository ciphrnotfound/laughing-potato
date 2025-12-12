"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Store, Download, Star, TrendingUp } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { GridBackground } from "@/components/ui/grid-background";
import { GlassCard } from "@/components/ui/glass-card";
import { BotCard } from "@/components/BotCard";
import { cn } from "@/lib/utils";

interface MarketplaceBot {
    id: string;
    name: string;
    description: string;
    icon_url: string | null;
    category: string;
    install_count: number;
    rating: number | null;
    creator_name: string;
}

export default function MarketplacePage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [bots, setBots] = useState<MarketplaceBot[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        async function loadMarketplaceBots() {
            try {
                const response = await fetch('/api/store/bots');
                if (response.ok) {
                    const data = await response.json();
                    setBots(data.bots || []);
                }
            } catch (error) {
                console.error('Failed to load marketplace bots:', error);
            } finally {
                setLoading(false);
            }
        }

        loadMarketplaceBots();
    }, []);

    const categories = ["all", "productivity", "social", "analytics", "automation", "ai"];

    const filteredBots = filter === "all"
        ? bots
        : bots.filter(bot => bot.category === filter);

    return (
        <GridBackground className={cn(
            "transition-colors duration-500",
            isDark
                ? "bg-[#070910] text-white"
                : "bg-gradient-to-br from-[#F5F7FF] via-white to-[#E9EEFF] text-[#0C1024]"
        )}>
            <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Store className="h-8 w-8 text-purple-500" />
                        <h1 className={cn(
                            "text-3xl font-bold",
                            isDark ? "text-white" : "text-[#0C1024]"
                        )}>
                            Bot Marketplace
                        </h1>
                    </div>
                    <p className={cn(
                        "text-sm",
                        isDark ? "text-white/60" : "text-[#0C1024]/60"
                    )}>
                        Discover and install bots created by the community
                    </p>
                </motion.div>

                {/* Category Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setFilter(category)}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                filter === category
                                    ? "bg-purple-600 text-white"
                                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                            )}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Bots Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <p className="text-zinc-400">Loading marketplace...</p>
                    </div>
                ) : filteredBots.length === 0 ? (
                    <GlassCard variant="default">
                        <div className="py-12 text-center">
                            <Store className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No Bots Found</h3>
                            <p className="text-sm text-zinc-400">
                                {filter === "all"
                                    ? "The marketplace is empty. Be the first to publish a bot!"
                                    : `No bots found in the ${filter} category.`}
                            </p>
                        </div>
                    </GlassCard>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredBots.map((bot, index) => (
                            <motion.div
                                key={bot.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <GlassCard variant="interactive" withGrid={true}>
                                    <div className="space-y-4">
                                        {/* Icon */}
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600">
                                            <Store className="h-6 w-6 text-white" />
                                        </div>

                                        {/* Title */}
                                        <div>
                                            <h3 className={cn(
                                                "font-semibold",
                                                isDark ? "text-white" : "text-[#0C1024]"
                                            )}>
                                                {bot.name}
                                            </h3>
                                            <p className={cn(
                                                "mt-1 text-sm line-clamp-2",
                                                isDark ? "text-white/60" : "text-[#0C1024]/60"
                                            )}>
                                                {bot.description || "No description"}
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Download className="h-3 w-3 text-zinc-400" />
                                                <span className="text-zinc-400">{bot.install_count}</span>
                                            </div>
                                            {bot.rating && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-yellow-500" />
                                                    <span className="text-zinc-400">{bot.rating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Install Button */}
                                        <button className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
                                            Install Bot
                                        </button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </GridBackground>
    );
}
