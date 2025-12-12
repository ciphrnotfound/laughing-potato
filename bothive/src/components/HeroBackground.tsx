"use client";

import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { cn } from "@/lib/utils";

interface HeroBackgroundProps {
    children: React.ReactNode;
    className?: string;
}

export const HeroBackground = ({ children, className }: HeroBackgroundProps) => {
    return (
        <div className={cn("relative min-h-screen w-full overflow-hidden bg-white dark:bg-black transition-colors duration-500", className)}>
            {/* Dark Mode Background */}
            <div className="absolute inset-0 z-0 hidden dark:block">
                <BackgroundRippleEffect />
            </div>

            {/* Light Mode Background */}
            <div className="absolute inset-0 z-0 block dark:hidden">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full w-full">
                {children}
            </div>
        </div>
    );
};
