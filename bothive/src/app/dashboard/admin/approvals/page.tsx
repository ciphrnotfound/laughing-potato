"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, CheckCircle2, XCircle, Clock, Bot, User, Plug } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PendingItem {
    id: string;
    name: string;
    description: string;
    status: string;
    created_at: string;
    user_id: string;
    category?: string; // For integrations
    type?: string;     // For integrations
    author_email?: string;
    source: 'bots' | 'integrations';
}

export default function AdminApprovalsPage() {
    const { theme } = useTheme();
    const supabase = createClientComponentClient();
    const [activeTab, setActiveTab] = useState<'bots' | 'integrations'>('bots');
    const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch pending items (bots or integrations)
    const fetchPendingItems = async () => {
        try {
            setLoading(true);
            setPendingItems([]); // Clear current while fetching

            let items: any[] = [];
            let table = activeTab === 'bots' ? 'bots' : 'integrations';

            const query = supabase
                .from(table)
                .select('*')
                .order('created_at', { ascending: false });

            // Handle different schemas for bots vs integrations
            if (activeTab === 'bots') {
                // New schema uses approval_status
                query.eq('approval_status', 'pending_review');
            } else {
                // Integrations might still use the old status
                query.in('status', ['pending', 'beta']);
            }

            console.log(`[Admin] Fetching ${table} pending items...`);
            const { data, error } = await query;

            if (error) {
                console.error("[Admin] Supabase error:", error);
                throw error;
            }

            console.log(`[Admin] Fetched ${data?.length} items from ${table}`, data);

            if (!data) return;

            items = data.map(item => ({ ...item, source: activeTab }));

            // Fetch authors
            if (items.length > 0) {
                const userIds = Array.from(new Set(items.map(b => b.user_id)));
                const { data: users } = await supabase
                    .from('users')
                    .select('id, email')
                    .in('id', userIds);

                // Map authors to items
                const userMap = new Map(users?.map(u => [u.id, u]) || []);
                items = items.map(item => ({
                    ...item,
                    author_email: userMap.get(item.user_id)?.email || 'Unknown'
                }));
            }

            setPendingItems(items);
        } catch (error) {
            console.error("Error fetching pending items:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingItems();
    }, [activeTab]);

    const handleApproval = async (itemId: string, approve: boolean) => {
        try {
            setActionLoading(itemId);
            const table = activeTab === 'bots' ? 'bots' : 'integrations';
            
            // Prepare update payload
            // Constraint valid_status: pending, approved, rejected
            // RLS requires: status = 'approved' AND is_published = true
            const updates = approve 
                ? { 
                    approval_status: 'approved', 
                    status: 'approved',
                    is_published: true,
                    approved_at: new Date().toISOString()
                  }
                : { 
                    approval_status: 'rejected', 
                    status: 'rejected',
                    is_published: false,
                    rejection_reason: "Does not meet guidelines"
                  };

            const { error } = await supabase
                .from(table)
                .update(updates)
                .eq('id', itemId);

            if (error) throw error;

            // Remove from list
            setPendingItems(prev => prev.filter(item => item.id !== itemId));

        } catch (error: any) {
            console.error(`Error ${approve ? 'approving' : 'rejecting'} item:`, error);
            alert(`Failed to update status: ${error.message || "Unknown error"}`);
        } finally {
            setActionLoading(null);
        }
    };

    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 text-neutral-400">
                {activeTab === 'bots' ? <Bot className="w-8 h-8" /> : <Plug className="w-8 h-8" />}
            </div>
            <h3 className="text-xl font-medium text-neutral-900 dark:text-white mb-2">
                No Pending {activeTab === 'bots' ? 'Bots' : 'Integrations'}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm">
                All submissions have been reviewed.
            </p>
        </div>
    );

    return (
        <DashboardPageShell
            title="Pending Approvals"
            description="Review and approve submissions from the community."
        >
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Tabs */}
                <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800">
                    <button
                        onClick={() => setActiveTab('bots')}
                        className={cn(
                            "px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2",
                            activeTab === 'bots' ? "text-[#6C43FF]" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
                        )}
                    >
                        <Bot className="w-4 h-4" />
                        Bots
                        {activeTab === 'bots' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C43FF]" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('integrations')}
                        className={cn(
                            "px-4 py-3 text-sm font-medium transition-colors relative flex items-center gap-2",
                            activeTab === 'integrations' ? "text-[#6C43FF]" : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white"
                        )}
                    >
                        <Plug className="w-4 h-4" />
                        Integrations
                        {activeTab === 'integrations' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6C43FF]" />}
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#6C43FF]" />
                    </div>
                ) : pendingItems.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingItems.map((item) => (
                            <div
                                key={item.id}
                                className="group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                            >
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    Pending
                                </div>

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#6C43FF] to-[#8A63FF] flex items-center justify-center text-white">
                                            {item.source === 'bots' ? <Bot className="w-6 h-6" /> : <Plug className="w-6 h-6" />}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2 line-clamp-1">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 line-clamp-2 h-10">
                                        {item.description || "No description provided."}
                                    </p>

                                    {item.category && (
                                        <div className="mb-4">
                                            <span className="text-xs px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                                                {item.category}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-500 mb-6">
                                        <User className="w-3 h-3" />
                                        <span className="truncate">{item.author_email}</span>
                                        <span>•</span>
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleApproval(item.id, false)}
                                            disabled={actionLoading === item.id}
                                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApproval(item.id, true)}
                                            disabled={actionLoading === item.id}
                                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                                        >
                                            {actionLoading === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Approve
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardPageShell>
    );
}
