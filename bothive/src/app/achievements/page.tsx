"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Lock, Sparkles, TrendingUp, Zap, Target } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { GridBackground } from "@/components/ui/grid-background";
import { GlassCard } from "@/components/ui/glass-card";
import { AchievementService, type Achievement, type UserAchievement } from "@/lib/services/achievement.service";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export default function AchievementsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState({ total: 0, unlocked: 0, percentage: 0 });
    const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

    useEffect(() => {
        async function loadAchievements() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const [allAchievements, userAchs, prog] = await Promise.all([
                    AchievementService.getAllAchievements(),
                    AchievementService.getUserAchievements(session.user.id),
                    AchievementService.getProgress(session.user.id),
                ]);

                setAchievements(allAchievements);
                setUserAchievements(userAchs);
                setProgress(prog);
            } catch (error) {
                console.error('Failed to load achievements:', error);
            } finally {
                setLoading(false);
            }
        }

        loadAchievements();
    }, []);

    const isUnlocked = (achievementId: string) => {
        return userAchievements.some(ua => ua.achievement_id === achievementId);
    };

    const getUnlockedDate = (achievementId: string) => {
        return userAchievements.find(ua => ua.achievement_id === achievementId)?.unlocked_at;
    };

    const tierColors = {
        bronze: {
            gradient: "from-amber-600 via-yellow-600 to-amber-700",
            glow: "shadow-amber-500/50",
            border: "border-amber-500/30",
            bg: "bg-amber-950/20",
            text: "text-amber-400",
        },
        silver: {
            gradient: "from-gray-400 via-slate-300 to-gray-500",
            glow: "shadow-gray-400/50",
            border: "border-gray-400/30",
            bg: "bg-gray-900/20",
            text: "text-gray-300",
        },
        gold: {
            gradient: "from-yellow-400 via-amber-400 to-yellow-500",
            glow: "shadow-yellow-500/50",
            border: "border-yellow-400/30",
            bg: "bg-yellow-950/20",
            text: "text-yellow-400",
        },
        platinum: {
            gradient: "from-purple-400 via-pink-400 to-purple-500",
            glow: "shadow-purple-500/50",
            border: "border-purple-400/30",
            bg: "bg-purple-950/20",
            text: "text-purple-400",
        },
    };

    const filteredAchievements = achievements.filter(ach => {
        if (filter === "unlocked") return isUnlocked(ach.id);
        if (filter === "locked") return !isUnlocked(ach.id);
        return true;
    });

    return (
        <GridBackground className={cn(
            "min-h-screen transition-colors duration-500",
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
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative">
                            <Trophy className="h-10 w-10 text-yellow-500" />
                            <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <div>
                            <h1 className={cn(
                                "text-4xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent",
                            )}>
                                Achievements
                            </h1>
                            <p className="text-sm text-zinc-400 mt-1">
                                Unlock rewards as you master BotHive
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <GlassCard variant="default" className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent" />
                            <div className="relative flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                                    <Target className="h-6 w-6 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-400">Progress</p>
                                    <p className="text-2xl font-bold text-yellow-400">
                                        {progress.percentage.toFixed(0)}%
                                    </p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard variant="default" className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
                            <div className="relative flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                                    <Trophy className="h-6 w-6 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-400">Unlocked</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {progress.unlocked}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard variant="default" className="relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
                            <div className="relative flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
                                    <Zap className="h-6 w-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-400">Remaining</p>
                                    <p className="text-2xl font-bold text-purple-400">
                                        {progress.total - progress.unlocked}
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-3 bg-zinc-900/50 rounded-full overflow-hidden border border-zinc-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </motion.div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mt-6">
                        {(["all", "unlocked", "locked"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    filter === f
                                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
                                        : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50 border border-zinc-700"
                                )}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Achievements Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-zinc-700 border-t-purple-500" />
                        <p className="text-zinc-400 mt-4">Loading achievements...</p>
                    </div>
                ) : filteredAchievements.length === 0 ? (
                    <GlassCard variant="default">
                        <div className="py-12 text-center">
                            <Award className="mx-auto h-16 w-16 text-zinc-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No Achievements Found</h3>
                            <p className="text-sm text-zinc-400">
                                {filter === "unlocked"
                                    ? "You haven't unlocked any achievements yet. Keep using BotHive!"
                                    : "All achievements unlocked! You're a master!"}
                            </p>
                        </div>
                    </GlassCard>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <AnimatePresence mode="popLayout">
                            {filteredAchievements.map((achievement, index) => {
                                const unlocked = isUnlocked(achievement.id);
                                const unlockedDate = getUnlockedDate(achievement.id);
                                const colors = tierColors[achievement.tier];

                                return (
                                    <motion.div
                                        key={achievement.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <GlassCard
                                            variant="default"
                                            className={cn(
                                                "relative overflow-hidden transition-all duration-300 hover:scale-105",
                                                unlocked
                                                    ? `${colors.border} ${colors.glow} shadow-xl`
                                                    : "opacity-60 hover:opacity-80 border-zinc-800"
                                            )}
                                        >
                                            {/* Background gradient */}
                                            {unlocked && (
                                                <div className={cn(
                                                    "absolute inset-0 opacity-10",
                                                    `bg-gradient-to-br ${colors.gradient}`
                                                )} />
                                            )}

                                            {/* Lock/Trophy indicator */}
                                            <div className="absolute top-3 right-3">
                                                {unlocked ? (
                                                    <div className={cn("p-2 rounded-full", colors.bg, colors.border, "border")}>
                                                        <Trophy className={cn("h-4 w-4", colors.text)} />
                                                    </div>
                                                ) : (
                                                    <div className="p-2 rounded-full bg-zinc-800/50 border border-zinc-700">
                                                        <Lock className="h-4 w-4 text-zinc-600" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Icon */}
                                            <div className="relative mb-4">
                                                <div className={cn(
                                                    "text-5xl mb-2 transition-transform duration-300",
                                                    unlocked && "animate-bounce-slow"
                                                )}>
                                                    {achievement.icon}
                                                </div>
                                                {unlocked && (
                                                    <div className={cn(
                                                        "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                                        colors.bg,
                                                        colors.text,
                                                        colors.border,
                                                        "border"
                                                    )}>
                                                        {achievement.tier}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <h3 className={cn(
                                                "font-bold text-lg mb-2",
                                                unlocked ? colors.text : "text-zinc-500"
                                            )}>
                                                {achievement.name}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                                                {achievement.description}
                                            </p>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                                <div className="flex items-center gap-1">
                                                    <Zap className={cn("h-3 w-3", unlocked ? colors.text : "text-zinc-600")} />
                                                    <span className={cn(
                                                        "text-xs font-bold",
                                                        unlocked ? colors.text : "text-zinc-600"
                                                    )}>
                                                        +{achievement.xp_reward} XP
                                                    </span>
                                                </div>
                                                {unlocked && unlockedDate && (
                                                    <span className="text-[10px] text-zinc-500">
                                                        {new Date(unlockedDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </GridBackground>
    );
}
