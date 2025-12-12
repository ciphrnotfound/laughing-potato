"use client";

import { useEffect, useState } from "react";
import { Shield, Crown, Star, Zap, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserBadgeProps {
    userId: string;
    email?: string;
    className?: string;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
}

interface VerificationStatus {
    isVerified: boolean;
    isFounder: boolean;
    isPremium: boolean;
    isTopContributor: boolean;
}

export function UserBadge({
    userId,
    email,
    className,
    showLabel = true,
    size = "md"
}: UserBadgeProps) {
    const [status, setStatus] = useState<VerificationStatus>({
        isVerified: false,
        isFounder: false,
        isPremium: false,
        isTopContributor: false,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchVerification() {
            try {
                const params = new URLSearchParams();
                if (email) params.append('email', email);

                const response = await fetch(`/api/users/${userId}/verification?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    setStatus(data);
                }
            } catch (error) {
                console.error('Failed to fetch verification status:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchVerification();
    }, [userId, email]);

    if (loading) return null;

    const sizeClasses = {
        sm: "text-[10px] px-1.5 py-0.5 gap-1",
        md: "text-xs px-2 py-1 gap-1.5",
        lg: "text-sm px-3 py-1.5 gap-2"
    };

    const iconSizes = {
        sm: "h-2.5 w-2.5",
        md: "h-3 w-3",
        lg: "h-3.5 w-3.5"
    };

    const badges = [];

    if (status.isFounder) {
        badges.push({
            icon: Crown,
            label: "Founder",
            gradient: "from-amber-400 via-yellow-500 to-amber-600",
            bgGradient: "from-amber-500/20 via-yellow-500/10 to-amber-600/20",
            borderColor: "border-amber-500/50",
            glowColor: "shadow-amber-500/50",
            textColor: "text-amber-300",
        });
    }

    if (status.isPremium) {
        badges.push({
            icon: Sparkles,
            label: "Premium",
            gradient: "from-purple-400 via-pink-500 to-purple-600",
            bgGradient: "from-purple-500/20 via-pink-500/10 to-purple-600/20",
            borderColor: "border-purple-500/50",
            glowColor: "shadow-purple-500/50",
            textColor: "text-purple-300",
        });
    }

    if (status.isVerified) {
        badges.push({
            icon: Shield,
            label: "Verified",
            gradient: "from-blue-400 via-cyan-500 to-blue-600",
            bgGradient: "from-blue-500/20 via-cyan-500/10 to-blue-600/20",
            borderColor: "border-blue-500/50",
            glowColor: "shadow-blue-500/50",
            textColor: "text-blue-300",
        });
    }

    if (status.isTopContributor) {
        badges.push({
            icon: Star,
            label: "Top Contributor",
            gradient: "from-green-400 via-emerald-500 to-green-600",
            bgGradient: "from-green-500/20 via-emerald-500/10 to-green-600/20",
            borderColor: "border-green-500/50",
            glowColor: "shadow-green-500/50",
            textColor: "text-green-300",
        });
    }

    if (badges.length === 0) return null;

    return (
        <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
            {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                    <div
                        key={index}
                        className={cn(
                            "relative flex items-center rounded-full font-semibold border backdrop-blur-sm",
                            "transition-all duration-300 hover:scale-105",
                            "shadow-lg",
                            sizeClasses[size],
                            badge.borderColor,
                            badge.glowColor
                        )}
                        style={{
                            background: `linear-gradient(135deg, ${badge.bgGradient.split(' ').join(', ')})`,
                        }}
                    >
                        {/* Animated glow effect */}
                        <div
                            className={cn(
                                "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity blur-md -z-10",
                                `bg-gradient-to-r ${badge.gradient}`
                            )}
                        />

                        {/* Icon with gradient */}
                        <div className={cn("relative", iconSizes[size])}>
                            <Icon className={cn("w-full h-full", badge.textColor)} />
                        </div>

                        {/* Label */}
                        {showLabel && (
                            <span className={cn(
                                "font-bold tracking-wide",
                                badge.textColor
                            )}>
                                {badge.label}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
