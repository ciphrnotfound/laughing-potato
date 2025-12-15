"use client";
import React from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export const MacbookScroll = ({
    src,
    showGradient,
    title,
    badge,
}: {
    src?: string;
    showGradient?: boolean;
    title?: string | React.ReactNode;
    badge?: React.ReactNode;
}) => {
    return (
        <div className="flex flex-col items-center justify-center bg-transparent py-20">
            <div className="text-4xl font-bold mb-8 text-neutral-200">{title}</div>
            {badge && <div className="mb-4">{badge}</div>}
            <div className="text-sm text-neutral-500">MacBook Scroll Placeholder</div>
            {/* Simplification: Just showing image if provided */}
            {src && <img src={src} alt="macbook" className="w-[80%] rounded-xl border border-neutral-800" />}
        </div>
    );
};
