"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";

export const SpotlightCard = ({ children, className = "", spotlightColor = "rgba(139, 92, 246, 0.15)" }: { children: React.ReactNode; className?: string; spotlightColor?: string }) => {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const position = useRef({ x: 0, y: 0 });
    const opacity = useRef(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;

        const div = divRef.current;
        const rect = div.getBoundingClientRect();

        position.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        opacity.current = 1;

        div.style.setProperty("--mouse-x", `${position.current.x}px`);
        div.style.setProperty("--mouse-y", `${position.current.y}px`);
        div.style.setProperty("--spotlight-opacity", `${opacity.current}`);
    };

    const handleFocus = () => {
        setIsFocused(true);
        opacity.current = 1;
    };

    const handleBlur = () => {
        setIsFocused(false);
        opacity.current = 0;
    };

    const handleMouseEnter = () => {
        opacity.current = 1;
    };

    const handleMouseLeave = () => {
        opacity.current = 0;
        if (divRef.current) {
            divRef.current.style.setProperty("--spotlight-opacity", `0`);
        }
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0f] ${className}`}
            style={{
                // @ts-ignore
                "--mouse-x": "0px",
                "--mouse-y": "0px",
                "--spotlight-opacity": "0"
            }}
        >
            <div
                className="pointer-events-none absolute -inset-px opacity-[var(--spotlight-opacity)] transition-opacity duration-300"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), ${spotlightColor}, transparent 40%)`,
                }}
            />
            {children}
        </div>
    );
};
