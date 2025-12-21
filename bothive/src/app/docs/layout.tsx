import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Documentation — Mastering Bothive & HiveLang",
    description: "Comprehensive guides, API references, and conceptual deep-dives for building autonomous AI agents on the Bothive platform.",
    openGraph: {
        title: "Bothive Docs — Build Your AI Workforce",
        description: "Everything you need to know about setting up, scaling, and managing AI agents.",
        url: "https://bothive.cloud/docs",
    },
};

import { DocsSidebar } from "@/components/DocsSidebar";
import ThemeToggle from "@/components/ThemeToggle";

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#020205] text-white">
            <div className="border-b border-white/5 sticky top-0 z-50 bg-[#020205]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <a href="/" className="font-bold text-lg tracking-tight">BotHive <span className="text-violet-500">Docs</span></a>
                        <nav className="hidden md:flex gap-6 text-sm font-medium text-white/60">
                            <a href="/docs" className="hover:text-white transition-colors">API</a>
                            <a href="/docs" className="hover:text-white transition-colors">CLI</a>
                            <a href="/docs" className="hover:text-white transition-colors">Cloud</a>
                        </nav>
                    </div>
                    <ThemeToggle />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex gap-12">
                    <DocsSidebar />
                    <main className="flex-1 min-w-0 max-w-4xl">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
