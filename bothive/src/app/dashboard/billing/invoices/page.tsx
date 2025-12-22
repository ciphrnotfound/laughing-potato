"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    IconFileText,
    IconDownload,
    IconCreditCard,
    IconSearch,
    IconFilter,
    IconLoader2,
    IconChevronRight
} from "@tabler/icons-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface Invoice {
    id: string;
    amount: number;
    currency: string;
    plan_name: string;
    status: string;
    reference: string;
    invoice_number: string;
    applied_coupon?: string;
    created_at: string;
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClientComponentClient();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("user_invoices")
                .select("*")
                .order("created_at", { ascending: false });

            if (!error) {
                setInvoices(data || []);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.plan_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.applied_coupon?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-12 font-sans relative">
            {/* Ambient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative max-w-5xl mx-auto z-10">
                {/* Header */}
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-4">
                                <IconCreditCard className="w-3.5 h-3.5" />
                                <span>Billing History</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Invoices</h1>
                            <p className="text-white/50 text-sm max-w-md">
                                Manage your subscription receipts and download detailed transaction history.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-violet-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search invoices..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-all w-64"
                                />
                            </div>
                            <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white">
                                <IconFilter className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Invoices List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <IconLoader2 className="w-8 h-8 text-violet-500 animate-spin" />
                            <p className="text-white/30 text-sm animate-pulse">Retrieving billing history...</p>
                        </div>
                    ) : filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice, index) => (
                            <motion.div
                                key={invoice.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative rounded-2xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all"
                            >
                                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />

                                <div className="relative px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-5 w-full md:w-auto">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center transition-all",
                                            invoice.amount === 0 ? "text-emerald-400 border-emerald-500/30" : "text-white/40 group-hover:text-violet-400 group-hover:border-violet-500/30"
                                        )}>
                                            <IconFileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-white">{invoice.plan_name} Plan</h3>
                                                {invoice.applied_coupon && (
                                                    <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-400 font-medium">
                                                        {invoice.applied_coupon}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-white/30">
                                                <span>{invoice.invoice_number}</span>
                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                <span>{format(new Date(invoice.created_at), "MMM dd, yyyy")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto md:flex-1 px-4 md:px-0">
                                        <div className="text-right">
                                            {invoice.amount === 0 ? (
                                                <p className="text-lg font-bold text-emerald-400 tracking-tight">
                                                    FREE TRIAL
                                                </p>
                                            ) : (
                                                <p className="text-lg font-bold text-white tracking-tight">
                                                    {invoice.currency === 'NGN' ? '₦' : '$'}{(invoice.amount / 100).toLocaleString()}
                                                </p>
                                            )}
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest",
                                                invoice.status === 'paid' ? "text-emerald-400" : "text-amber-400"
                                            )}>
                                                {invoice.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                                                title="Download Invoice"
                                            >
                                                <IconDownload className="w-5 h-5" />
                                            </button>
                                            <IconChevronRight className="w-5 h-5 text-white/10" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 mb-6">
                                <IconFileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
                            <p className="text-white/40 text-sm max-w-xs mx-auto">
                                Your billing history is currently empty. Subscribe to a plan to start your digital workforce.
                            </p>
                            <button
                                onClick={() => window.location.href = '/dashboard/billing'}
                                className="mt-8 px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                            >
                                View Plans
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/20">
                    <p>© 2025 Bothive Billing. All payments are secured by Paystack.</p>
                    <div className="flex items-center gap-6">
                        <a href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="/legal/terms" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
