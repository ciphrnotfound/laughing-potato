"use client";

import { ReactNode } from "react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
    children?: ReactNode;
    className?: string;
    variant?: "subtle" | "normal" | "prominent";
    withRadialGlow?: boolean;
    glowColor?: "purple" | "blue" | "custom";
    customGlowColor?: string;
}

export function GridBackground({
    children,
    className,
    variant = "normal",
    withRadialGlow = true,
    glowColor = "purple",
    customGlowColor,
}: GridBackgroundProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Grid opacity based on variant
    const gridOpacity = {
        subtle: isDark ? 0.25 : 0.35,
        normal: isDark ? 0.40 : 0.70,
        prominent: isDark ? 0.60 : 0.85,
    };

    // Grid overlay class
    const gridOverlayClass = cn(
        "absolute inset-0 bg-[length:64px_64px]",
        isDark
            ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,rgba(12,16,36,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(12,16,36,0.08)_1px,transparent_1px)]"
    );

    // Radial glow based on color
    const getRadialGlow = () => {
        if (customGlowColor) {
            return `radial-gradient(circle at center, ${customGlowColor}, transparent 70%)`;
        }

        if (glowColor === "purple") {
            return isDark
                ? "radial-gradient(circle at center, rgba(108, 67, 255, 0.28), transparent 70%)"
                : "radial-gradient(circle at center, rgba(99, 109, 255, 0.22), transparent 70%)";
        }

        if (glowColor === "blue") {
            return isDark
                ? "radial-gradient(circle at center, rgba(59, 130, 246, 0.28), transparent 70%)"
                : "radial-gradient(circle at center, rgba(59, 130, 246, 0.18), transparent 70%)";
        }

        return "";
    };

    const radialGlowStyle = withRadialGlow ? {
        background: getRadialGlow(),
    } : {};

    return (
        <div className={cn("relative min-h-screen overflow-hidden", className)}>
            {/* Grid overlay */}
            <div className="pointer-events-none absolute inset-0">
                {withRadialGlow && (
                    <div
                        className="absolute inset-x-0 top-[-240px] h-[520px] rounded-full"
                        style={radialGlowStyle}
                    />
                )}
                <div
                    className={gridOverlayClass}
                    style={{ opacity: gridOpacity[variant] }}
                />
            </div>

            {/* Content */}
            {children}
        </div>
    );
}
