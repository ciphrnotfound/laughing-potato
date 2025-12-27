"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Plus,
    History,
    Zap,
    Sparkles,
    Check,
    Loader2,
    ExternalLink,
    Banknote,
    Building2,
    X,
    AlertCircle,
    Info,
    TrendingUp,
    CreditCard
} from "lucide-react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface CreditBalance {
    balance: number;
    currency: string;
    lastUpdated: string;
}

interface Transaction {
    id: string;
    amount: number;
    type: string;
    description: string | null;
    createdAt: string;
    metadata?: any;
}

interface CreditPackage {
    id: string;
    name: string;
    description: string;
    hcAmount: number;
    priceNgn: number;
    bonusPercent: number;
}

interface WithdrawalInfo {
    balance: number;
    withdrawableHc: number;
    minimumHc: number;
    hcToNgnRate: number;
    platformFeePercent: number;
    estimatedNgn: number;
    platformFeeNgn: number;
    youReceiveNgn: number;
    canWithdraw: boolean;
}

export default function WalletPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [balance, setBalance] = useState<CreditBalance | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [packages, setPackages] = useState<CreditPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [showPackages, setShowPackages] = useState(false);

    // Withdrawal State
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [withdrawInfo, setWithdrawInfo] = useState<WithdrawalInfo | null>(null);
    const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
    const [bankDetails, setBankDetails] = useState({
        bankCode: "058", // Default: GTBank
        accountNumber: "",
        accountName: ""
    });
    const [withdrawing, setWithdrawing] = useState(false);

    // Fetch credits data
    const fetchCreditsData = useCallback(async () => {
        try {
            const res = await fetch('/api/credits?include=all');
            const data = await res.json();
            setBalance(data.balance || { balance: 100, currency: 'HC', lastUpdated: new Date().toISOString() });
            setTransactions(data.transactions || []);
            setPackages(data.packages || []);
        } catch (error) {
            console.error('Failed to fetch credits:', error);
            // Set defaults on error
            setBalance({ balance: 100, currency: 'HC', lastUpdated: new Date().toISOString() });
            setTransactions([]);
            setPackages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCreditsData();
    }, [fetchCreditsData]);

    // Handle purchase
    const handlePurchase = async (packageId: string) => {
        setPurchasing(packageId);
        try {
            const res = await fetch('/api/credits/purchase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageId })
            });

            if (res.ok) {
                const data = await res.json();
                // Redirect to Paystack
                window.location.href = data.authorization_url;
            }
        } catch (error) {
            console.error('Purchase failed:', error);
        } finally {
            setPurchasing(null);
        }
    };

    // Open withdrawal modal
    const openWithdrawal = async () => {
        setShowWithdraw(true);
        setWithdrawLoading(true);
        try {
            const res = await fetch('/api/credits/withdraw');
            const data = await res.json();
            setWithdrawInfo(data);
            setWithdrawAmount(data.minimumHc || 500);
        } catch (error) {
            console.error('Failed to get withdrawal info:', error);
        } finally {
            setWithdrawLoading(false);
        }
    };

    // Submit withdrawal
    const submitWithdrawal = async () => {
        if (!withdrawAmount || !bankDetails.accountNumber || !bankDetails.accountName) return;

        setWithdrawing(true);
        try {
            const res = await fetch('/api/credits/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: withdrawAmount,
                    ...bankDetails
                })
            });

            if (res.ok) {
                alert('Withdrawal request submitted successfully!');
                setShowWithdraw(false);
                fetchCreditsData(); // Refresh balance
            } else {
                const error = await res.json();
                alert(error.error || 'Failed to request withdrawal');
            }
        } catch (error) {
            console.error('Withdrawal failed:', error);
        } finally {
            setWithdrawing(false);
        }
    };

    // Format NGN
    const formatNGN = (kobo: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            minimumFractionDigits: 0
        }).format(kobo / 100);
    };

    // Format Number (clean)
    const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

    // Format date
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate estimated receive amount
    const calculateReceive = () => {
        if (!withdrawInfo) return 0;
        const ngn = withdrawAmount * withdrawInfo.hcToNgnRate;
        const fee = ngn * (withdrawInfo.platformFeePercent / 100);
        return ngn - fee;
    };

    return (
        <DashboardPageShell title="Wallet" description="Manage your HiveCredits balance and transactions">
            <div className="max-w-6xl mx-auto space-y-8 pb-20">

                {/* Top Section: Balance & Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Main Balance Card */}
                    <div className="md:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "h-full rounded-xl border p-6 flex flex-col justify-between relative overflow-hidden",
                                isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                            )}
                        >
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={cn("text-sm font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>Total Balance</h3>
                                    <Zap className={cn("w-4 h-4", isDark ? "text-amber-500" : "text-amber-600")} />
                                </div>
                                <div className="flex items-baseline gap-2 mb-1">
                                    <span className={cn("text-4xl font-bold tracking-tight", isDark ? "text-white" : "text-zinc-900")}>
                                        {fmt(balance?.balance ?? 0)}
                                    </span>
                                    <span className={cn("text-lg font-medium", isDark ? "text-zinc-500" : "text-zinc-400")}>HC</span>
                                </div>
                                <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-zinc-400")}>
                                    ≈ {formatNGN((balance?.balance ?? 0) * 1000)} Value
                                </p>
                            </div>

                            <div className="flex gap-3 mt-8 relative z-10">
                                <button
                                    onClick={() => setShowPackages(true)}
                                    className={cn(
                                        "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2",
                                        isDark
                                            ? "bg-white text-black hover:bg-zinc-200"
                                            : "bg-zinc-900 text-white hover:bg-zinc-800"
                                    )}
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Funds
                                </button>
                                <button
                                    onClick={openWithdrawal}
                                    className={cn(
                                        "flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border",
                                        isDark
                                            ? "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                            : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                    )}
                                >
                                    <ArrowUpRight className="w-4 h-4" />
                                    Withdraw
                                </button>
                            </div>

                            {/* Background Pattern */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/10 to-transparent blur-3xl pointer-events-none" />
                        </motion.div>
                    </div>

                    {/* Quick Stats / Monthly Summary (Mocked for visual "Life") */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={cn(
                            "rounded-xl border p-6 flex flex-col justify-center",
                            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                        )}
                    >
                        <h3 className={cn("text-sm font-medium mb-4", isDark ? "text-zinc-400" : "text-zinc-500")}>Monthly Activity</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className={isDark ? "text-zinc-500" : "text-zinc-600"}>Spent</span>
                                    <span className={isDark ? "text-white" : "text-zinc-900"}>145 HC</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[35%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className={isDark ? "text-zinc-500" : "text-zinc-600"}>Earned</span>
                                    <span className={isDark ? "text-white" : "text-zinc-900"}>320 HC</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[60%]" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Packages Grid (Collapsible) */}
                <AnimatePresence>
                    {showPackages && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-zinc-900")}>
                                    Select Package
                                </h3>
                                <button
                                    onClick={() => setShowPackages(false)}
                                    className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {packages.map((pkg) => (
                                    <div
                                        key={pkg.id}
                                        className={cn(
                                            "p-6 rounded-xl border relative group cursor-pointer transition-all hover:-translate-y-1",
                                            isDark
                                                ? "bg-zinc-900 border-zinc-800 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
                                                : "bg-white border-zinc-200 hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10"
                                        )}
                                        onClick={() => handlePurchase(pkg.id)}
                                    >
                                        {pkg.bonusPercent > 0 && (
                                            <span className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-500 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full">
                                                +{pkg.bonusPercent}% Bonus
                                            </span>
                                        )}
                                        <div className="mb-6">
                                            <p className={cn("text-3xl font-bold mb-1", isDark ? "text-white" : "text-zinc-900")}>
                                                {fmt(pkg.hcAmount)} <span className="text-sm font-normal text-zinc-500">HC</span>
                                            </p>
                                            <p className={cn("text-sm font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>
                                                {formatNGN(pkg.priceNgn * 100)}
                                            </p>
                                        </div>
                                        <button
                                            disabled={purchasing === pkg.id}
                                            className={cn(
                                                "w-full py-2 rounded-lg text-sm font-medium transition-colors border",
                                                isDark
                                                    ? "border-zinc-700 hover:bg-zinc-800 text-white"
                                                    : "border-zinc-200 hover:bg-zinc-50 text-zinc-900"
                                            )}
                                        >
                                            {purchasing === pkg.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Select"}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Transaction History - Ledger Style */}
                <div className="space-y-4">
                    <h3 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-zinc-900")}>Transaction History</h3>
                    <div className={cn(
                        "rounded-xl border overflow-hidden",
                        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                    )}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className={cn(
                                    "border-b",
                                    isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-100 bg-zinc-50/50"
                                )}>
                                    <tr>
                                        <th className={cn("px-6 py-4 font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>Date</th>
                                        <th className={cn("px-6 py-4 font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>Description</th>
                                        <th className={cn("px-6 py-4 font-medium", isDark ? "text-zinc-400" : "text-zinc-500")}>Type</th>
                                        <th className={cn("px-6 py-4 font-medium text-right", isDark ? "text-zinc-400" : "text-zinc-500")}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody className={cn("divide-y", isDark ? "divide-zinc-800" : "divide-zinc-100")}>
                                    {transactions.length > 0 ? (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className={cn("group transition-colors", isDark ? "hover:bg-zinc-800/50" : "hover:bg-zinc-50")}>
                                                <td className={cn("px-6 py-4 whitespace-nowrap", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                                    {formatDate(tx.createdAt)}
                                                </td>
                                                <td className={cn("px-6 py-4", isDark ? "text-zinc-300" : "text-zinc-700")}>
                                                    {tx.description || "Transaction"}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "text-xs px-2 py-1 rounded-full capitalize",
                                                        isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"
                                                    )}>
                                                        {tx.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className={cn(
                                                        "font-mono font-medium",
                                                        tx.amount > 0
                                                            ? "text-emerald-500"
                                                            : isDark ? "text-zinc-300" : "text-zinc-900"
                                                    )}>
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                                No transactions found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Withdrawal Modal - Professional Form */}
                <AnimatePresence>
                    {showWithdraw && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWithdraw(false)}>
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={e => e.stopPropagation()}
                                className={cn(
                                    "w-full max-w-md rounded-2xl border shadow-xl overflow-hidden flex flex-col max-h-[90vh]",
                                    isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                                )}
                            >
                                {/* Modal Header */}
                                <div className={cn("px-6 py-4 border-b flex items-center justify-between", isDark ? "border-zinc-800" : "border-zinc-100")}>
                                    <h3 className={cn("font-semibold", isDark ? "text-white" : "text-zinc-900")}>Withdraw Funds</h3>
                                    <button onClick={() => setShowWithdraw(false)} className={cn("p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500")}>
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto">
                                    {withdrawLoading || !withdrawInfo ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Amount Input */}
                                            <div>
                                                <label className={cn("block text-xs font-medium uppercase tracking-wider mb-2", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                                    Amount to Withdraw
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={withdrawAmount}
                                                        onChange={(e) => setWithdrawAmount(parseInt(e.target.value) || 0)}
                                                        className={cn(
                                                            "w-full px-4 py-3 rounded-lg border bg-transparent text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500",
                                                            isDark ? "border-zinc-700 text-white" : "border-zinc-200 text-zinc-900"
                                                        )}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500 pointer-events-none">HC</div>
                                                </div>
                                                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                                                    <span>Min: {withdrawInfo.minimumHc} HC</span>
                                                    <span>Available: {withdrawInfo.withdrawableHc} HC</span>
                                                </div>
                                            </div>

                                            {/* Bank Form */}
                                            <div className="space-y-4">
                                                <label className={cn("block text-xs font-medium uppercase tracking-wider", isDark ? "text-zinc-500" : "text-zinc-500")}>
                                                    Destination Account
                                                </label>
                                                <select
                                                    value={bankDetails.bankCode}
                                                    onChange={(e) => setBankDetails({ ...bankDetails, bankCode: e.target.value })}
                                                    className={cn(
                                                        "w-full px-4 py-2.5 rounded-lg border bg-transparent outline-none appearance-none cursor-pointer",
                                                        isDark ? "border-zinc-700 text-white" : "border-zinc-200 text-zinc-900"
                                                    )}
                                                >
                                                    <option value="058">Guaranty Trust Bank</option>
                                                    <option value="044">Access Bank</option>
                                                    <option value="033">United Bank for Africa</option>
                                                    <option value="011">First Bank of Nigeria</option>
                                                    <option value="214">FCMB</option>
                                                </select>
                                                <input
                                                    placeholder="Account Number"
                                                    value={bankDetails.accountNumber}
                                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                                    className={cn(
                                                        "w-full px-4 py-2.5 rounded-lg border bg-transparent outline-none",
                                                        isDark ? "border-zinc-700 text-white placeholder:text-zinc-600" : "border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                                                    )}
                                                />
                                                <input
                                                    placeholder="Account Name"
                                                    value={bankDetails.accountName}
                                                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                                    className={cn(
                                                        "w-full px-4 py-2.5 rounded-lg border bg-transparent outline-none",
                                                        isDark ? "border-zinc-700 text-white placeholder:text-zinc-600" : "border-zinc-200 text-zinc-900 placeholder:text-zinc-400"
                                                    )}
                                                />
                                            </div>

                                            {/* Calculation Summary */}
                                            <div className={cn("p-4 rounded-lg border border-dashed", isDark ? "border-zinc-700 bg-zinc-800/30" : "border-zinc-200 bg-zinc-50/50")}>
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-zinc-500">Exchange Rate</span>
                                                    <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>1 HC = ₦{withdrawInfo.hcToNgnRate}</span>
                                                </div>
                                                <div className="flex justify-between text-sm mb-3">
                                                    <span className="text-zinc-500">Platform Fee ({withdrawInfo.platformFeePercent}%)</span>
                                                    <span className={isDark ? "text-zinc-300" : "text-zinc-700"}>- {formatNGN(calculateReceive() * (withdrawInfo.platformFeePercent / 100) * 100)}</span>
                                                </div>
                                                <div className="flex justify-between font-medium pt-3 border-t border-dashed border-zinc-700">
                                                    <span className={isDark ? "text-white" : "text-zinc-900"}>You Receive</span>
                                                    <span className="text-emerald-500">{formatNGN(calculateReceive() * 100)}</span>
                                                </div>
                                            </div>

                                            {/* Submit */}
                                            <button
                                                onClick={submitWithdrawal}
                                                disabled={withdrawing || !withdrawInfo.canWithdraw || withdrawAmount < withdrawInfo.minimumHc || !bankDetails.accountNumber}
                                                className={cn(
                                                    "w-full py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2",
                                                    withdrawing || !withdrawInfo.canWithdraw || withdrawAmount < withdrawInfo.minimumHc
                                                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                                                        : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
                                                )}
                                            >
                                                {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Withdrawal"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

            </div>
        </DashboardPageShell>
    );
}
