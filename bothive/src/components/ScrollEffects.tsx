"use client";

import React, { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

// ============================================
// 1. PARALLAX TEXT REVEAL - Big text that fades in as you scroll
// ============================================

interface TextRevealProps {
    children: ReactNode;
    className?: string;
}

export function TextReveal({ children, className = "" }: TextRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.9", "end 0.3"]
    });

    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.3]);
    const y = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30]);
    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98]);

    return (
        <motion.div
            ref={ref}
            style={{ opacity, y, scale }}
            className={`will-change-transform ${className}`}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// 2. PARALLAX CONTAINER - Elements move at different speeds
// ============================================

interface ParallaxLayerProps {
    children: ReactNode;
    speed?: number; // -1 to 1, negative = slower, positive = faster
    className?: string;
}

export function ParallaxLayer({ children, speed = 0.5, className = "" }: ParallaxLayerProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

    return (
        <motion.div
            ref={ref}
            style={{ y }}
            className={`will-change-transform ${className}`}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// 3. STAGGERED FADE IN - Cards/items fade in one by one
// ============================================

interface StaggeredFadeProps {
    children: ReactNode[];
    className?: string;
    staggerDelay?: number;
}

export function StaggeredFade({ children, className = "", staggerDelay = 0.1 }: StaggeredFadeProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.8", "start 0.3"]
    });

    return (
        <div ref={ref} className={className}>
            {React.Children.map(children, (child, index) => {
                const start = index * staggerDelay;
                const end = start + 0.3;

                return (
                    <StaggeredItem
                        key={index}
                        progress={scrollYProgress}
                        start={Math.min(start, 0.7)}
                        end={Math.min(end, 1)}
                    >
                        {child}
                    </StaggeredItem>
                );
            })}
        </div>
    );
}

function StaggeredItem({
    children,
    progress,
    start,
    end
}: {
    children: ReactNode;
    progress: any;
    start: number;
    end: number;
}) {
    const opacity = useTransform(progress, [start, end], [0, 1]);
    const y = useTransform(progress, [start, end], [40, 0]);

    return (
        <motion.div style={{ opacity, y }} className="will-change-transform">
            {children}
        </motion.div>
    );
}

// ============================================
// 4. SCROLL PROGRESS LINE - Horizontal line that grows
// ============================================

interface ScrollProgressProps {
    className?: string;
    color?: string;
}

export function ScrollProgress({ className = "", color = "bg-violet-500" }: ScrollProgressProps) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    return (
        <motion.div
            style={{ scaleX, transformOrigin: "left" }}
            className={`fixed top-0 left-0 right-0 h-1 ${color} z-50 ${className}`}
        />
    );
}

// ============================================
// 5. FLOATING ELEMENTS - Items that float with scroll
// ============================================

interface FloatingElementProps {
    children: ReactNode;
    className?: string;
    xRange?: [number, number];
    yRange?: [number, number];
    rotateRange?: [number, number];
}

export function FloatingElement({
    children,
    className = "",
    xRange = [-20, 20],
    yRange = [-30, 30],
    rotateRange = [-5, 5],
}: FloatingElementProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const x = useTransform(scrollYProgress, [0, 1], xRange);
    const y = useTransform(scrollYProgress, [0, 1], yRange);
    const rotate = useTransform(scrollYProgress, [0, 1], rotateRange);

    return (
        <motion.div
            ref={ref}
            style={{ x, y, rotate }}
            className={`will-change-transform ${className}`}
        >
            {children}
        </motion.div>
    );
}

// ============================================
// 6. MASK TEXT REVEAL - Text revealed through a mask
// ============================================

interface MaskRevealProps {
    text: string;
    className?: string;
}

export function MaskReveal({ text, className = "" }: MaskRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.8", "start 0.2"]
    });

    const clipPath = useTransform(
        scrollYProgress,
        [0, 1],
        ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]
    );

    return (
        <div ref={ref} className={`relative ${className}`}>
            {/* Background text (faded) */}
            <div className="text-white/10">{text}</div>
            {/* Revealed text (clipped) */}
            <motion.div
                style={{ clipPath }}
                className="absolute inset-0 text-white"
            >
                {text}
            </motion.div>
        </div>
    );
}

// ============================================
// 7. SCROLL-TRIGGERED COUNTER - Numbers that count up
// ============================================

interface CounterProps {
    from?: number;
    to: number;
    suffix?: string;
    prefix?: string;
    className?: string;
    duration?: number;
}

export function ScrollCounter({
    from = 0,
    to,
    suffix = "",
    prefix = "",
    className = "",
    duration = 2
}: CounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const [hasAnimated, setHasAnimated] = React.useState(false);
    const [count, setCount] = React.useState(from);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start 0.8", "start 0.5"]
    });

    React.useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (value) => {
            if (value > 0.1 && !hasAnimated) {
                setHasAnimated(true);
                // Animate count
                const startTime = Date.now();
                const animate = () => {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.floor(from + (to - from) * eased));

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };
                requestAnimationFrame(animate);
            }
        });

        return unsubscribe;
    }, [scrollYProgress, from, to, duration, hasAnimated]);

    return (
        <span ref={ref} className={className}>
            {prefix}{count}{suffix}
        </span>
    );
}

// ============================================
// 8. HORIZONTAL SCROLL SECTION
// ============================================

interface HorizontalScrollProps {
    children: ReactNode;
    className?: string;
}

export function HorizontalScroll({ children, className = "" }: HorizontalScrollProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

    return (
        <section ref={containerRef} className={`relative h-[300vh] ${className}`}>
            <div className="sticky top-0 h-screen flex items-center overflow-hidden">
                <motion.div
                    style={{ x }}
                    className="flex gap-8 will-change-transform"
                >
                    {children}
                </motion.div>
            </div>
        </section>
    );
}

// ============================================
// 9. ZOOM INTO SECTION
// ============================================

interface ZoomSectionProps {
    children: ReactNode;
    className?: string;
}

export function ZoomSection({ children, className = "" }: ZoomSectionProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "start start"]
    });

    const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    return (
        <motion.div
            ref={ref}
            style={{ scale, opacity }}
            className={`will-change-transform ${className}`}
        >
            {children}
        </motion.div>
    );
}
