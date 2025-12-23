"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, ArrowLeft, ShieldCheck, Check, Sparkles, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import dynamic from 'next/dynamic';
import { useAppSession } from "@/lib/app-session-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Dynamically import Paystack to avoid SSR issues
const PaystackButton = dynamic(
    () => import('react-paystack').then((mod) => {
        const PaystackHookButton = ({ config, onSuccess, onClose, children, disabled, className }: any) => {
            const initializePayment = mod.usePaystackPayment(config);
            return (
                <button
                    onClick={() => initializePayment({ onSuccess, onClose })}
                    disabled={disabled}
                    className={className}
                >
                    {children}
                </button>
            );
        };
        return PaystackHookButton;
    }),
    { ssr: false, loading: () => <button disabled className="w-full py-4 rounded-xl bg-white/5 animate-pulse" /> }
);

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { profile } = useAppSession();

    const planName = searchParams.get('plan');
    const amount = Number(searchParams.get('amount'));
    const [email, setEmail] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
    const [isApplying, setIsApplying] = useState(false);

    // Calculate discounted amount
    const discountAmount = appliedCoupon ? Math.floor(amount * (appliedCoupon.discount / 100)) : 0;
    const finalAmount = amount - discountAmount;

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsApplying(true);

        try {
            const response = await fetch('/api/coupons/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode }),
            });

            const data = await response.json();

            if (data.valid) {
                setAppliedCoupon({
                    code: data.code,
                    discount: data.discount_percent
                });
                toast.success(`Coupon ${data.code} applied! ${data.discount_percent}% discount added.`);
            } else {
                toast.error(data.message || 'Invalid coupon code.');
                setAppliedCoupon(null);
            }
        } catch (error) {
            console.error('Coupon verification error:', error);
            toast.error('Failed to verify coupon. Please try again.');
            setAppliedCoupon(null);
        } finally {
            setIsApplying(false);
        }
    };

    // Redirect if invalid params
    useEffect(() => {
        if (!planName || !amount) {
            router.push('/dashboard/billing');
        }
        if (profile?.email) {
            setEmail(profile.email);
        }
    }, [planName, amount, router, profile]);

    const config = {
        reference: (new Date()).getTime().toString(),
        email: email || "user@example.com",
        amount: finalAmount, // Use final calculation
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
    };

    const handleSuccess = async (reference: any) => {
        setIsApplying(true); // Show loader
        toast.info("Verifying payment...");

        try {
            // 1. Verify payment and update plan in DB
            const verifyResponse = await fetch('/api/billing/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference: reference.reference,
                    plan: planName,
                    couponCode: appliedCoupon?.code
                }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyData.success) {
                toast.error(verifyData.error || "Verification failed. Please contact support.");
                setIsApplying(false);
                return;
            }

            toast.success("Payment successful and plan activated!");
            router.push('/dashboard/billing?success=true&plan=' + planName);
        } catch (error) {
            console.error("Error finalizing checkout:", error);
            toast.error("An error occurred during verification.");
            setIsApplying(false);
        }
    };

    const handleFreeActivation = async () => {
        if (!appliedCoupon || finalAmount > 0) return;
        setIsApplying(true);

        try {
            const response = await fetch('/api/billing/activate-free', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    plan: planName,
                    couponCode: appliedCoupon.code
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message || "Plan activated successfully!");
                router.push('/dashboard/billing?success=true&plan=' + planName);
            } else {
                toast.error(data.error || "Failed to activate plan.");
                setIsApplying(false);
            }
        } catch (error) {
            console.error("Free activation error:", error);
            toast.error("An unexpected error occurred.");
            setIsApplying(false);
        }
    };

    const handleClose = () => {
        toast.info("Payment cancelled.");
    };

    if (!planName || !amount) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Simple Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[200px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative w-full max-w-md z-10"
            >
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
                        Checkout
                    </h1>
                    <p className="text-white/50">
                        Complete your subscription to <span className="text-white font-medium">{planName}</span>.
                    </p>
                </div>

                <div className="relative rounded-3xl border border-white/[0.04] bg-[#0a0a0f] p-1">
                    <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />

                    <div className="relative rounded-[1.4rem] bg-[#0a0a0f] p-8 overflow-hidden">
                        <div className="flex justify-between items-start pb-6 border-b border-white/[0.06] mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-white">{planName}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <Sparkles className="w-3 h-3 text-violet-400" />
                                    <span className="text-xs text-violet-400 font-medium">Monthly Plan</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-semibold text-white">₦{(amount / 100).toLocaleString()}</p>
                            </div>
                        </div>

                        <ul className="space-y-3 mb-6">
                            <li className="flex justify-between text-sm">
                                <span className="text-white/60">Subtotal</span>
                                <span className="text-white">₦{(amount / 100).toLocaleString()}</span>
                            </li>
                            {appliedCoupon && (
                                <motion.li
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex justify-between text-sm text-violet-400"
                                >
                                    <span>Discount ({appliedCoupon.code})</span>
                                    <span>- ₦{(discountAmount / 100).toLocaleString()}</span>
                                </motion.li>
                            )}
                            <li className="flex justify-between text-sm">
                                <span className="text-white/60">Tax</span>
                                <span className="text-white">₦0.00</span>
                            </li>
                            <li className="flex justify-between text-lg font-medium pt-4 border-t border-white/[0.06]">
                                <span className="text-white">Total</span>
                                <span className="text-white">₦{(finalAmount / 100).toLocaleString()}</span>
                            </li>
                        </ul>

                        {/* Coupon Input */}
                        <div className={cn(
                            "mb-8 p-1.5 rounded-xl border flex items-center gap-2 transition-all",
                            appliedCoupon
                                ? "border-emerald-500/50 bg-emerald-500/5"
                                : "border-white/[0.04] bg-white/[0.02] focus-within:border-violet-500/50"
                        )}>
                            <div className="flex-1 flex items-center px-3 gap-2">
                                <input
                                    type="text"
                                    placeholder="Coupon code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/20 uppercase"
                                />
                                {appliedCoupon && <Check className="w-3 h-3 text-emerald-400" />}
                            </div>
                            <button
                                onClick={handleApplyCoupon}
                                disabled={isApplying || !!(appliedCoupon && couponCode.toUpperCase() === appliedCoupon.code)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-xs font-semibold transition-all border",
                                    appliedCoupon
                                        ? "bg-emerald-500 text-white border-emerald-400"
                                        : "bg-white/5 hover:bg-white/10 text-white border-white/[0.05]"
                                )}
                            >
                                {isApplying ? <Loader2 className="w-3 h-3 animate-spin" /> : appliedCoupon ? 'Applied' : 'Apply'}
                            </button>
                        </div>

                        {finalAmount === 0 ? (
                            <button
                                onClick={handleFreeActivation}
                                disabled={isApplying}
                                className={cn(
                                    "w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg",
                                    isApplying
                                        ? "bg-white/10 text-white/20 cursor-not-allowed"
                                        : "bg-violet-600 text-white hover:bg-violet-500 shadow-violet-500/20"
                                )}
                            >
                                {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Start Free Trial <Sparkles className="w-4 h-4" /></>}
                            </button>
                        ) : (
                            <PaystackButton
                                disabled={isApplying}
                                className={cn(
                                    "w-full py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg",
                                    isApplying
                                        ? "bg-white/10 text-white/20 cursor-not-allowed"
                                        : "bg-white text-black hover:bg-neutral-200 shadow-white/5"
                                )}
                                {...{ config, onSuccess: handleSuccess, onClose: handleClose }}
                            >
                                {isApplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Pay with Paystack <CreditCard className="w-4 h-4" /></>}
                            </PaystackButton>
                        )}

                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-white/20">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Secured by Paystack</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
