'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePaystackPayment } from 'react-paystack';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowLeft, CreditCard, Tag, Check, Sparkles, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClientComponentClient();

    const planName = searchParams.get('plan');
    const baseAmount = parseInt(searchParams.get('amount') || '0', 10);

    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [couponCode, setCouponCode] = useState('');
    const [discountFreq, setDiscountFreq] = useState(0);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const discountAmount = Math.round(baseAmount * (discountFreq / 100));
    const finalAmount = Math.max(0, baseAmount - discountAmount);

    // No redirect - dashboard layout handles auth
    useEffect(() => {
        async function loadUser() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setEmail(session.user.email || '');
                    setUserId(session.user.id);
                }
            } catch (err) {
                console.error('Failed to load user:', err);
            }
            setIsReady(true);
        }
        loadUser();
    }, [supabase]);

    const handleFreeActivation = async () => {
        setIsProcessing(true);
        const loadingToast = toast.loading('Activating plan...');
        try {
            const res = await fetch('/api/billing/activate-free', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planName, couponCode })
            });
            const data = await res.json();
            if (data.success || res.ok) {
                toast.success('Plan Activated!', { id: loadingToast });
                router.push('/dashboard/billing?success=true');
            } else {
                toast.error(data.error || 'Activation failed', { id: loadingToast });
                setIsProcessing(false);
            }
        } catch {
            toast.error('Connection error', { id: loadingToast });
            setIsProcessing(false);
        }
    };

    const validateCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        try {
            const res = await fetch('/api/coupons/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode })
            });
            const data = await res.json();
            if (data.valid) {
                setDiscountFreq(data.discount_percent);
                toast.success(`Coupon applied! ${data.discount_percent}% off.`);
            } else {
                setDiscountFreq(0);
                toast.error(data.message || 'Invalid coupon code');
            }
        } catch {
            setDiscountFreq(0);
            toast.error('Error validating coupon');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const config = {
        reference: Date.now().toString(),
        email,
        amount: finalAmount,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_placeholder',
        metadata: { user_id: userId, plan_name: planName }
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = async (reference: any) => {
        const loadingToast = toast.loading('Verifying payment...');
        try {
            const res = await fetch('/api/billing/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: reference.reference, plan: planName })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Payment Verified!', { id: loadingToast });
                router.push('/dashboard/billing?success=true');
            } else {
                toast.error('Verification failed.', { id: loadingToast });
            }
        } catch {
            toast.error('Connection error', { id: loadingToast });
        }
    };

    const onClose = () => toast.info('Payment cancelled');

    if (!planName || !baseAmount) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <p className="text-muted-foreground">Invalid checkout session.</p>
                <button onClick={() => router.back()} className="mt-4 text-sm underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-background flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 lg:w-3/5 p-6 md:p-12 lg:p-16 flex flex-col justify-center">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 self-start">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Secure Checkout</h1>
                        <p className="text-muted-foreground flex items-center gap-2"><Lock className="w-4 h-4" /> SSL Encrypted</p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 rounded-xl bg-card border flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{planName} Plan</h3>
                                <p className="text-sm text-muted-foreground">Monthly subscription</p>
                            </div>
                            <span className="font-bold text-xl">₦{(baseAmount / 100).toLocaleString()}</span>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-muted-foreground mb-3 block flex justify-between">
                                <span>Promo Code</span>
                                {discountFreq > 0 && <span className="text-green-500">Active</span>}
                            </label>
                            <div className={cn("flex gap-2 p-1.5 rounded-xl border", discountFreq > 0 ? "bg-green-500/5 border-green-500/30" : "bg-muted/30 border-border")}>
                                <div className="relative flex-1">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Enter code..."
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        disabled={discountFreq > 0}
                                        className="w-full pl-9 pr-4 py-2.5 bg-transparent text-sm outline-none uppercase"
                                    />
                                </div>
                                <button
                                    onClick={validateCoupon}
                                    disabled={!couponCode || isValidatingCoupon || discountFreq > 0}
                                    className={cn("px-5 py-2 rounded-lg text-sm font-bold", discountFreq > 0 ? "bg-green-500 text-white" : "bg-foreground text-background disabled:opacity-50")}
                                >
                                    {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : discountFreq > 0 ? <Check className="w-4 h-4" /> : "Apply"}
                                </button>
                            </div>
                        </div>

                        <div className="border-t pt-6 space-y-3">
                            <div className="flex justify-between text-muted-foreground text-sm">
                                <span>Subtotal</span>
                                <span>₦{(baseAmount / 100).toLocaleString()}</span>
                            </div>
                            {discountFreq > 0 && (
                                <div className="flex justify-between text-green-500 font-medium text-sm">
                                    <span>Discount ({discountFreq}%)</span>
                                    <span>- ₦{(discountAmount / 100).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-end pt-3">
                                <div>
                                    <span className="text-lg font-bold block">Total Due</span>
                                    <span className="text-xs text-muted-foreground">Billed monthly</span>
                                </div>
                                <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-fuchsia-500">
                                    ₦{(finalAmount / 100).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => finalAmount <= 0 ? handleFreeActivation() : initializePayment({ onSuccess, onClose })}
                            disabled={!isReady || isProcessing}
                            className={cn(
                                "w-full py-5 rounded-xl font-bold text-white text-lg flex items-center justify-center gap-2 mt-4",
                                "bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-xl shadow-violet-500/20",
                                (!isReady || isProcessing) && "opacity-70 cursor-not-allowed"
                            )}
                        >
                            {(isProcessing || !isReady) ? <Loader2 className="w-6 h-6 animate-spin" /> :
                                finalAmount <= 0 ? <><Sparkles className="w-5 h-5" /> Activate Free</> :
                                <><CreditCard className="w-5 h-5" /> Complete Payment</>}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                            <ShieldCheck className="w-3 h-3 text-green-500" />
                            <span>Payments processed securely by Paystack</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="hidden md:flex w-1/2 lg:w-2/5 bg-zinc-950 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl" />
                <div className="relative z-10 max-w-sm text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Upgrade to {planName}</h2>
                    <p className="text-zinc-400">Unlock premium features and take your automation to the next level.</p>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
