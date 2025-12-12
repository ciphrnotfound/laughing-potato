"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Zap, TrendingUp, Star, Award, ChevronUp, ChevronDown, Users, Target } from 'lucide-react';
import { HeroBackground } from '@/components/HeroBackground';
import ThemeToggle from '@/components/ThemeToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';

interface LeaderboardUser {
    rank: number;
    id: string;
    username: string;
    avatar: string;
    score: number;
    tasksCompleted: number;
    accuracy: number;
    trend: 'up' | 'down' | 'same';
    trendChange: number;
    level: number;
    badge?: string;
}

// Mock leaderboard data
const mockLeaderboard: LeaderboardUser[] = [
    { rank: 1, id: '1', username: 'CodeMaster2024', avatar: '👑', score: 15420, tasksCompleted: 342, accuracy: 98.5, trend: 'up', trendChange: 2, level: 47, badge: 'legend' },
    { rank: 2, id: '2', username: 'AIWizard', avatar: '🧙', score: 14850, tasksCompleted: 328, accuracy: 97.2, trend: 'up', trendChange: 1, level: 45, badge: 'master' },
    { rank: 3, id: '3', username: 'DataNinja', avatar: '🥷', score: 13990, tasksCompleted: 315, accuracy: 96.8, trend: 'down', trendChange: 1, level: 43, badge: 'master' },
    { rank: 4, id: '4', username: 'QuantumDev', avatar: '⚛️', score: 12775, tasksCompleted: 298, accuracy: 95.3, trend: 'up', trendChange: 3, level: 41 },
    { rank: 5, id: '5', username: 'CyberSage', avatar: '🔮', score: 11650, tasksCompleted: 285, accuracy: 94.7, trend: 'same', trendChange: 0, level: 39 },
    { rank: 6, id: '6', username: 'TechTitan', avatar: '⚡', score: 10890, tasksCompleted: 271, accuracy: 93.9, trend: 'up', trendChange: 2, level: 37 },
    { rank: 7, id: '7', username: 'ByteBeast', avatar: '🦾', score: 9875, tasksCompleted: 258, accuracy: 92.1, trend: 'down', trendChange: 2, level: 35 },
    { rank: 8, id: '8', username: 'CloudChampion', avatar: '☁️', score: 8960, tasksCompleted: 244, accuracy: 91.5, trend: 'up', trendChange: 1, level: 33 },
    { rank: 9, id: '9', username: 'AlgoAce', avatar: '🎯', score: 8245, tasksCompleted: 231, accuracy: 90.2, trend: 'same', trendChange: 0, level: 31 },
    { rank: 10, id: '10', username: 'SyntaxStar', avatar: '✨', score: 7530, tasksCompleted: 218, accuracy: 89.8, trend: 'up', trendChange: 4, level: 29 },
];

const stats = [
    { label: 'Total Players', value: '12,547', icon: Users, color: 'text-blue-500' },
    { label: 'Avg Score', value: '8,450', icon: Target, color: 'text-purple-500' },
    { label: 'Active Today', value: '3,892', icon: Zap, color: 'text-yellow-500' },
    { label: 'Achievements', value: '45,902', icon: Award, color: 'text-emerald-500' },
];

function getRankIcon(rank: number) {
    switch (rank) {
        case 1:
            return <Crown className="w-6 h-6 text-yellow-500" />;
        case 2:
            return <Medal className="w-6 h-6 text-gray-400" />;
        case 3:
            return <Medal className="w-6 h-6 text-amber-700" />;
        default:
            return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
}

function LeaderboardCard({ user, index }: { user: LeaderboardUser; index: number }) {
    const { theme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <GlassCard className={cn(
                'p-5 transition-all duration-300',
                isHovered && 'scale-[1.02] border-primary/50'
            )}>
                <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0 w-12 flex items-center justify-center">
                        {getRankIcon(user.rank)}
                    </div>

                    {/* Avatar + Badge */}
                    <div className="relative">
                        <motion.div
                            className={cn(
                                'w-14 h-14 rounded-xl flex items-center justify-center text-3xl',
                                'bg-gradient-to-br from-primary/20 to-primary/5',
                                'border-2 border-primary/30',
                                isHovered && 'scale-110'
                            )}
                            animate={{
                                boxShadow: isHovered
                                    ? ['0 0 20px rgba(124, 58, 237, 0.3)', '0 0 30px rgba(124, 58, 237, 0.5)', '0 0 20px rgba(124, 58, 237, 0.3)']
                                    : '0 0 0px rgba(124, 58, 237, 0)'
                            }}
                            transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
                        >
                            {user.avatar}
                        </motion.div>
                        {user.badge && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-2 border-background"
                            >
                                <Star className="w-3 h-3 text-white fill-white" />
                            </motion.div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-foreground text-lg truncate">{user.username}</span>
                            {user.badge && (
                                <span className={cn(
                                    'px-2 py-0.5 rounded-full text-xs font-semibold',
                                    user.badge === 'legend' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 'bg-purple-500/20 text-purple-500 border border-purple-500/30'
                                )}>
                                    {user.badge}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                Level {user.level}
                            </span>
                            <span>•</span>
                            <span>{user.tasksCompleted} tasks</span>
                            <span>•</span>
                            <span>{user.accuracy}% accuracy</span>
                        </div>
                    </div>

                    {/* Score + Trend */}
                    <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-primary mb-1">
                            {user.score.toLocaleString()}
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            {user.trend === 'up' && <ChevronUp className="w-4 h-4 text-emerald-500" />}
                            {user.trend === 'down' && <ChevronDown className="w-4 h-4 text-red-500" />}
                            <span className={cn(
                                'text-xs font-medium',
                                user.trend === 'up' && 'text-emerald-500',
                                user.trend === 'down' && 'text-red-500',
                                user.trend === 'same' && 'text-muted-foreground'
                            )}>
                                {user.trend === 'same' ? '—' : `${user.trendChange}`}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Hover Effects */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 pointer-events-none rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            </GlassCard>
        </motion.div>
    );
}

export default function LeaderboardPage() {
    const { theme } = useTheme();

    return (
        <HeroBackground className="min-h-screen w-full overflow-hidden pb-6 pt-16 sm:pt-24">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4 shadow-sm"
                        >
                            <Trophy className="w-4 h-4" />
                            <span>Global Rankings</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl font-bold text-foreground mb-2 tracking-tight"
                        >
                            Leaderboard
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground"
                        >
                            Compete with the best minds in the hive
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <ThemeToggle />
                    </motion.div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <GlassCard className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            'w-12 h-12 rounded-xl flex items-center justify-center',
                                            'bg-gradient-to-br from-primary/20 to-primary/5',
                                            'border border-primary/20'
                                        )}>
                                            <Icon className={cn('w-6 h-6', stat.color)} />
                                        </div>
                                        <div>
                                            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
                    {/* 2nd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="pt-12"
                    >
                        <GlassCard className="p-6 text-center border-gray-400/30">
                            <div className="w-20 h-20 mx-auto mb-3 text-5xl bg-gradient-to-br from-gray-400/20 to-gray-500/10 rounded-2xl flex items-center justify-center border-2 border-gray-400/30">
                                {mockLeaderboard[1].avatar}
                            </div>
                            <Medal className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <div className="font-bold text-foreground mb-1">{mockLeaderboard[1].username}</div>
                            <div className="text-2xl font-bold text-gray-400">{mockLeaderboard[1].score.toLocaleString()}</div>
                        </GlassCard>
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <GlassCard className="p-6 text-center border-yellow-500/40 shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)]">
                            <div className="w-24 h-24 mx-auto mb-3 text-6xl bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 rounded-2xl flex items-center justify-center border-2 border-yellow-500/40">
                                {mockLeaderboard[0].avatar}
                            </div>
                            <Crown className="w-10 h-10 mx-auto mb-2 text-yellow-500" />
                            <div className="font-bold text-foreground mb-1 text-lg">{mockLeaderboard[0].username}</div>
                            <div className="text-3xl font-bold text-yellow-500">{mockLeaderboard[0].score.toLocaleString()}</div>
                        </GlassCard>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="pt-16"
                    >
                        <GlassCard className="p-6 text-center border-amber-700/30">
                            <div className="w-18 h-18 mx-auto mb-3 text-4xl bg-gradient-to-br from-amber-700/20 to-amber-800/10 rounded-2xl flex items-center justify-center border-2 border-amber-700/30">
                                {mockLeaderboard[2].avatar}
                            </div>
                            <Medal className="w-7 h-7 mx-auto mb-2 text-amber-700" />
                            <div className="font-bold text-foreground mb-1 text-sm">{mockLeaderboard[2].username}</div>
                            <div className="text-xl font-bold text-amber-700">{mockLeaderboard[2].score.toLocaleString()}</div>
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Rest of Leaderboard */}
                <div className="space-y-3">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="text-2xl font-bold text-foreground mb-4"
                    >
                        Rankings
                    </motion.h2>
                    {mockLeaderboard.slice(3).map((user, index) => (
                        <LeaderboardCard key={user.id} user={user} index={index + 3} />
                    ))}
                </div>
            </div>
        </HeroBackground>
    );
}
