import React from "react";

export const HiveLangLogo = ({ className = "w-10 h-10" }: { className?: string }) => {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="brandGradient" x1="0" y1="0" x2="100" y2="100">
                    <stop offset="0%" stopColor="#8b5cf6" /> {/* Violet-500 */}
                    <stop offset="100%" stopColor="#6d28d9" /> {/* Violet-700 */}
                </linearGradient>
            </defs>

            {/* Modern Soft Hexagon */}
            <path
                d="M50 10 L88 32 V76 L50 98 L12 76 V32 L50 10 Z"
                fill="url(#brandGradient)"
                fillOpacity="0.1"
                stroke="url(#brandGradient)"
                strokeWidth="4"
                strokeLinejoin="round"
            />

            {/* Abstract 'H' / Node connection in center */}
            <path
                d="M38 35 V65"
                stroke="url(#brandGradient)"
                strokeWidth="6"
                strokeLinecap="round"
            />
            <path
                d="M62 35 V65"
                stroke="url(#brandGradient)"
                strokeWidth="6"
                strokeLinecap="round"
            />
            <path
                d="M38 50 H62"
                stroke="url(#brandGradient)"
                strokeWidth="6"
                strokeLinecap="round"
            />

            {/* Tech Dots */}
            <circle cx="20" cy="50" r="3" fill="#a78bfa" />
            <circle cx="80" cy="50" r="3" fill="#a78bfa" />

        </svg>
    );
};
