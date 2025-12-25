"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useTheme } from "@/lib/theme-context";
import { NotificationPopover } from "@/components/NotificationPopover";
import { UserNav } from "@/components/UserNav";

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
            {/* Subtle gradient overlay with Christmas colors */}
            <div className={cn(
                "fixed inset-0 pointer-events-none",
                isDark
                    ? "bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.03),transparent_30%),radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.03),transparent_30%)]"
                    : "bg-[radial-gradient(ellipse_at_top,rgba(220,38,38,0.04),transparent_30%),radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.04),transparent_30%)]"
            )} />

            <div className={cn("relative z-10 p-6 md:p-8", className)}>
                <div className="max-w-7xl mx-auto w-full">
                    <header className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex-1"
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

                        {/* Right side Actions */}
                        <div className="flex items-center gap-3">
                            <NotificationPopover />
                            <UserNav />

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
                        </div>
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
