"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GamifiedGlassAlertProps {
    title: string;
    description: string;
    variant?: "error" | "warning";
    onDismiss?: () => void;
    className?: string;
}

export const GamifiedGlassAlert = ({
    title,
    description,
    variant = "error",
    onDismiss,
    className,
}: GamifiedGlassAlertProps) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                    "relative overflow-hidden rounded-xl border p-4 backdrop-blur-xl",
                    variant === "error"
                        ? "bg-destructive/10 border-destructive/30 shadow-[0_0_30px_-10px_rgba(239,68,68,0.3)]"
                        : "bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]",
                    className
                )}
            >
                {/* Glitch/Noise Effect Overlay (Subtle) */}
                <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none" />

                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none opacity-20" />

                <div className="flex items-start gap-4 relative z-10">
                    <div className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-inner",
                        variant === "error"
                            ? "bg-destructive/20 border-destructive/30 text-destructive"
                            : "bg-yellow-500/20 border-yellow-500/30 text-yellow-500"
                    )}>
                        {variant === "error" ? (
                            <XCircle className="h-5 w-5" />
                        ) : (
                            <AlertTriangle className="h-5 w-5" />
                        )}
                    </div>

                    <div className="flex-1 pt-0.5">
                        <h3 className={cn(
                            "font-bold leading-none tracking-tight mb-1",
                            variant === "error" ? "text-destructive" : "text-yellow-500"
                        )}>
                            {title}
                        </h3>
                        <div className={cn(
                            "text-sm opacity-90",
                            variant === "error" ? "text-destructive/80" : "text-yellow-500/80"
                        )}>
                            {description}
                        </div>
                    </div>

                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className={cn(
                                "absolute -top-1 -right-1 p-2 rounded-lg transition-colors hover:bg-black/10",
                                variant === "error" ? "text-destructive hover:text-destructive/80" : "text-yellow-500 hover:text-yellow-500/80"
                            )}
                        >
                            <span className="sr-only">Dismiss</span>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Animated Border Glow */}
                <div className={cn(
                    "absolute inset-0 rounded-xl pointer-events-none",
                    "shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                )} />
            </motion.div>
        </AnimatePresence>
    );
};
