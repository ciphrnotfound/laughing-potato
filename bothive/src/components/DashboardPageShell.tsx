"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useTheme } from "@/lib/theme-context";

interface DashboardPageShellProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    headerAction?: React.ReactNode;
    className?: string;
}

export function DashboardPageShell({
    title,
    description,
    children,
    headerAction,
    className,
}: DashboardPageShellProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className={cn(
            "min-h-screen w-full transition-colors duration-300",
            isDark ? "bg-[#0a0a0f]" : "bg-[#fafafa]"
        )}>
            {/* Subtle gradient overlay */}
            <div className={cn(
                "fixed inset-0 pointer-events-none",
                isDark
                    ? "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.03),transparent_50%)]"
                    : "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.04),transparent_50%)]"
            )} />

            <div className={cn("relative z-10 p-6 md:p-8", className)}>
                <div className="max-w-7xl mx-auto w-full">
                    <header className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className={cn(
                                "text-3xl font-bold tracking-tight mb-1",
                                isDark ? "text-white" : "text-black"
                            )}>
                                {title}
                            </h1>
                            {description && (
                                <p className={cn(
                                    "text-base",
                                    isDark ? "text-white/50" : "text-black/50"
                                )}>
                                    {description}
                                </p>
                            )}
                        </motion.div>
                        {headerAction && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="flex-shrink-0"
                            >
                                {headerAction}
                            </motion.div>
                        )}
                    </header>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
