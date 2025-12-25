'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Tag, Copy, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { useGlassAlert } from "@/components/ui/glass-alert";
import { cn } from '@/lib/utils';

export default function CouponAdminPage() {
    const supabase = createClientComponentClient();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newCode, setNewCode] = useState('');
    const [discount, setDiscount] = useState<number>(20); // Typed as number
    const [creating, setCreating] = useState(false);
    const { showAlert } = useGlassAlert();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (data) setCoupons(data);
        setLoading(false);
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        const prefix = ['SUMMER', 'WINTER', 'FLASH', 'HIVE', 'PRO'];
        const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)];

        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setNewCode(`${randomPrefix}-${result}`);
    };

    const handleCreate = async () => {
        if (!newCode || !discount || discount < 1 || discount > 100) {
            await showAlert("Protocol Violation", "Please provide a valid token identifier and reduction factor (1-100).", "warning");
            return;
        }
        setCreating(true);

        try {
            const res = await fetch('/api/coupons/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: newCode, discount_percent: discount })
            });

            if (res.ok) {
                await showAlert("Voucher Generated", "Coupon has been successfully archived in the hive database. 🎟️", "success");
                fetchCoupons();
                setNewCode('');
            } else {
                const err = await res.json();
                await showAlert("Generation Failure", err.error || "Failed to commit coupon to the network.", "error");
            }
        } catch (e) {
            await showAlert("Network Desync", "An error occurred during communication with the coupon cluster.", "error");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto min-h-screen">
            <div className="mb-12 relative">
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-2">
                    Coupon Manager
                </h1>
                <p className="text-muted-foreground text-lg">Create and manage discount codes for your growing hive.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creator Card */}
                <GlassCard className="p-8 h-fit lg:col-span-1 border-violet-500/20 bg-gradient-to-b from-card/50 to-card/10">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-violet-500" /> Create New Coupon
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block tracking-wider">Coupon Code</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                        placeholder="CODE123"
                                        className="w-full pl-9 pr-3 py-3 bg-background/50 border border-border rounded-xl text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-violet-500/50 outline-none transition-all placeholder:text-muted-foreground/50"
                                    />
                                </div>
                                <button
                                    onClick={generateRandomCode}
                                    className="p-3 bg-background/50 border border-border hover:bg-violet-500/10 hover:border-violet-500/30 rounded-xl transition-all group"
                                    title="Generate Random"
                                >
                                    <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block tracking-wider">Discount Percentage</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={discount}
                                    onChange={(e) => {
                                        // Fix NaN issue by defaulting empty string to 0 or handling value directly
                                        const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                        setDiscount(val);
                                    }}
                                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-violet-500/50 outline-none transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-1">
                                <span>1%</span>
                                <span>50%</span>
                                <span>100%</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={discount || 0}
                                onChange={(e) => setDiscount(parseInt(e.target.value))}
                                className="w-full mt-2 accent-violet-500 h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <button
                            onClick={handleCreate}
                            disabled={creating || !newCode || !discount}
                            className={cn(
                                "w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all mt-4",
                                creating ? "bg-muted cursor-not-allowed text-muted-foreground" : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-violet-600/25 active:scale-95"
                            )}
                        >
                            {creating ? 'Creating...' : 'Create Coupon'} <Sparkles className="w-4 h-4" />
                        </button>
                    </div>
                </GlassCard>

                {/* List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-violet-500" /> Active Coupons
                    </h2>

                    {loading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-xl" />
                            ))}
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
                            <Tag className="w-12 h-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground font-medium">No active coupons yet.</p>
                            <p className="text-sm text-muted-foreground/60">Create your first one to get started.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            <AnimatePresence>
                                {coupons.map((coupon, i) => (
                                    <motion.div
                                        key={coupon.code}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="relative group p-1 rounded-2xl bg-gradient-to-r from-border/50 to-border/10 hover:from-violet-500/20 hover:to-fuchsia-500/20 transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between p-5 rounded-xl bg-card border border-border/50 group-hover:border-transparent transition-all">
                                            <div className="flex items-center gap-5">
                                                <div className={cn(
                                                    "h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-bold shadow-inner",
                                                    coupon.discount_percent >= 50
                                                        ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-500"
                                                        : "bg-gradient-to-br from-emerald-500/20 to-green-500/20 text-emerald-500"
                                                )}>
                                                    <span className="text-lg leading-none">{coupon.discount_percent}</span>
                                                    <span className="text-[10px] opacity-80">%</span>
                                                </div>
                                                <div>
                                                    <div className="font-mono font-bold text-xl tracking-wider text-foreground group-hover:text-violet-500 transition-colors">
                                                        {coupon.code}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground font-medium mt-1 flex items-center gap-2">
                                                        <span>Created {new Date(coupon.created_at).toLocaleDateString()}</span>
                                                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                                        <span className="text-green-500 flex items-center gap-1">
                                                            Active <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={async () => {
                                                        navigator.clipboard.writeText(coupon.code);
                                                        await showAlert("Token Duplicated", "The coupon code has been transferred to your clipboard buffer.", "success");
                                                    }}
                                                    className="p-3 hover:bg-muted rounded-xl transition-all text-muted-foreground hover:text-foreground"
                                                    title="Copy Code"
                                                >
                                                    <Copy className="w-5 h-5" />
                                                </button>
                                                {/* Delete functionality would go here */}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
