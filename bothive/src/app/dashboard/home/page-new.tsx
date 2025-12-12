"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import {
    Bot,
    Zap,
    Activity,
    TrendingUp,
    Sparkles,
    Rocket,
    Users,
    BarChart3,
    Clock,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import Link from "next/link";
import { GridBackground } from "@/components/ui/grid-background";
import { GlassCard } from "@/components/ui/glass-card";
import { StatsCard } from "@/components/ui/stats-card";
import { XPProgressBar } from "@/components/ui/xp-progress-bar";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { useBots } from "@/hooks/useBots";
import { useGamification } from "@/hooks/useGamification";
import { useRecentExecutions } from "@/hooks/useExecutions";

// Helper function to get relative time
function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function DashboardHome() {
    const { theme } = useTheme();
    const { profile } = useAppSession();
    const isDark = theme === "dark";

    // Real data hooks
    const { bots, loading: botsLoading } = useBots({ limit: 10 });
    const { profile: gamificationProfile, progress, loading: gamificationLoading } = useGamification();
    const { executions, loading: executionsLoading } = useRecentExecutions(4);

    // Calculate real stats from data
    const totalBots = bots.length;
    const activeBots = bots.filter(b => b.deployment_status === 'active').length;
    const totalRuns = bots.reduce((sum, b) => sum + (b.total_runs || 0), 0);
    const successfulRuns = bots.reduce((sum, b) => sum + (b.successful_runs || 0), 0);
    const successRate = totalRuns > 0 ? ((successfulRuns / totalRuns) * 100).toFixed(1) : '0';
    const avgTime = bots.length > 0
        ? Math.round(bots.reduce((sum, b) => sum + (b.avg_execution_time_ms || 0), 0) / bots.length)
        : 0;

    const userStats = {
        level: gamificationProfile?.level || 1,
        currentXP: progress?.current_xp || 0,
        xpToNextLevel: progress?.xp_to_next_level || 100,
        totalBots,
        activeBots,
        totalExecutions: gamificationProfile?.total_executions || totalRuns,
        successRate: parseFloat(successRate),
        avgExecutionTime: avgTime,
    };

    // Map recent executions to activity format
    const recentActivity = executions.map((exec: any) => ({
        id: exec.id,
        bot: exec.bots?.name || 'Unknown Bot',
        action: exec.status === 'completed' ? 'Executed' : exec.status === 'failed' ? 'Failed' : 'Running',
        time: getRelativeTime(exec.created_at),
        status: exec.status,
    }));

    const loading = botsLoading || gamificationLoading || executionsLoading;

    const quickActions = [
        {
            title: "Create New Bot",
            description: "Build your next AI agent",
            icon: Bot,
            href: "/builder",
            gradient: "from-purple-600 to-blue-600"
        },
        {
            title: "Deploy Bot",
            description: "Push to production",
            icon: Rocket,
            href: "/dashboard/deployments",
            gradient: "from-blue-600 to-cyan-600"
        },
        {
            title: "View Analytics",
            description: "Track performance",
            icon: BarChart3,
            href: "/dashboard/analytics",
            gradient: "from-emerald-600 to-teal-600"
        },
        {
            title: "Team Workspace",
            description: "Collaborate with team",
            icon: Users,
            href: "/dashboard/workspaces",
            gradient: "from-orange-600 to-rose-600"
        },
    ];

    return (
        <GridBackground className={cn(
            "transition-colors duration-500",
            isDark
                ? "bg-[#070910] text-white"
                : "bg-linear-to-br from-[#F5F7FF] via-white to-[#E9EEFF] text-[#0C1024]"
        )}>
            <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-12 sm:px-8 lg:px-10">

                {/* Header with User Info and Theme Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <GlassCard variant="default" withGrid={true} withRadialGlow={true} glowPosition="top">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            {/* User greeting */}
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.28em]"
                                    style={{
                                        borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(12, 16, 36, 0.1)',
                                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(12, 16, 36, 0.05)',
                                    }}
                                >
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                    <span className={isDark ? "text-white/55" : "text-[#0C1024]/55"}>Welcome Back</span>
                                </div>

                                <h1 className={cn(
                                    "text-3xl font-bold md:text-4xl",
                                    isDark ? "text-white" : "text-[#0C1024]"
                                )}>
                                    {profile?.email?.split('@')[0] || 'Dashboard'}
                                </h1>

                                <p className={cn(
                                    "text-sm md:text-base",
                                    isDark ? "text-white/70" : "text-[#0C1024]/70"
                                )}>
                                    {loading ? "Loading your data..." : "Ready to build something amazing today?"}
                                </p>
                            </div>

                            {/* XP Progress and Theme Toggle */}
                            <div className="flex flex-col gap-4 md:min-w-[320px]">
                                {gamificationLoading ? (
                                    <div className="flex items-center justify-center h-16">
                                        <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                                    </div>
                                ) : (
                                    <XPProgressBar
                                        currentXP={userStats.currentXP}
                                        xpToNextLevel={userStats.xpToNextLevel}
                                        level={userStats.level}
                                        size="md"
                                        animated={true}
                                    />
                                )}
                                <div className="flex justify-end">
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <StatsCard
                        title="Total Bots"
                        value={userStats.totalBots}
                        change={totalBots > 0 ? activeBots : 0}
                        icon={Bot}
                        loading={botsLoading}
                    />
                    <StatsCard
                        title="Total Runs"
                        value={userStats.totalExecutions.toLocaleString()}
                        change={totalRuns > 0 ? parseFloat(successRate) : 0}
                        icon={Zap}
                        loading={botsLoading}
                    />
                    <StatsCard
                        title="Success Rate"
                        value={`${userStats.successRate}%`}
                        change={totalRuns > 0 ? successfulRuns : 0}
                        icon={TrendingUp}
                        loading={botsLoading}
                    />
                    <StatsCard
                        title="Avg. Execution"
                        value={avgTime > 0 ? `${avgTime}ms` : "—"}
                        change={avgTime > 0 && avgTime < 500 ? 1 : 0}
                        icon={Activity}
                        loading={botsLoading}
                    />
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className={cn(
                        "mb-4 text-xl font-semibold",
                        isDark ? "text-white" : "text-[#0C1024]"
                    )}>
                        Quick Actions
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <Link key={action.title} href={action.href}>
                                    <GlassCard
                                        variant="interactive"
                                        withGrid={false}
                                        withRadialGlow={false}
                                        size="md"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                                    >
                                        <div className={cn(
                                            "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br shadow-lg",
                                            action.gradient
                                        )}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>

                                        <h3 className={cn(
                                            "mb-1 text-base font-semibold",
                                            isDark ? "text-white" : "text-[#0C1024]"
                                        )}>
                                            {action.title}
                                        </h3>

                                        <p className={cn(
                                            "text-sm",
                                            isDark ? "text-white/60" : "text-[#0C1024]/60"
                                        )}>
                                            {action.description}
                                        </p>
                                    </GlassCard>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h2 className={cn(
                        "mb-4 text-xl font-semibold",
                        isDark ? "text-white" : "text-[#0C1024]"
                    )}>
                        Recent Activity
                    </h2>

                    <GlassCard variant="default" withGrid={true} noPadding>
                        {executionsLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className={cn(
                                    "text-sm",
                                    isDark ? "text-white/60" : "text-[#0C1024]/60"
                                )}>
                                    No recent activity. Execute a bot to see it here!
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-white/10">
                                {recentActivity.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                                        className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "flex h-10 w-10 items-center justify-center rounded-lg",
                                                isDark ? "bg-white/10" : "bg-purple-100"
                                            )}>
                                                {activity.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                                {activity.status === 'failed' && <CheckCircle2 className="h-5 w-5 text-rose-500" />}
                                                {activity.status === 'running' && <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />}
                                            </div>

                                            <div>
                                                <p className={cn(
                                                    "font-medium",
                                                    isDark ? "text-white" : "text-[#0C1024]"
                                                )}>
                                                    {activity.bot}
                                                </p>
                                                <p className={cn(
                                                    "text-sm",
                                                    isDark ? "text-white/60" : "text-[#0C1024]/60"
                                                )}>
                                                    {activity.action}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className={cn(
                                                "h-4 w-4",
                                                isDark ? "text-white/40" : "text-[#0C1024]/40"
                                            )} />
                                            <span className={cn(
                                                isDark ? "text-white/60" : "text-[#0C1024]/60"
                                            )}>
                                                {activity.time}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </div>
        </GridBackground>
    );
}
