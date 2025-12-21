"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { useAppSession } from "@/lib/app-session-context";
import ThemeToggle from "@/components/ThemeToggle";
import {
    Bot,
    Sparkles,
    Store,
    Zap,
    Activity,
    ArrowUpRight,
    Gift,
    Rocket,
    GraduationCap,
    BookOpen,
    Search,
    ChevronRight,
    Tag
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { StudyIngestor } from "@/components/student/StudyIngestor";

export default function StudentHub() {
    const { theme } = useTheme();
    const { profile } = useAppSession();
    const isDark = theme === "dark";

    const perks = [
        {
            title: "40% Credit Discount",
            description: "Students get 40% more credits on every purchase. Verified academic status required.",
            icon: Tag,
            color: "text-emerald-500",
            action: "Claim Discount",
            href: "/dashboard/wallet"
        },
        {
            title: "Study Swarms",
            description: "Access specialized agents for LaTeX, Calculus, and Research for free.",
            icon: GraduationCap,
            color: "text-violet-500",
            action: "Open Marketplace",
            href: "/marketplace?category=student"
        }
    ];

    if (!profile) return null;

    return (
        <DashboardPageShell
            title="Student Hub"
            headerAction={<ThemeToggle />}
        >
            <div className="max-w-7xl mx-auto space-y-8 pb-20">

                {/* Standard Welcome Section */}
                <div className={cn(
                    "relative overflow-hidden rounded-3xl p-8 md:p-10",
                    isDark ? "bg-white/[0.02] border border-white/10" : "bg-gradient-to-r from-violet-600/5 to-indigo-600/5 border border-zinc-100"
                )}>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                            Welcome back, <span className="text-[#6C43FF]">{profile.fullName?.split(' ')[0] || 'Scholar'}</span>.
                        </h2>
                        <p className="text-neutral-500 dark:text-neutral-400 max-w-xl text-lg">
                            Your academic workspace is ready. Use your student perks to supercharge your research.
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <GraduationCap className="w-48 h-48" />
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Perks & Integrations */}
                    <div className="lg:col-span-2 space-y-8">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Student Exclusive Perks</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {perks.map((perk, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={cn(
                                        "p-6 rounded-2xl border flex flex-col justify-between group h-full",
                                        isDark ? "bg-white/[0.02] border-white/10 hover:bg-white/[0.05]" : "bg-white border-zinc-100 shadow-sm hover:shadow-md"
                                    )}
                                >
                                    <div>
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", isDark ? "bg-white/5" : "bg-neutral-50")}>
                                            <perk.icon className={cn("w-6 h-6", perk.color)} />
                                        </div>
                                        <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{perk.title}</h4>
                                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                                            {perk.description}
                                        </p>
                                    </div>
                                    <Link
                                        href={perk.href}
                                        className="inline-flex items-center gap-2 text-sm font-bold text-[#6C43FF] group-hover:gap-3 transition-all"
                                    >
                                        {perk.action} <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* Knowledge Utility Card */}
                        <div className={cn(
                            "p-8 rounded-[2.5rem] border",
                            isDark ? "bg-zinc-900/50 border-white/10" : "bg-white border-zinc-100 shadow-sm"
                        )}>
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Study Ingestor</h3>
                                    <p className="text-sm text-neutral-500">Upload your lectures or YouTube links to start a study session.</p>
                                </div>
                                <div className="p-3 bg-violet-500/10 rounded-full text-violet-500">
                                    <Rocket className="w-6 h-6" />
                                </div>
                            </div>
                            <StudyIngestor />
                        </div>
                    </div>

                    {/* Right Column: Quick Stats & Marketplace */}
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white">Active Sessions</h3>
                        <div className={cn(
                            "rounded-2xl border divide-y overflow-hidden",
                            isDark ? "bg-white/[0.02] border-white/10 divide-white/5" : "bg-white border-zinc-100 divide-zinc-50"
                        )}>
                            <div className="p-10 text-center">
                                <Search className="w-12 h-12 text-zinc-300 mx-auto mb-4 opacity-20" />
                                <p className="text-sm text-zinc-500">No active study swarms.</p>
                                <button className="mt-4 text-xs font-bold text-[#6C43FF] hover:underline">Start a new session</button>
                            </div>
                        </div>

                        <div className={cn(
                            "p-8 rounded-2xl border bg-gradient-to-br from-[#6C43FF] to-indigo-700 text-white shadow-xl shadow-violet-500/20",
                            "relative overflow-hidden group"
                        )}>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-20 h-20 text-white" />
                            </div>
                            <h4 className="text-xl font-bold mb-2">Premium Student Bots</h4>
                            <p className="text-violet-100 text-sm mb-6 opacity-80 leading-relaxed">
                                Get access to 50+ specialized bots for university-level subjects.
                            </p>
                            <Link href="/marketplace" className="block w-full py-3 bg-white text-violet-600 rounded-xl font-bold text-center text-sm shadow-lg">
                                Explore Collection
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </DashboardPageShell>
    );
}
