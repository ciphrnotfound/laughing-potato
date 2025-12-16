"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
    Search,
    Plus,
    Zap,
    Globe,
    Mail,
    MessageSquare,
    Image,
    Code,
    Filter,
    Star,
    ArrowRight
} from "lucide-react";
import { SpotlightCard } from "@/components/ui/ThreeDCard";
import { motion } from "framer-motion";

interface Integration {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon_url: string;
    category: string;
    auth_type: string;
    is_official: boolean;
    is_verified: boolean;
    install_count: number;
    status: string;
    capabilities: Array<{
        name: string;
        description: string;
    }>;
}

const CATEGORIES = [
    { value: "all", label: "All", icon: Globe },
    { value: "productivity", label: "Productivity", icon: Zap },
    { value: "communication", label: "Communication", icon: MessageSquare },
    { value: "media", label: "Media", icon: Image },
    { value: "ai", label: "AI", icon: Code },
    { value: "social", label: "Social", icon: Mail },
] as const;

const CATEGORY_ICONS: Record<string, any> = {
    productivity: Zap,
    communication: MessageSquare,
    media: Image,
    ai: Code,
    social: Mail,
    education: FileTextIcon,
    other: Globe,
};

function FileTextIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
}

export default function IntegrationsPage() {
    const { isDark } = useTheme();
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [showOfficial, setShowOfficial] = useState(false);

    useEffect(() => {
        fetchIntegrations();
    }, [selectedCategory, showOfficial]);

    async function fetchIntegrations() {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (selectedCategory !== "all") params.set("category", selectedCategory);
            if (showOfficial) params.set("official", "true");

            const res = await fetch(`/api/integrations?${params}`);
            const data = await res.json();
            setIntegrations(data.integrations || []);
        } catch (error) {
            console.error("Error fetching integrations:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredIntegrations = integrations.filter((int) =>
        search
            ? int.name.toLowerCase().includes(search.toLowerCase()) ||
            int.description?.toLowerCase().includes(search.toLowerCase())
            : true
    );

    return (
        <div className={cn("min-h-screen relative overflow-hidden", isDark ? "bg-[#030014]" : "bg-[#fafafa]")}>
            {/* Gradient overlay */}
            <div className={cn(
                "fixed inset-0 pointer-events-none z-0",
                isDark
                    ? "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_70%)]"
                    : "bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.05),transparent_70%)]"
            )} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-24">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-xs font-semibold text-violet-600 dark:text-violet-400 mb-6 uppercase tracking-wider"
                        >
                            <Zap className="w-3 h-3" />
                            Ecosystem
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-[#0a0a0f] dark:text-white"
                        >
                            Integrations
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-black/60 dark:text-white/60 max-w-2xl"
                        >
                            Supercharge your agents by connecting them to your favorite tools.
                            Seamlessly authenticated and secure.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Link
                            href="/integrations/new"
                            className={cn(
                                "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5",
                                isDark
                                    ? "bg-white text-black hover:bg-gray-100"
                                    : "bg-black text-white hover:bg-gray-800"
                            )}
                        >
                            <Plus className="w-4 h-4" />
                            Create Integration
                        </Link>
                    </motion.div>
                </div>

                {/* Filters & Search */}
                <div className="sticky top-20 z-20 bg-white/80 dark:bg-[#030014]/80 backdrop-blur-xl py-4 -mx-4 px-4 mb-10 border-y border-black/5 dark:border-white/5">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40 dark:text-white/40" />
                            <input
                                type="text"
                                placeholder="Search integrations..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={cn(
                                    "w-full pl-12 pr-4 py-3 rounded-xl border transition-all outline-none",
                                    isDark
                                        ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-violet-500/50"
                                        : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-violet-500",
                                )}
                            />
                        </div>

                        <button
                            onClick={() => setShowOfficial(!showOfficial)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all font-medium",
                                showOfficial
                                    ? "bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/20"
                                    : "bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10"
                            )}
                        >
                            <Filter className="w-4 h-4" />
                            {showOfficial ? "Official Only" : "All"}
                        </button>
                    </div>
                    {/* Categories */}
                    <div className="max-w-7xl mx-auto flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            const isSelected = selectedCategory === cat.value;
                            return (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap",
                                        isSelected
                                            ? "bg-black dark:bg-white text-white dark:text-black border-transparent"
                                            : "bg-white dark:bg-white/5 border-black/5 dark:border-white/10 text-black/60 dark:text-white/60 hover:bg-black/5 dark:hover:bg-white/10"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Integrations Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-64 rounded-3xl border animate-pulse",
                                    isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"
                                )}
                            />
                        ))}
                    </div>
                ) : filteredIntegrations.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5">
                        <Globe className="w-16 h-16 mx-auto mb-4 text-black/20 dark:text-white/20" />
                        <h3 className="text-xl font-bold mb-2 text-black dark:text-white">
                            No integrations found
                        </h3>
                        <p className="text-black/50 dark:text-white/50 mb-6">
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                        <Link
                            href="/integrations/new"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Request New Integration
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredIntegrations.map((integration) => {
                            const Icon = CATEGORY_ICONS[integration.category] || Globe;

                            return (
                                <Link
                                    key={integration.id}
                                    href={`/integrations/${integration.id}`}
                                >
                                    <SpotlightCard className="h-full bg-white dark:bg-white/5 border-black/5 dark:border-white/10 group">
                                        <div className="p-8 h-full flex flex-col">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className={cn(
                                                    "w-14 h-14 rounded-2xl flex items-center justify-center p-3 transition-colors",
                                                    isDark ? "bg-white/10 text-white" : "bg-black/5 text-black"
                                                )}>
                                                    <Icon className="w-7 h-7" />
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {integration.is_official && (
                                                        <div className="px-2.5 py-1 rounded-md bg-violet-100 dark:bg-violet-500/20 border border-violet-200 dark:border-violet-500/20">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300 flex items-center gap-1">
                                                                <Star className="w-3 h-3 fill-violet-600 dark:fill-violet-300" /> Official
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* @ts-ignore - is_connected injected by API */}
                                                    {integration.is_connected && (
                                                        <div className="px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20">
                                                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300 flex items-center gap-1">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                                Connected
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h3 className="text-xl font-bold mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors text-black dark:text-white">
                                                    {integration.name}
                                                </h3>
                                                <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed line-clamp-2">
                                                    {integration.description}
                                                </p>
                                            </div>

                                            <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-xs font-medium text-black/40 dark:text-white/40">
                                                    <span>{integration.install_count || 0} installs</span>
                                                    <span className="capitalize">{integration.category}</span>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-black/20 dark:text-white/20 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

