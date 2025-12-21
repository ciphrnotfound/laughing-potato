"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Zap,
    Book,
    Code2,
    Terminal,
    Boxes,
    Puzzle,
    Cpu,
    Workflow,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOCS_STRUCTURE = [
    {
        title: "Getting Started",
        items: [
            { title: "Introduction", href: "/docs", icon: Book },
            { title: "Quick Start", href: "/docs/quick-start", icon: Zap },
            { title: "Installation", href: "/docs/installation", icon: Terminal },
        ]
    },
    {
        title: "Core Concepts",
        items: [
            { title: "Hives & Swarms", href: "/docs/concepts/swarms", icon: Boxes },
            { title: "Agent Memory", href: "/docs/concepts/memory", icon: Cpu },
            { title: "Tools & Actions", href: "/docs/concepts/tools", icon: Puzzle },
        ]
    },
    {
        title: "HiveLang",
        items: [
            { title: "Syntax Basics", href: "/docs/hivelang/basics", icon: Code2 },
            { title: "Parallel Execution", href: "/docs/hivelang/parallel", icon: Workflow },
            { title: "Standard Library", href: "/docs/hivelang/stdlib", icon: Book },
        ]
    },
    {
        title: "Integrations",
        items: [
            { title: "Notion", href: "/docs/integrations/notion", icon: Puzzle },
            { title: "Slack", href: "/docs/integrations/slack", icon: Puzzle },
            { title: "GitHub", href: "/docs/integrations/github", icon: Puzzle },
        ]
    }
];

export function DocsSidebar() {
    const pathname = usePathname();

    return (
        <div className="w-64 shrink-0 hidden lg:block border-r border-white/5 h-[calc(100vh-4rem)] sticky top-16 overflow-y-auto pb-10 pr-4">
            {/* Search Bar Placeholder */}
            <div className="relative mb-8 mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                    type="text"
                    placeholder="Search docs..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white/70 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
            </div>

            <nav className="space-y-8">
                {DOCS_STRUCTURE.map((group) => (
                    <div key={group.title} className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 px-3">
                            {group.title}
                        </h4>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center justify-between group px-3 py-2 rounded-lg text-sm transition-all animate-in fade-in slide-in-from-left-2",
                                            isActive
                                                ? "bg-violet-600/10 text-violet-400 border border-violet-500/20"
                                                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 font-medium">
                                            <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-violet-400" : "text-white/30 group-hover:text-white/60")} />
                                            {item.title}
                                        </div>
                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    );
}
