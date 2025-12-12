"use client";

import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface GlassCardProps extends Omit<MotionProps, 'children'> {
    children: ReactNode;
    className?: string;
    variant?: "default" | "highlighted" | "interactive";
    withGrid?: boolean;
    withRadialGlow?: boolean;
    glowPosition?: "top" | "bottom" | "center";
    size?: "sm" | "md" | "lg";
    noPadding?: boolean;
    onClick?: () => void;
}

export function GlassCard({
    children,
    className,
    variant = "default",
    withGrid = true,
    withRadialGlow = false,
    glowPosition = "top",
    size = "md",
    noPadding = false,
    onClick,
    ...motionProps
}: GlassCardProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Padding based on size
    const padding = {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    // Border radius based on size
    const borderRadius = {
        sm: "rounded-xl",
        md: "rounded-2xl",
        lg: "rounded-3xl",
    };

    // Card shell background and border
    const cardShellClass = cn(
        "pointer-events-none absolute inset-0 backdrop-blur-xl transition-all duration-500",
        borderRadius[size],
        isDark
            ? "border-white/12 bg-[#0C1323]/80 shadow-[0_48px_120px_rgba(12,15,35,0.55)]"
            : "border-[#B8C4FF]/40 bg-white/85 shadow-[0_44px_110px_rgba(88,112,255,0.18)]",
        variant === "highlighted" && (
            isDark
                ? "border-[#6C43FF]/30 shadow-[0_48px_120px_rgba(108,67,255,0.35)]"
                : "border-[#7F92FF]/50 shadow-[0_44px_110px_rgba(127,146,255,0.25)]"
        ),
        "border"
    );

    // Grid overlay
    const gridOverlayClass = cn(
        "absolute inset-0 bg-[length:40px_40px] mix-blend-screen",
        borderRadius[size],
        isDark
            ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,rgba(14,20,48,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,20,48,0.08)_1px,transparent_1px)]"
    );

    // Radial glow
    const radialGlowClass = cn(
        "absolute inset-0",
        borderRadius[size],
        glowPosition === "top" && (
            isDark
                ? "bg-[radial-gradient(circle_at_top,rgba(124,68,255,0.22),transparent_70%)]"
                : "bg-[radial-gradient(circle_at_top,rgba(104,120,255,0.18),transparent_72%)]"
        ),
        glowPosition === "bottom" && (
            isDark
                ? "bg-[radial-gradient(circle_at_bottom,rgba(124,68,255,0.22),transparent_70%)]"
                : "bg-[radial-gradient(circle_at_bottom,rgba(104,120,255,0.18),transparent_72%)]"
        ),
        glowPosition === "center" && (
            isDark
                ? "bg-[radial-gradient(circle_at_center,rgba(124,68,255,0.22),transparent_70%)]"
                : "bg-[radial-gradient(circle_at_center,rgba(104,120,255,0.18),transparent_72%)]"
        )
    );

    // Container class
    const containerClass = cn(
        "relative group",
        borderRadius[size],
        variant === "interactive" && "cursor-pointer",
        className
    );

    // Content wrapper
    const contentClass = cn(
        "relative z-10",
        !noPadding && padding[size]
    );

    // Hover effects for interactive variant
    const hoverScale = variant === "interactive" ? 1.02 : 1;
    const hoverY = variant === "interactive" ? -2 : 0;

    return (
        <motion.div
            className={containerClass}
            onClick={onClick}
            whileHover={variant === "interactive" ? { scale: hoverScale, y: hoverY } : undefined}
            whileTap={variant === "interactive" ? { scale: 0.98 } : undefined}
            {...motionProps}
        >
            {/* Card shell with glass morphism */}
            <div className={cardShellClass} />

            {/* Decorative overlays */}
            <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", borderRadius[size])}>
                {withRadialGlow && <div className={radialGlowClass} />}
                {withGrid && <div className={gridOverlayClass} />}
            </div>

            {/* Content */}
            <div className={contentClass}>
                {children}
            </div>
        </motion.div>
    );
}
