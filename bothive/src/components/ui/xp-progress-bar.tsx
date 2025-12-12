"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface XPProgressBarProps {
    currentXP: number;
    xpToNextLevel: number;
    level: number;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
    animated?: boolean;
}

export function XPProgressBar({
    currentXP,
    xpToNextLevel,
    level,
    showLabel = true,
    size = "md",
    animated = true,
}: XPProgressBarProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const percentage = Math.min(100, (currentXP / xpToNextLevel) * 100);

    // Size-based heights
    const heights = {
        sm: "h-2",
        md: "h-3",
        lg: "h-4",
    };

    return (
        <div className="w-full space-y-2">
            {showLabel && (
                <div className="flex items-center justify-between text-sm">
                    <span className={cn(
                        "font-medium",
                        isDark ? "text-white/70" : "text-[#0C1024]/70"
                    )}>
                        Level {level}
                    </span>
                    <span className={cn(
                        "text-xs",
                        isDark ? "text-white/50" : "text-[#0C1024]/50"
                    )}>
                        {currentXP} / {xpToNextLevel} XP
                    </span>
                </div>
            )}

            {/* Progress bar container */}
            <div className={cn(
                "relative w-full rounded-full overflow-hidden",
                heights[size],
                isDark ? "bg-white/10" : "bg-[#E9EEFF]"
            )}>
                {/* Progress fill */}
                <motion.div
                    className={cn(
                        "h-full rounded-full",
                        "bg-linear-to-r from-[#6C43FF] to-[#8A63FF]",
                        "shadow-[0_0_20px_rgba(108,67,255,0.5)]"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{
                        duration: animated ? 1 : 0,
                        ease: "easeOut",
                        delay: 0.2,
                    }}
                />

                {/* Shimmer effect */}
                {animated && percentage > 0 && percentage < 100 && (
                    <motion.div
                        className="absolute inset-y-0 w-32 bg-linear-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                            x: ['-100%', '400%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "linear",
                        }}
                    />
                )}
            </div>
        </div>
    );
}
