"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton, CardSkeleton } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import { Bot, Plus, ArrowRight, Activity, Globe, MessageSquare, Rocket, Settings, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useBots } from "@/hooks/useBots";
import { RunBotButton } from "@/components/RunBotButton";
import Image from "next/image";

export default function BotsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { bots, loading, error } = useBots();

    return (
        <div className={cn(
            "min-h-screen transition-colors duration-500",
            isDark ? "bg-[#070910] text-white" : "bg-gray-50/50 text-[#0C1024]"
        )}>
            <div className="mx-auto w-full max-w-7xl px-6 py-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                >
                    <div>
                        <h1 className={cn(
                            "text-3xl font-bold tracking-tight",
                            isDark ? "text-white" : "text-gray-900"
                        )}>
                            Your Bots
                        </h1>
                        <p className={cn(
                            "mt-2 text-md",
                            isDark ? "text-white/60" : "text-gray-500"
                        )}>
                            Manage and monitor your autonomous workforce.
                        </p>
                    </div>

                    <Link href="/builder">
                        <button className={cn(
                            "group flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:translate-y-[-1px]",
                            isDark
                                ? "bg-white text-black hover:bg-gray-200"
                                : "bg-black text-white hover:bg-gray-800"
                        )}>
                            <Plus className="w-5 h-5" />
                            New Bot
                        </button>
                    </Link>
                </motion.div>

                {/* Bots List */}
                {loading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-64 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-8 rounded-2xl border bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20 text-center">
                        <Activity className="w-8 h-8 text-red-500 mx-auto mb-3" />
                        <p className="text-red-500 font-medium">{error.message}</p>
                    </div>
                ) : bots.length === 0 ? (
                    <div className="text-center py-20 px-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                                "max-w-md mx-auto rounded-3xl p-10 border",
                                isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200 shadow-sm"
                            )}
                        >
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400">
                                <Bot className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No bots yet</h3>
                            <p className="text-gray-500 mb-8">Start your automation journey by building your first bot.</p>
                            <Link href="/builder">
                                <button className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors">
                                    Start Building
                                </button>
                            </Link>
                        </motion.div>
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {bots.map((bot, index) => (
                            <motion.div
                                key={bot.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="group"
                            >
                                <div className={cn(
                                    "h-full flex flex-col p-5 rounded-2xl border transition-all duration-200",
                                    isDark 
                                        ? "bg-[#0F111A] border-white/5 hover:border-white/10 hover:bg-[#13151F]" 
                                        : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200/40"
                                )}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm",
                                            isDark ? "bg-white/5" : "bg-gray-50"
                                        )}>
                                            {bot.icon_url ? (
                                                <Image src={bot.icon_url} alt={bot.name} width={28} height={28} className="w-7 h-7 object-contain" />
                                            ) : (
                                                <Bot className={cn("w-6 h-6", isDark ? "text-white/70" : "text-gray-600")} />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <div className={cn(
                                                "px-2.5 py-1 rounded-full text-xs font-semibold border",
                                                bot.deployment_status === 'active'
                                                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                                                    : bot.deployment_status === 'deploying'
                                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                        : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                            )}>
                                                {bot.deployment_status === 'active' ? 'Live' : bot.deployment_status === 'deploying' ? 'Deploying' : 'Draft'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 flex-grow">
                                        <h3 className={cn("text-lg font-bold mb-1.5", isDark ? "text-white" : "text-gray-900")}>
                                            {bot.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                            {bot.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className={cn("pt-4 mt-auto border-t flex items-center justify-between gap-3", isDark ? "border-white/5" : "border-gray-100")}>
                                       
                                        <Link href={`/dashboard/bots/${bot.id}`} className="flex-1">
                                             <button className={cn(
                                                "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                isDark ? "hover:bg-white/5 text-white/70 hover:text-white" : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                                            )}>
                                                <Settings className="w-4 h-4" />
                                                Manage
                                            </button>
                                        </Link>

                                        <Link href={`/dashboard/bots/${bot.id}`} className="flex-1">
                                             <button className={cn(
                                                "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black text-white hover:bg-gray-800"
                                            )}>
                                                <MessageSquare className="w-4 h-4" />
                                                Chat
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
