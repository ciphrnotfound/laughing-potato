"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useTheme } from "@/lib/theme-context";

// Christmas Lights Component
export function ChristmasLights() {
    return (
        <div className="fixed top-0 left-0 right-0 h-10 w-full z-[50] pointer-events-none flex justify-between overflow-hidden">
            <div className="absolute top-[-5px] left-0 w-full h-8 flex justify-around">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "w-3 h-3 rounded-full shadow-lg relative top-[1px] animate-pulse",
                            i % 4 === 0 ? "bg-red-500 shadow-red-500/50" :
                                i % 4 === 1 ? "bg-green-500 shadow-green-500/50" :
                                    i % 4 === 2 ? "bg-yellow-400 shadow-yellow-400/50" : "bg-blue-500 shadow-blue-500/50"
                        )}
                        style={{
                            animationDuration: `${1 + Math.random()}s`,
                            animationDelay: `${Math.random()}s`,
                            top: `${Math.sin(i) * 5 + 5}px` // Wave pattern
                        }}
                    />
                ))}
                <div className="absolute top-[5px] left-0 w-full h-[2px] bg-gray-700/30" />
            </div>
        </div>
    );
}

// Improved Falling Snow Animation Component
export function SnowAnimation() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Increased flake count for "wayy more festive"
    const snowflakes = Array.from({ length: 150 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5, // Faster start
        duration: 5 + Math.random() * 10, // Varied speeds
        size: 2 + Math.random() * 6,
        opacity: 0.4 + Math.random() * 0.6,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[40] select-none">
            {snowflakes.map((flake) => (
                <motion.div
                    key={flake.id}
                    // Use sky blue/gray for light mode, white for dark mode
                    className={cn(
                        "absolute rounded-full drop-shadow-sm",
                        isDark ? "bg-white" : "bg-slate-300"
                    )}
                    style={{
                        left: flake.left,
                        width: flake.size,
                        height: flake.size,
                        opacity: flake.opacity,
                    }}
                    initial={{ top: -20 }}
                    animate={{
                        top: "100vh",
                        x: [0, 50, -50, 0], // More sway
                    }}
                    transition={{
                        duration: flake.duration,
                        delay: flake.delay,
                        repeat: Infinity,
                        ease: "linear",
                        x: {
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        },
                    }}
                />
            ))}
        </div>
    );
}

// Frost Effect Component
export function FrostEffect() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[45] mix-blend-screen opacity-40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(200,230,255,0.15)_100%)]" />
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl opacity-30" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/20 to-transparent rounded-full blur-3xl opacity-30" />
        </div>
    )
}

export default function ChristmasEffects() {
    return (
        <>
            <SnowAnimation />
            <ChristmasLights />
            <FrostEffect />
        </>
    );
}
