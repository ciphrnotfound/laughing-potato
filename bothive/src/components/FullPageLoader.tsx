"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FullPageLoader() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
                >
                    {/* Container for the Trimmed Hive Pulse */}
                    <div className="relative flex items-center justify-center">

                        {/* 1. Core Hexagon (Static/Anchoring) - Smaller & Thinner */}
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 100 100"
                            className="absolute pointer-events-none"
                        >
                            <motion.path
                                d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                                fill="none"
                                stroke="#9333ea"
                                strokeWidth="1"
                                strokeOpacity="0.8"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                            />
                        </svg>

                        {/* 2. Echo Hexagon (Pulsing/Ripple) - Faster & subtler */}
                        <motion.svg
                            width="40"
                            height="40"
                            viewBox="0 0 100 100"
                            className="absolute pointer-events-none"
                            initial={{ scale: 1, opacity: 0.4 }}
                            animate={{ scale: 1.6, opacity: 0 }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeOut",
                                delay: 0.2,
                            }}
                        >
                            <path
                                d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
                                fill="none"
                                stroke="#9333ea"
                                strokeWidth="0.5"
                            />
                        </motion.svg>

                        {/* 3. Central Dot - Tiny */}
                        <motion.div
                            className="h-1 w-1 rounded-full bg-white"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
