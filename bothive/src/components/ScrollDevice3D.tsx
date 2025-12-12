"use client";

import React, { useRef, memo, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

interface ScrollDevice3DProps {
    videoUrl?: string;
    imageUrl?: string;
    className?: string;
}

// Memoized video component for performance
const ScreenContent = memo(function ScreenContent({
    videoUrl,
    imageUrl
}: {
    videoUrl?: string;
    imageUrl?: string;
}) {
    if (videoUrl) {
        return (
            <video
                src={videoUrl}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
            />
        );
    }

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt="Product preview"
                className="w-full h-full object-cover"
            />
        );
    }

    return (
        <div className="w-full h-full bg-gradient-to-br from-violet-900/50 via-[#0a0a0f] to-purple-900/30 flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl font-bold text-white/20 tracking-tighter">BOTHIVE</div>
                <div className="text-sm text-white/10 mt-2">Builder Interface</div>
            </div>
        </div>
    );
});

// Floating card component
const FloatingInfoCard = memo(function FloatingInfoCard({
    title,
    description,
    color,
    side,
    opacity,
    x,
}: {
    title: string;
    description: string;
    color: string;
    side: "left" | "right";
    opacity: MotionValue<number>;
    x: MotionValue<number>;
}) {
    return (
        <motion.div
            style={{ opacity, x }}
            className={`absolute ${side === "left" ? "left-[5%]" : "right-[5%]"} top-1/2 -translate-y-1/2 hidden lg:block`}
        >
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 max-w-[200px]">
                <div className={`text-xs font-medium mb-1 ${color}`}>{title}</div>
                <div className="text-sm text-white/60">{description}</div>
            </div>
        </motion.div>
    );
});

function ScrollDevice3D({ videoUrl, imageUrl, className = "" }: ScrollDevice3DProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    // Optimized spring config - less stiff for better performance
    const springConfig = useMemo(() => ({
        stiffness: 50,
        damping: 20,
        restDelta: 0.01
    }), []);

    const smoothProgress = useSpring(scrollYProgress, springConfig);

    // Memoize transform calculations
    const rotateX = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [30, 0, 0, -10]);
    const rotateY = useTransform(smoothProgress, [0, 0.5, 1], [-10, 0, 8]);
    const scale = useTransform(smoothProgress, [0, 0.3, 0.7, 1], [0.85, 1, 1, 0.92]);
    const y = useTransform(smoothProgress, [0, 0.5, 1], [80, 0, -40]);
    const opacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0.6]);
    const glowOpacity = useTransform(smoothProgress, [0.2, 0.5, 0.8], [0, 0.5, 0]);

    // Info card transforms
    const leftCardOpacity = useTransform(smoothProgress, [0.3, 0.45], [0, 1]);
    const leftCardX = useTransform(smoothProgress, [0.3, 0.45], [-30, 0]);
    const rightCardOpacity = useTransform(smoothProgress, [0.4, 0.55], [0, 1]);
    const rightCardX = useTransform(smoothProgress, [0.4, 0.55], [30, 0]);

    return (
        <section
            ref={containerRef}
            className={`relative min-h-[180vh] ${className}`}
        >
            {/* Sticky container */}
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden py-16">
                {/* Background glow - simplified */}
                <motion.div
                    style={{ opacity: glowOpacity }}
                    className="absolute inset-0 pointer-events-none will-change-opacity"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-violet-500/15 rounded-full blur-[120px]" />
                </motion.div>

                {/* 3D Device - optimized with will-change */}
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        scale,
                        y,
                        opacity,
                    }}
                    className="relative will-change-transform"
                >
                    {/* Laptop body */}
                    <div
                        className="relative"
                        style={{
                            transformStyle: "preserve-3d",
                            perspective: "1000px",
                        }}
                    >
                        {/* Screen frame */}
                        <div
                            className="relative bg-[#1a1a1a] rounded-t-xl p-2 pb-0"
                            style={{
                                boxShadow: "0 -15px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
                            }}
                        >
                            {/* Screen bezel */}
                            <div className="relative bg-[#0a0a0a] rounded-lg overflow-hidden">
                                {/* Camera notch */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#1a1a1a] z-10" />

                                {/* Screen content */}
                                <div className="relative aspect-[16/10] w-[750px] max-w-[85vw] overflow-hidden">
                                    <ScreenContent videoUrl={videoUrl} imageUrl={imageUrl} />

                                    {/* Screen reflection */}
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Laptop base */}
                        <div
                            className="relative h-3 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-b-xl"
                            style={{
                                transformOrigin: "top center",
                                transform: "rotateX(-80deg) translateZ(1px)",
                                boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
                            }}
                        >
                            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-[#3a3a3a] rounded-full" />
                        </div>

                        {/* Shadow */}
                        <div
                            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-6 bg-black/25 blur-lg rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Floating info cards */}
                <FloatingInfoCard
                    title="Visual Builder"
                    description="Drag and drop interface for building AI agents"
                    color="text-violet-400"
                    side="left"
                    opacity={leftCardOpacity}
                    x={leftCardX}
                />
                <FloatingInfoCard
                    title="Real-time Testing"
                    description="Test your agents instantly in the playground"
                    color="text-emerald-400"
                    side="right"
                    opacity={rightCardOpacity}
                    x={rightCardX}
                />
            </div>
        </section>
    );
}

export default memo(ScrollDevice3D);
