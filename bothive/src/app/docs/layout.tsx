"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Book,
    Code2,
    Terminal,
    Zap,
    Boxes,
    Layers,
    ChevronRight,
    Menu,
    X
} from "lucide-react";
import { useState } from "react";
import Navbar2 from "@/components/Navbar2";
import Footer from "@/components/Footer";

const DOCS_SIDEBAR = [
    {
        title: "Getting Started",
        icon: Zap,
        items: [
            { title: "Introduction", href: "/docs" },
            { title: "Quick Start", href: "/docs/quick-start" },
            { title: "Installation", href: "/docs/installation" },
        ]
    },
    {
        title: "HiveLang SDK",
        icon: Code2,
        items: [
            { title: "Overview", href: "/docs/hivelang" }, // This is the revamped page
            { title: "Define a Bot", href: "/docs/hivelang/bots" },
            { title: "Integrations", href: "/docs/hivelang/integrations" },
            { title: "Capabilities", href: "/docs/hivelang/capabilities" },
        ]
    },
    {
        title: "Core Concepts",
        icon: Layers,
        items: [
            { title: "Agents vs Bots", href: "/docs/concepts/agents" },
            { title: "Memory & State", href: "/docs/concepts/memory" },
            { title: "Tool Execution", href: "/docs/concepts/tools" },
        ]
    },
    {
        title: "Integrations",
        icon: Boxes,
        items: [
            { title: "Notion", href: "/docs/integrations/notion" },
            { title: "Linear", href: "/docs/integrations/linear" },
            { title: "Slack", href: "/docs/integrations/slack" },
        ]
    },
];

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#020202] text-white selection:bg-violet-500/30 font-sans flex flex-col">
            <Navbar2 />

            <div className="flex-1 max-w-[1600px] w-full mx-auto flex pt-20">

                {/* Sidebar - Desktop */}
                <aside className="hidden lg:block w-72 shrink-0 border-r border-white/5 h-[calc(100vh-80px)] sticky top-20 overflow-y-auto p-6 scrollbar-hide">
                    <nav className="space-y-8">
                        {DOCS_SIDEBAR.map((section) => (
                            <div key={section.title}>
                                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white/90">
                                    <section.icon className="w-4 h-4 text-violet-400" />
                                    {section.title}
                                </div>
                                <ul className="space-y-1 border-l border-white/5 ml-2 pl-4">
                                    {section.items.map((item) => {
                                        const isActive = pathname === item.href;
                                        return (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    className={cn(
                                                        "block text-sm py-1.5 transition-colors duration-200",
                                                        isActive
                                                            ? "text-violet-300 font-medium"
                                                            : "text-white/50 hover:text-white"
                                                    )}
                                                >
                                                    {item.title}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Mobile Header */}
                <div className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-[#020202]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-white/70">Documentation</span>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Sidebar - Mobile Overlay */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 top-[120px] z-30 bg-[#020202] overflow-y-auto p-6 animate-in slide-in-from-left-5">
                        <nav className="space-y-8 pb-20">
                            {DOCS_SIDEBAR.map((section) => (
                                <div key={section.title}>
                                    <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-white/90">
                                        <section.icon className="w-4 h-4 text-violet-400" />
                                        {section.title}
                                    </div>
                                    <ul className="space-y-1 border-l border-white/5 ml-2 pl-4">
                                        {section.items.map((item) => (
                                            <li key={item.href}>
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className={cn(
                                                        "block text-sm py-2",
                                                        pathname === item.href ? "text-violet-300" : "text-white/50"
                                                    )}
                                                >
                                                    {item.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </div>
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0 lg:pt-10 pb-20 px-6 lg:px-12">
                    <div className="max-w-4xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* <Footer /> */}
        </div>
    );
}
