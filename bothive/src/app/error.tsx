"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Home, ShieldAlert, WifiOff } from "lucide-react";
import Link from "next/link";
import { GridBackground } from "@/components/ui/grid-background";
import { GlassCard } from "@/components/ui/glass-card";

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Boundary caught:", error);
    }, [error]);

    return (
        <GridBackground className="min-h-screen bg-[#070910] text-white flex items-center justify-center p-6">
            <div className="max-w-xl w-full">
                <GlassCard variant="default" withGrid={true} className="text-center space-y-8 py-16">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto"
                    >
                        <ShieldAlert className="w-12 h-12 text-red-500" />
                    </motion.div>

                    <div className="space-y-3">
                        <h1 className="text-3xl font-bold tracking-tight uppercase">Neural Link Severed</h1>
                        <p className="text-white/50 text-lg">
                            An unexpected anomaly has occurred in the swarm coordination layer.
                        </p>
                    </div>

                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-left font-mono text-xs overflow-auto max-h-[150px] custom-scrollbar">
                        <p className="text-red-400 mb-1 font-bold">Error Signature:</p>
                        <p className="text-white/40">{error.message || "Unknown cognitive dissonance detected."}</p>
                        {error.digest && <p className="text-white/20 mt-2">Digest: {error.digest}</p>}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <button
                            onClick={reset}
                            className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-all"
                        >
                            <RefreshCcw className="w-4 h-4" />
                            Attempt Re-sync
                        </button>
                        <Link href="/">
                            <button className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                                <Home className="w-4 h-4" />
                                Return to Command
                            </button>
                        </Link>
                    </div>

                    <p className="text-[10px] text-white/20 uppercase tracking-[0.3em]">
                        Standard Recovery Protocol 04-B
                    </p>
                </GlassCard>
            </div>
        </GridBackground>
    );
}
