"use client";

import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
    name: string;
    description: string;
    icon: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    xpReward: number;
    unlocked: boolean;
    unlockedAt?: string;
    className?: string;
}

const tierColors = {
    bronze: {
        bg: "bg-amber-900/20",
        border: "border-amber-700/50",
        text: "text-amber-500",
        glow: "shadow-amber-500/20",
    },
    silver: {
        bg: "bg-gray-700/20",
        border: "border-gray-500/50",
        text: "text-gray-400",
        glow: "shadow-gray-500/20",
    },
    gold: {
        bg: "bg-yellow-900/20",
        border: "border-yellow-600/50",
        text: "text-yellow-500",
        glow: "shadow-yellow-500/20",
    },
    platinum: {
        bg: "bg-purple-900/20",
        border: "border-purple-600/50",
        text: "text-purple-400",
        glow: "shadow-purple-500/20",
    },
};

export function AchievementCard({
    name,
    description,
    icon,
    tier,
    xpReward,
    unlocked,
    unlockedAt,
    className,
}: AchievementCardProps) {
    const colors = tierColors[tier];

    return (
        <div
            className={cn(
                "relative rounded-lg border p-4 transition-all",
                unlocked
                    ? `${colors.bg} ${colors.border} ${colors.glow} shadow-lg`
                    : "bg-zinc-900/50 border-zinc-800 opacity-60",
                className
            )}
        >
            {/* Unlock indicator */}
            <div className="absolute top-2 right-2">
                {unlocked ? (
                    <Trophy className={cn("h-5 w-5", colors.text)} />
                ) : (
                    <Lock className="h-5 w-5 text-zinc-600" />
                )}
            </div>

            {/* Icon */}
            <div className="mb-3 text-4xl">{icon}</div>

            {/* Title */}
            <h3
                className={cn(
                    "font-semibold text-lg mb-1",
                    unlocked ? colors.text : "text-zinc-500"
                )}
            >
                {name}
            </h3>

            {/* Description */}
            <p className="text-sm text-zinc-400 mb-3">{description}</p>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
                <span className={cn("font-medium", unlocked ? colors.text : "text-zinc-600")}>
                    +{xpReward} XP
                </span>
                {unlocked && unlockedAt && (
                    <span className="text-zinc-500">
                        {new Date(unlockedAt).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>
    );
}
