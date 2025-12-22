"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Home, AlertTriangle, Zap } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error Boundary caught:", error);
    }, [error]);

    return (
        <div className="min-h-screen bg-[#050507] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[200px] animate-pulse" />
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-900/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-900/5 rounded-full blur-[100px]" />
            </div>

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-lg"
            >
                {/* Glass Alert Card */}
                <div className="relative">
                    {/* Outer glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 via-orange-500/10 to-red-500/20 rounded-[2rem] blur-xl opacity-50" />

                    {/* Glass Card */}
                    <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/[0.08] p-8 shadow-2xl overflow-hidden">
                        {/* Inner gradient shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none" />

                        {/* Animated accent line at top */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

                        <div className="relative z-10 text-center space-y-6">
                            {/* Icon with glow */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="relative mx-auto w-20 h-20"
                            >
                                <div className="absolute inset-0 bg-red-500/20 rounded-2xl blur-xl" />
                                <div className="relative w-full h-full bg-gradient-to-br from-red-500/20 to-orange-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl flex items-center justify-center">
                                    <AlertTriangle className="w-10 h-10 text-red-400" />
                                </div>
                            </motion.div>

                            {/* Title & Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <h1 className="text-2xl font-semibold tracking-tight text-white">
                                    Something went wrong
                                </h1>
                                <p className="text-white/40 text-sm leading-relaxed">
                                    An unexpected error occurred. Our systems detected an anomaly in the process.
                                </p>
                            </motion.div>

                            {/* Error Details - Glass Panel */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/[0.05] p-4 text-left"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                                    <span className="text-xs font-medium text-red-400/80 uppercase tracking-wider">Error Details</span>
                                </div>
                                <p className="text-xs font-mono text-white/30 break-all leading-relaxed">
                                    {error.message || "An unknown error occurred. Please try again."}
                                </p>
                                {error.digest && (
                                    <p className="text-[10px] font-mono text-white/15 mt-2">
                                        Trace: {error.digest}
                                    </p>
                                )}
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="flex flex-col sm:flex-row gap-3 pt-2"
                            >
                                <button
                                    onClick={reset}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-medium text-sm hover:bg-neutral-200 transition-all shadow-lg shadow-white/5"
                                >
                                    <RefreshCcw className="w-4 h-4" />
                                    Try Again
                                </button>
                                <Link href="/" className="flex-1">
                                    <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] text-white rounded-xl font-medium text-sm hover:bg-white/[0.1] transition-all">
                                        <Home className="w-4 h-4" />
                                        Go Home
                                    </button>
                                </Link>
                            </motion.div>

                            {/* Status indicator */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center justify-center gap-2 pt-2"
                            >
                                <Zap className="w-3 h-3 text-white/20" />
                                <span className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
                                    Recovery Protocol Active
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
