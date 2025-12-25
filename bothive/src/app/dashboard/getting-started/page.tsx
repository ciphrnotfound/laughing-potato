"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight, Check, Circle, Bot, Zap, Users,
    BookOpen, Sparkles, ChevronRight, ExternalLink,
    Store, Terminal, MessageSquare
} from 'lucide-react';
import { useAppSession } from '@/lib/app-session-context';
import { DashboardPageShell } from '@/components/DashboardPageShell';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Step {
    id: string;
    title: string;
    description: string;
    action: string;
    href: string;
    completed: boolean;
}

export default function GettingStartedPage() {
    const { profile } = useAppSession();
    const supabase = createClientComponentClient();
    const [steps, setSteps] = useState<Step[]>([
        {
            id: "create-bot",
            title: "Create your first bot",
            description: "Build an AI agent that can automate tasks, answer questions, or generate content.",
            action: "Create Bot",
            href: "/dashboard/bots/new",
            completed: false
        },
        {
            id: "explore-marketplace",
            title: "Explore the marketplace",
            description: "Discover pre-built bots and integrations created by the community.",
            action: "Browse",
            href: "/marketplace",
            completed: false
        },
        {
            id: "connect-integration",
            title: "Connect an integration",
            description: "Link Slack, Notion, or other tools to supercharge your bots.",
            action: "Connect",
            href: "/dashboard/integrations",
            completed: false
        },
        {
            id: "invite-team",
            title: "Invite your team",
            description: "Collaborate with colleagues by adding them to your workspace.",
            action: "Invite",
            href: "/dashboard/workspaces",
            completed: false
        }
    ]);

    const [completedCount, setCompletedCount] = useState(0);

    useEffect(() => {
        checkProgress();
    }, [profile]);

    const checkProgress = async () => {
        if (!profile?.id) return;

        try {
            // Check for bots
            const { count: botCount } = await supabase
                .from('bots')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id);

            // Check for integrations
            const { count: integrationCount } = await supabase
                .from('user_integrations')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id);

            // Check for workspace members
            const { count: memberCount } = await supabase
                .from('workspace_members')
                .select('*', { count: 'exact', head: true });

            const updatedSteps = steps.map(step => {
                switch (step.id) {
                    case 'create-bot':
                        return { ...step, completed: (botCount || 0) > 0 };
                    case 'connect-integration':
                        return { ...step, completed: (integrationCount || 0) > 0 };
                    case 'invite-team':
                        return { ...step, completed: (memberCount || 0) > 1 };
                    default:
                        return step;
                }
            });

            setSteps(updatedSteps);
            setCompletedCount(updatedSteps.filter(s => s.completed).length);
        } catch (error) {
            console.error('Error checking progress:', error);
        }
    };

    const progressPercent = (completedCount / steps.length) * 100;

    return (
        <DashboardPageShell title="">
            <div className="max-w-3xl mx-auto px-4 py-16">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-2 text-violet-400 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>Getting Started</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                        Welcome{profile?.firstName ? `, ${profile.firstName}` : ''}
                    </h1>

                    <p className="text-neutral-400 text-lg">
                        Complete these steps to get the most out of Bothive.
                    </p>
                </motion.div>

                {/* Progress Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-10"
                >
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-neutral-500">Progress</span>
                        <span className="text-sm text-neutral-400">{completedCount} of {steps.length}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                        />
                    </div>
                </motion.div>

                {/* Steps */}
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + index * 0.05 }}
                        >
                            <Link
                                href={step.href}
                                className={cn(
                                    "group flex items-center gap-4 p-5 rounded-xl border transition-all duration-200",
                                    step.completed
                                        ? "border-violet-500/20 bg-violet-500/5"
                                        : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10"
                                )}
                            >
                                {/* Status Icon */}
                                <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
                                    step.completed
                                        ? "bg-violet-500 text-white"
                                        : "border border-white/20 text-white/40 group-hover:border-violet-500/50 group-hover:text-violet-400"
                                )}>
                                    {step.completed ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={cn(
                                        "font-medium mb-0.5 transition-colors",
                                        step.completed ? "text-violet-300" : "text-white group-hover:text-violet-300"
                                    )}>
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-neutral-500 truncate">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Action */}
                                <div className={cn(
                                    "flex items-center gap-1 text-sm font-medium transition-colors shrink-0",
                                    step.completed
                                        ? "text-violet-400"
                                        : "text-neutral-500 group-hover:text-violet-400"
                                )}>
                                    {step.completed ? "Done" : step.action}
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Divider */}
                <div className="my-12 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Quick Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">
                        Resources
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <ResourceLink
                            icon={<BookOpen className="w-4 h-4" />}
                            title="Documentation"
                            href="/docs"
                        />
                        <ResourceLink
                            icon={<Terminal className="w-4 h-4" />}
                            title="API Reference"
                            href="/docs/api"
                        />
                        <ResourceLink
                            icon={<MessageSquare className="w-4 h-4" />}
                            title="Get Support"
                            href="/support"
                            external
                        />
                    </div>
                </motion.div>
            </div>
        </DashboardPageShell>
    );
}

function ResourceLink({
    icon,
    title,
    href,
    external
}: {
    icon: React.ReactNode;
    title: string;
    href: string;
    external?: boolean;
}) {
    return (
        <Link
            href={href}
            target={external ? "_blank" : undefined}
            className="group flex items-center gap-3 p-4 rounded-lg border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 transition-all"
        >
            <div className="text-neutral-500 group-hover:text-violet-400 transition-colors">
                {icon}
            </div>
            <span className="text-sm text-neutral-400 group-hover:text-white transition-colors">
                {title}
            </span>
            {external && (
                <ExternalLink className="w-3 h-3 text-neutral-600 ml-auto" />
            )}
        </Link>
    );
}
