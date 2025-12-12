"use client";

import React, { useState, useEffect } from 'react';
import { Search, Star, Download, ArrowRight, Sparkles, Zap, Globe, Code, Database, MessageSquare, Calendar, Mail, Github, Video, Music, FileText, Table, Lock } from 'lucide-react';
import { HeroBackground } from '@/components/HeroBackground';
import { GlassCard } from '@/components/ui/GlassCard';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Integration {
    id: string;
    name: string;
    slug: string;
    short_description: string;
    category: string;
    icon_url: string;
    rating: number;
    total_installs: number;
    pricing_model: 'free' | 'one_time' | 'subscription';
    price: number;
    currency: string;
    tags: string[];
    developer_id: string; // To check for "Official" status if needed
}

interface HiveStats {
    totalHiveTools: number;
    officialTools: number;
    communityTools: number;
    categories: Array<{ category: string; count: number; icon: string }>;
}

const categoryIcons: Record<string, any> = {
    communication: MessageSquare,
    productivity: Calendar,
    data: Database,
    ai: Sparkles,
    social: Globe,
    finance: Database,
    developer: Code,
    entertainment: Video,
    other: Zap,
};

export default function HiveToolsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [stats, setStats] = useState<HiveStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        fetchIntegrations();
    }, [selectedCategory]);

    const fetchIntegrations = async () => {
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.append('category', selectedCategory);

            const response = await fetch(`/api/hivetools?${params}`);
            const data = await response.json();

            setIntegrations(data.hivetools || []);
            setStats(data.stats);
        } catch (error) {
            console.error('Failed to fetch integrations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTools = integrations.filter(tool => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            tool.name.toLowerCase().includes(query) ||
            tool.short_description.toLowerCase().includes(query) ||
            tool.tags?.some(tag => tag.toLowerCase().includes(query))
        );
    });

    return (
        <HeroBackground className="min-h-screen w-full min-h-screen overflow-hidden pb-6 pt-16 sm:pt-24 mb-10 transition-colors duration-300">
            <div className="relative z-10">
                {/* Header / Hero Section */}
                <div className="border-b border-border/40 bg-background/80 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-start">
                        <div className="pt-14">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B21B6]/20 border border-[#5B21B6]/30 text-[#A78BFA] text-sm mb-6 shadow-sm">
                                <Sparkles className="w-4 h-4" />
                                <span>The Integration Marketplace</span>
                            </div>

                            <h1 className="text-6xl font-bold text-foreground mb-4 tracking-tight">
                                HiveTools
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl">
                                Connect your favorite tools. Install with one click and automate everything.
                            </p>

                            {/* Stats */}
                            {stats && (
                                <div className="flex items-center gap-8 mt-8 text-sm">
                                    <div>
                                        <span className="text-foreground font-semibold">{stats.totalHiveTools}</span>
                                        <span className="text-muted-foreground ml-2">integrations</span>
                                    </div>
                                    <div>
                                        <span className="text-foreground font-semibold">{stats.officialTools}</span>
                                        <span className="text-muted-foreground ml-2">official</span>
                                    </div>
                                    <div>
                                        <span className="text-foreground font-semibold">{stats.communityTools}</span>
                                        <span className="text-muted-foreground ml-2">community</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Theme Toggle */}
                        <div className="pt-4">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="border-b border-border/40 bg-muted/30 backdrop-blur-sm">
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-[#6D28D9] transition-colors" />
                            <input
                                type="text"
                                placeholder="Search integrations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/50 focus:bg-background transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="border-b border-border/40 bg-muted/10">
                    <div className="max-w-6xl mx-auto px-6 py-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            <CategoryButton
                                icon={Zap}
                                label="All"
                                active={!selectedCategory}
                                onClick={() => setSelectedCategory(null)}
                            />
                            {stats?.categories.map((cat) => {
                                const Icon = categoryIcons[cat.category] || Zap;
                                return (
                                    <CategoryButton
                                        key={cat.category}
                                        icon={Icon}
                                        label={cat.category}
                                        active={selectedCategory === cat.category}
                                        onClick={() => setSelectedCategory(cat.category)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="max-w-6xl mx-auto px-6 py-12">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-2 border-[#6D28D9] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : filteredTools.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-muted-foreground">No integrations found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTools.map((tool) => (
                                <Link key={tool.id} href={`/hivetools/${tool.slug}`}>
                                    <ToolCard tool={tool} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </HeroBackground>
    );
}

function CategoryButton({ icon: Icon, label, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${active
                ? 'bg-[#6D28D9] text-white shadow-md shadow-[#6D28D9]/20'
                : 'bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground border border-border/50'
                }`}
        >
            <Icon className="w-4 h-4" />
            <span className="capitalize">{label}</span>
        </button>
    );
}

function ToolCard({ tool }: { tool: Integration }) {
    return (
        <GlassCard className="group p-6 cursor-pointer hover:shadow-lg hover:shadow-[#6D28D9]/10 hover:border-[#6D28D9]/30 h-full flex flex-col">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#6D28D9]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="relative z-10 flex-1">
                {/* Icon & Badge */}
                <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-[#6D28D9]/10 border border-[#6D28D9]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm overflow-hidden">
                        {tool.icon_url ? (
                            <img src={tool.icon_url} alt={tool.name} className="w-full h-full object-cover" />
                        ) : (
                            <Zap className="w-7 h-7 text-[#A78BFA]" />
                        )}
                    </div>
                    {/* TODO: Add logic for 'Official' badge based on developer_id or a flag */}
                    {tool.pricing_model !== 'free' && (
                        <span className="px-2.5 py-1 bg-[#6D28D9]/10 border border-[#6D28D9]/20 text-[#A78BFA] text-xs font-medium rounded-full">
                            {tool.currency === 'NGN' ? '₦' : '$'}{tool.price}
                        </span>
                    )}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#A78BFA] transition-colors">
                    {tool.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                    {tool.short_description}
                </p>

                {/* Tags */}
                {tool.tags && tool.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {tool.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-muted border border-border/50 text-muted-foreground text-xs rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="relative z-10 flex items-center justify-between pt-4 border-t border-border/40 mt-auto">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium text-foreground">{tool.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" />
                        <span className="text-foreground">
                            {tool.total_installs > 1000
                                ? `${(tool.total_installs / 1000).toFixed(1)}k`
                                : tool.total_installs}
                        </span>
                    </div>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-[#6D28D9] group-hover:translate-x-1 transition-all" />
            </div>
        </GlassCard>
    );
}
