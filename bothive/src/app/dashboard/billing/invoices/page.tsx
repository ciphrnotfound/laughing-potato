"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    IconReceipt2,
    IconDownload,
    IconSearch,
    IconCalendar,
    IconLoader2,
    IconCheck,
    IconClock,
    IconSparkles
} from "@tabler/icons-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
    const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
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

    const totalSpent = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.amount : 0), 0);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white">
            {/* Header */}
            <header className="border-b border-neutral-200 dark:border-neutral-800">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight mb-2">Invoices</h1>
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                                View and download your billing history
                            </p>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search invoices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-64 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Total Invoices</div>
                        <div className="text-2xl font-semibold">{invoices.length}</div>
                    </div>
                    <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Total Spent</div>
                        <div className="text-2xl font-semibold">
                            ₦{(totalSpent / 100).toLocaleString()}
                        </div>
                    </div>
                    <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Last Payment</div>
                        <div className="text-2xl font-semibold">
                            {invoices[0] ? format(new Date(invoices[0].created_at), "MMM d, yyyy") : "—"}
                        </div>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-neutral-50 dark:bg-neutral-900 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                        <div className="col-span-4">Invoice</div>
                        <div className="col-span-2">Date</div>
                        <div className="col-span-2">Amount</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <IconLoader2 className="w-6 h-6 text-violet-500 animate-spin" />
                            </div>
                        ) : filteredInvoices.length > 0 ? (
                            <AnimatePresence>
                                {filteredInvoices.map((invoice, i) => (
                                    <motion.div
                                        key={invoice.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.03 }}
                                        onClick={() => setSelectedInvoice(selectedInvoice === invoice.id ? null : invoice.id)}
                                        className={cn(
                                            "grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 cursor-pointer transition-colors",
                                            "hover:bg-neutral-50 dark:hover:bg-neutral-900/50",
                                            selectedInvoice === invoice.id && "bg-violet-50 dark:bg-violet-500/5"
                                        )}
                                    >
                                        {/* Invoice Info */}
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                                invoice.status === 'paid'
                                                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                            )}>
                                                <IconReceipt2 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-neutral-900 dark:text-white">
                                                    {invoice.plan_name} Plan
                                                </div>
                                                <div className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                                                    <span>{invoice.invoice_number}</span>
                                                    {invoice.applied_coupon && (
                                                        <span className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-medium">
                                                            {invoice.applied_coupon}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-2 flex items-center text-sm text-neutral-600 dark:text-neutral-400">
                                            <IconCalendar className="w-4 h-4 mr-2 md:hidden" />
                                            {format(new Date(invoice.created_at), "MMM d, yyyy")}
                                        </div>

                                        {/* Amount */}
                                        <div className="col-span-2 flex items-center">
                                            {invoice.amount === 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                                    <IconSparkles className="w-3 h-3" />
                                                    Free Trial
                                                </span>
                                            ) : (
                                                <span className="font-semibold text-neutral-900 dark:text-white">
                                                    {invoice.currency === 'NGN' ? '₦' : '$'}{(invoice.amount / 100).toLocaleString()}
                                                </span>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2 flex items-center">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                invoice.status === 'paid'
                                                    ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                    : "bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                            )}>
                                                {invoice.status === 'paid'
                                                    ? <IconCheck className="w-3 h-3" />
                                                    : <IconClock className="w-3 h-3" />
                                                }
                                                {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 flex items-center justify-end">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Download logic here
                                                }}
                                                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                                title="Download Invoice"
                                            >
                                                <IconDownload className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 mb-4">
                                    <IconReceipt2 className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm mb-6">
                                    Your billing history is empty. Subscribe to a plan to get started.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/dashboard/billing'}
                                    className="px-5 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
                                >
                                    View Plans
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
                    <p>All payments are secured by Paystack.</p>
                    <div className="flex items-center gap-6">
                        <a href="/legal/privacy" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Privacy</a>
                        <a href="/legal/terms" className="hover:text-neutral-900 dark:hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </main>
        </div>
    );
}
