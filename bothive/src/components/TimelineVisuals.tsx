"use client";
import React from "react";
import Image from "next/image";

export const Feature1 = () => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-neutral-900 aspect-video flex items-center justify-center border border-white/10 text-white/50">
                Hive Automation
            </div>
            <div className="rounded-lg bg-neutral-900 aspect-video flex items-center justify-center border border-white/10 text-white/50">
                Neural Processing
            </div>
            <div className="rounded-lg bg-neutral-900 aspect-video flex items-center justify-center border border-white/10 text-white/50">
                Dynamic Scaling
            </div>
            <div className="rounded-lg bg-neutral-900 aspect-video flex items-center justify-center border border-white/10 text-white/50">
                Real-time Analytics
            </div>
        </div>
    );
};

export const Feature2 = () => {
    return (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center text-zinc-500">
                BotHive v2.0 Dashboard
            </div>
        </div>
    );
};

export const Feature3 = () => {
    return (
        <div className="p-4 rounded-xl bg-neutral-900 border border-white/10 text-zinc-400">
            <p>Our advanced swarm intelligence algorithms coordinate thousands of micro-agents to achieve complex goals with minimal latency.</p>
        </div>
    );
};

export const Feature4 = () => {
    return (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-purple-900/50 flex items-center justify-center text-white">
                Global Enterprise Launch
            </div>
        </div>
    );
};
