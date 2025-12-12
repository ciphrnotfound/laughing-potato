"use client";

import React from "react";
import { motion } from "framer-motion";

export const HexGridBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base Grid */}
            <div 
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    maskImage: "linear-gradient(to bottom, black, transparent)",
                }}
            />

            {/* Glowing Hexagons (Animated) */}
            <motion.div 
               animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.1, 1] }}
               transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[100px]"
            />
             <motion.div 
               animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
               transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
               className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px]"
            />
        </div>
    );
}

export const HexagonCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={`relative p-[1px] group ${className}`}>
             {/* Hexagonal Border Gradient */}
             <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-white/5 rounded-2xl md:rounded-[2rem] clip-path-hex" />
             
             <div className="relative h-full bg-[#0a0a0f] rounded-2xl md:rounded-[2rem] overflow-hidden">
                 {/* Inner Glow */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-2xl rounded-full group-hover:bg-violet-500/20 transition-colors" />
                 
                 {children}
             </div>
        </div>
    )
}
