"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, DollarSign, Package, TrendingUp, Users, Plus, Settings, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react';
import { HeroBackground } from '@/components/HeroBackground';
import ThemeToggle from '@/components/ThemeToggle';
import { GlassCard } from '@/components/ui/GlassCard';
import { useTheme } from '@/lib/theme-context';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface DeveloperStats {
    totalIntegrations: number;
    activeInstalls: number;
    totalRevenue: number;
    pendingEarnings: number;
}

interface Integration {
    id: string;
    name: string;
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
    active_installs: number;
    total_revenue: number;
    rating: number;
    created_at: string;
}

export default function DeveloperPortalPage() {
    const { theme } = useTheme();
    const [isDeveloper, setIsDeveloper] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [stats, setStats] = useState<DeveloperStats>({
        totalIntegrations: 0,
        activeInstalls: 0,
        totalRevenue: 0,
        pendingEarnings: 0,
    });
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDeveloperData();
    }, []);

    const fetchDeveloperData = async () => {
        try {
            const response = await fetch('/api/developer/dashboard');
            if (response.ok) {
                const data = await response.json();
                setIsDeveloper(data.isDeveloper);
                setIsConnected(data.isConnected);
                setStats(data.stats || stats);
                setIntegrations(data.integrations || []);
            }
        } catch (error) {
            console.error('Failed to fetch developer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBecomeDeveloper = async () => {
        try {
            const response = await fetch('/api/developer/register', {
                method: 'POST',
            });

            if (response.ok) {
                setIsDeveloper(true);
            }
        } catch (error) {
            console.error('Failed to register as developer:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
            case 'pending':
                return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            case 'rejected':
                return 'text-red-500 bg-red-500/10 border-red-500/30';
            case 'suspended':
                return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
            default:
                return 'text-gray-500 bg-gray-500/10 border-gray-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'rejected':
            case 'suspended':
                return <XCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <HeroBackground className="min-h-screen w-full flex items-center justify-center">
                <div className="text-muted-foreground">Loading developer portal...</div>
            </HeroBackground>
        );
    }

    if (!isDeveloper) {
        return (
            <HeroBackground className="min-h-screen w-full overflow-hidden pb-6 pt-16 sm:pt-24">
                <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6"
                        >
                            <Code2 className="w-5 h-5" />
                            <span>Developer Program</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl font-bold text-foreground mb-6 tracking-tight"
                        >
                            Build & Monetize
                            <br />
                            <span className="text-primary">Integrations</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
                        >
                            Join our developer ecosystem and earn 85% revenue share by creating integrations
                            for Instagram, Gmail, Notion, and more.
                        </motion.p>

                        <div className="grid md:grid-cols-3 gap-6 mb-12">
                            {[
                                { icon: DollarSign, title: '85% Revenue', desc: 'You keep most of the earnings' },
                                { icon: Users, title: 'Built-in Audience', desc: 'Access to thousands of users' },
                                { icon: Code2, title: 'Easy SDK', desc: 'Simple integration framework' },
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                >
                                    <GlassCard className="p-6 text-center">
                                        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <feature.icon className="w-7 h-7 text-primary" />
                                        </div>
                                        <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleBecomeDeveloper}
                            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors shadow-lg"
                        >
                            <span className="flex items-center gap-2">
                                <Code2 className="w-5 h-5" />
                                Become a Developer
                            </span>
                        </motion.button>
                    </div>
                </div>
            </HeroBackground>
        );
    }

    return (
        <HeroBackground className="min-h-screen w-full overflow-hidden pb-6 pt-16 sm:pt-24">
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-4"
                        >
                            <Code2 className="w-4 h-4" />
                            <span>Developer Portal</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl font-bold text-foreground mb-2 tracking-tight"
                        >
                            Dashboard
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-muted-foreground"
                        >
                            Manage your integrations and track earnings
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-3"
                    >
                        <Link
                            href="/developer/submit"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Submit Integration
                        </Link>
                        <ThemeToggle />
                    </motion.div>
                </div>

                {/* Payout Settings Banner */}
                {!isConnected && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <GlassCard className="p-6 border-yellow-500/30 bg-yellow-500/5">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
                                    <DollarSign className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-foreground mb-1">Set Up Payouts</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Add your PayPal or Wise details to receive your earnings. Payouts are processed monthly.
                                    </p>
                                    <Link
                                        href="/developer/settings/payouts"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/30 transition-colors text-sm font-medium"
                                    >
                                        <Settings className="w-4 h-4" />
                                        Configure Payouts
                                    </Link>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: Package, label: 'Integrations', value: stats.totalIntegrations, color: 'text-blue-500' },
                        { icon: Users, label: 'Active Installs', value: stats.activeInstalls, color: 'text-purple-500' },
                        { icon: DollarSign, label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, color: 'text-emerald-500' },
                        { icon: TrendingUp, label: 'Pending', value: `$${stats.pendingEarnings.toFixed(2)}`, color: 'text-yellow-500' },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <GlassCard className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20')}>
                                        <stat.icon className={cn('w-6 h-6', stat.color)} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>

                {/* Integrations List */}
                <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Your Integrations</h2>

                    {integrations.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20"
                        >
                            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">No integrations yet</h3>
                            <p className="text-muted-foreground mb-6">
                                Start building your first integration and earn revenue
                            </p>
                            <Link
                                href="/developer/submit"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Submit Integration
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="space-y-3">
                            {integrations.map((integration, index) => (
                                <motion.div
                                    key={integration.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GlassCard className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-foreground mb-1">{integration.name}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>{integration.active_installs} installs</span>
                                                        <span>•</span>
                                                        <span>${integration.total_revenue.toFixed(2)} revenue</span>
                                                        <span>•</span>
                                                        <span>⭐ {integration.rating.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border', getStatusColor(integration.status))}>
                                                    {getStatusIcon(integration.status)}
                                                    {integration.status}
                                                </span>
                                                <Link
                                                    href={`/developer/integrations/${integration.id}`}
                                                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                                                >
                                                    <Settings className="w-5 h-5 text-muted-foreground" />
                                                </Link>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </HeroBackground>
    );
}
