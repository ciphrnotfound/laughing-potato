'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowLeft, CreditCard, Tag, Check, Sparkles, Lock, MapPin, User as UserIcon, Building, Globe, Mail, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// --- Components ---

/**
 * FAANG-Level Loading Animation
 * Features geometric pulses and glowing rings
 */
const PremiumLoading = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative h-10 w-10">
            <motion.div
                className="h-full w-full rounded-full border-[1.5px] border-zinc-800"
            />
            <motion.div
                className="absolute inset-0 rounded-full border-[1.5px] border-t-violet-500 border-r-transparent border-b-transparent border-l-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
        </div>
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-zinc-500 text-[8px] font-bold uppercase tracking-[0.5em] ml-1.5"
        >
            Connecting
        </motion.p>
    </div>
);

/**
 * Dynamic Mesh Background
 */
const MeshBackground = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
        >
            <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-violet-600/10 rounded-full blur-[160px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-fuchsia-600/10 rounded-full blur-[160px]" />
            <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[140px]" />
            
            {/* Animated Mesh Lines */}
            <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        </motion.div>
    </div>
);

// --- Core Logic ---

// Dynamically import the paystack hook to avoid window is not defined error during SSR
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
    { ssr: false, loading: () => <button disabled className="w-full py-3.5 rounded-xl bg-zinc-900 border border-white/5 opacity-50 cursor-not-allowed flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin" /></button> }
);

type CheckoutStep = 'address' | 'payment';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClientComponentClient();

    const planName = searchParams.get('plan');
    const baseAmount = parseInt(searchParams.get('amount') || '0', 10);

    const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Address State
    const [addressDetails, setAddressDetails] = useState({
        fullName: '',
        addressLine: '',
        city: '',
        country: 'United States',
        postalCode: ''
    });

    const [couponCode, setCouponCode] = useState('');
    const [discountFreq, setDiscountFreq] = useState(0);
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    const discountAmount = Math.round(baseAmount * (discountFreq / 100));
    const finalAmount = Math.max(0, baseAmount - discountAmount);

    useEffect(() => {
        async function loadUser() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setEmail(session.user.email || '');
                    setUserId(session.user.id);
                    setAddressDetails(prev => ({ ...prev, fullName: session.user.user_metadata?.full_name || '' }));
                }
            } catch (err) {
                console.error('Failed to load user:', err);
            }
            setTimeout(() => setIsReady(true), 1200); // Artificial delay for premium feel
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
                body: JSON.stringify({ plan: planName, couponCode, addressDetails })
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
        metadata: { 
            user_id: userId, 
            plan_name: planName,
            address: addressDetails 
        }
    };

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

    const canContinueToPayment = 
        addressDetails.fullName.length > 2 && 
        addressDetails.addressLine.length > 5 &&
        addressDetails.city.length > 2 &&
        addressDetails.postalCode.length > 3;

    if (!isReady) {
        return (
            <div className="h-screen w-full bg-[#08080c] flex items-center justify-center overflow-hidden">
                <MeshBackground />
                <PremiumLoading />
            </div>
        );
    }

    if (!planName || !baseAmount) {
        return (
            <div className="h-screen w-full bg-[#08080c] flex flex-col items-center justify-center p-6 text-center">
                <MeshBackground />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <p className="text-zinc-500 font-medium mb-6">Execution session expired or invalid.</p>
                    <button 
                        onClick={() => router.back()} 
                        className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all active:scale-95"
                    >
                        Return to Dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#08080c] text-white flex flex-col md:flex-row overflow-hidden selection:bg-violet-500/30 font-sans">
            <MeshBackground />

            {/* Left Content Area */}
            <div className="w-full md:w-1/2 lg:w-3/5 p-6 md:p-12 lg:px-24 lg:py-16 flex flex-col relative z-20 overflow-y-auto max-h-screen custom-scrollbar hide-scrollbar">
                <div className="max-w-xl w-full mx-auto">
                    <motion.button 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => currentStep === 'payment' ? setCurrentStep('address') : router.back()} 
                        className="group flex items-center gap-3 text-sm text-zinc-500 hover:text-white transition-all mb-12"
                    >
                        <div className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all">
                            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /> 
                        </div>
                        <span className="font-bold uppercase tracking-widest text-[9px]">
                            {currentStep === 'payment' ? "Back to Information" : "Cancel Checkout"}
                        </span>
                    </motion.button>

                    <AnimatePresence mode="wait">
                        {currentStep === 'address' ? (
                            <motion.div 
                                key="address-step"
                                initial={{ opacity: 0, y: 15, filter: "blur(8px)" }} 
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
                                exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight mb-4 leading-tight">
                                        Where should we send the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">future</span>?
                                    </h1>
                                    <p className="text-zinc-500 text-base">Billing details for your <span className="text-zinc-300 font-medium underline underline-offset-4 decoration-violet-500/50">{planName}</span> subscription.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
                                    <div className="md:col-span-6 space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-violet-500/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                                            <input 
                                                type="text" 
                                                placeholder="Enter legal name"
                                                value={addressDetails.fullName}
                                                onChange={(e) => setAddressDetails({...addressDetails, fullName: e.target.value})}
                                                className="relative w-full bg-zinc-900/40 border border-white/5 focus:border-violet-500/50 rounded-2xl pl-14 pr-6 py-4 text-sm outline-none transition-all placeholder:text-zinc-700 hover:bg-zinc-800/40 backdrop-blur-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-6 space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Street Address</label>
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-violet-500/5 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                                            <input 
                                                type="text" 
                                                placeholder="123 Innovation Dr."
                                                value={addressDetails.addressLine}
                                                onChange={(e) => setAddressDetails({...addressDetails, addressLine: e.target.value})}
                                                className="relative w-full bg-zinc-900/40 border border-white/5 focus:border-violet-500/50 rounded-2xl pl-14 pr-6 py-4 text-sm outline-none transition-all placeholder:text-zinc-700 hover:bg-zinc-800/40 backdrop-blur-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">City</label>
                                        <div className="relative group">
                                            <Building className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                                            <input 
                                                type="text" 
                                                placeholder="Palo Alto"
                                                value={addressDetails.city}
                                                onChange={(e) => setAddressDetails({...addressDetails, city: e.target.value})}
                                                className="relative w-full bg-zinc-900/40 border border-white/5 focus:border-violet-500/50 rounded-2xl pl-14 pr-6 py-4 text-sm outline-none transition-all placeholder:text-zinc-700 hover:bg-zinc-800/40 backdrop-blur-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Postal Code</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                                            <input 
                                                type="text" 
                                                placeholder="94301"
                                                value={addressDetails.postalCode}
                                                onChange={(e) => setAddressDetails({...addressDetails, postalCode: e.target.value})}
                                                className="relative w-full bg-zinc-900/40 border border-white/5 focus:border-violet-500/50 rounded-2xl pl-14 pr-6 py-4 text-sm outline-none transition-all placeholder:text-zinc-700 hover:bg-zinc-800/40 backdrop-blur-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-6 space-y-2">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 ml-1">Country</label>
                                        <div className="relative group">
                                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                                            <select 
                                                value={addressDetails.country}
                                                onChange={(e) => setAddressDetails({...addressDetails, country: e.target.value})}
                                                className="relative w-full bg-zinc-900/40 border border-white/5 focus:border-violet-500/50 rounded-2xl pl-14 pr-6 py-4 text-sm outline-none transition-all hover:bg-zinc-800/40 backdrop-blur-sm appearance-none cursor-pointer"
                                            >
                                                <option value="United States">United States</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                <option value="Nigeria">Nigeria</option>
                                                <option value="Canada">Canada</option>
                                                <option value="Australia">Australia</option>
                                                <option value="Germany">Germany</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <motion.button 
                                    whileHover={{ scale: canContinueToPayment ? 1.015 : 1 }}
                                    whileTap={{ scale: canContinueToPayment ? 0.99 : 1 }}
                                    onClick={() => setCurrentStep('payment')}
                                    disabled={!canContinueToPayment}
                                    className={cn(
                                        "w-full py-3.5 rounded-xl font-bold text-sm transition-all relative overflow-hidden group shadow-lg",
                                        canContinueToPayment 
                                            ? "bg-white text-black hover:bg-zinc-100 shadow-white/5" 
                                            : "bg-zinc-900/50 text-zinc-600 cursor-not-allowed border border-white/5"
                                    )}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Review Order
                                        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                    </span>
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="payment-step"
                                initial={{ opacity: 0, y: 15, filter: "blur(8px)" }} 
                                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
                                exit={{ opacity: 0, y: -15, filter: "blur(8px)" }}
                                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <h1 className="text-4xl font-bold tracking-tight mb-3 leading-tight">
                                        One <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">final</span> check.
                                    </h1>
                                    <p className="text-zinc-500 text-base">Your workspace will be upgraded immediately.</p>
                                </div>

                                <div className="space-y-6">
                                    {/* Order Summary V3 - Sleeker */}
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-violet-600/5 blur-[40px] opacity-20 group-hover:opacity-30 transition-opacity" />
                                        <div className="relative p-8 rounded-3xl bg-zinc-950/40 border border-white/10 backdrop-blur-md overflow-hidden">
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <p className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.3em] mb-1.5 font-mono">Plan</p>
                                                    <h3 className="text-2xl font-bold text-white tracking-tight">{planName} Swarm</h3>
                                                </div>
                                                <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                                    <Sparkles className="w-6 h-6 text-violet-500" />
                                                </div>
                                            </div>

                                            <div className="space-y-4 border-t border-white/5 pt-6">
                                                <div className="flex justify-between items-center text-zinc-400">
                                                    <span className="text-xs">Subtotal</span>
                                                    <span className="font-mono text-white text-base font-medium">₦{(baseAmount / 100).toLocaleString()}</span>
                                                </div>
                                                {discountFreq > 0 && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.98 }} 
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="flex justify-between items-center text-violet-400 bg-violet-500/5 px-3 py-2 rounded-xl border border-violet-500/10"
                                                    >
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">DiscountApplied ({discountFreq}%)</span>
                                                        <span className="font-mono font-bold">-₦{(discountAmount / 100).toLocaleString()}</span>
                                                    </motion.div>
                                                )}
                                                <div className="pt-4 flex justify-between items-end border-t border-white/5">
                                                    <div>
                                                        <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5 block">Total Payable</span>
                                                        <span className="text-zinc-400 font-medium text-[10px]">Monthly Billing</span>
                                                    </div>
                                                    <span className="text-4xl font-black text-white tracking-tighter">
                                                        ₦{(finalAmount / 100).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Coupon UI V3 - Minimalist */}
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 ml-1">Promo Code</label>
                                        <div className="flex gap-3">
                                            <div className="relative flex-1 group">
                                                <Tag className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-violet-400 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="VERIFICATION KEY"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value)}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-zinc-900/40 border border-white/5 rounded-xl text-[10px] font-bold font-mono outline-none uppercase tracking-[0.3em] placeholder:text-zinc-800 transition-all backdrop-blur-sm"
                                                />
                                            </div>
                                            <button
                                                onClick={validateCoupon}
                                                disabled={!couponCode || isValidatingCoupon || discountFreq > 0}
                                                className="px-6 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl border border-white/10 transition-all font-mono"
                                            >
                                                {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Verify"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        {finalAmount <= 0 ? (
                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={handleFreeActivation}
                                                disabled={!isReady || isProcessing}
                                                className="w-full py-3.5 rounded-xl font-bold text-sm bg-white text-black hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 shadow-lg shadow-white/5"
                                            >
                                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                                                <><Sparkles className="w-4 h-4" /> Start Free Trial</>}
                                            </motion.button>
                                        ) : (
                                            <PaystackButton
                                                config={config}
                                                onSuccess={onSuccess}
                                                onClose={onClose}
                                                disabled={!isReady || isProcessing}
                                                className="w-full py-3.5 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 text-white transition-all flex items-center justify-center gap-3 shadow-md shadow-violet-600/10 active:scale-[0.99]"
                                            >
                                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                                                <><CreditCard className="w-4 h-4" /> Secure Checkout</>}
                                            </PaystackButton>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center justify-center gap-3 py-2 opacity-30">
                                        <div className="h-[0.5px] bg-white/20 flex-1" />
                                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500 whitespace-nowrap">
                                            Bank-Grade Encryption
                                        </p>
                                        <div className="h-[0.5px] bg-white/20 flex-1" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Panel - Immersive Trust V2 */}
            <div className="hidden md:flex w-1/2 lg:w-2/5 bg-[#0a0a0f] border-l border-white/5 relative items-center justify-center p-20 overflow-hidden">
                {/* Visual Decorative Mesh 2 */}
                <div className="absolute inset-0">
                    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.1)_0,transparent_60%)]" />
                    <motion.div 
                        animate={{ 
                            backgroundPosition: ["0% 0%", "100% 100%"],
                            opacity: [0.05, 0.08, 0.05]
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 opacity-10 pointer-events-none"
                    >
                         <div className="h-full w-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat" />
                    </motion.div>
                </div>

                <div className="relative z-10 w-full max-w-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-12 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-900/50 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm"
                    >
                        <ShieldCheck className="w-4 h-4 text-violet-400" /> Secure Protocol v3.1
                    </motion.div>
                    
                    <h2 className="text-6xl font-bold leading-[1.1] mb-12 tracking-tighter">
                        Power the <span className="text-zinc-600 block">next level.</span>
                    </h2>
                    
                    <div className="space-y-10">
                        {[
                            { title: "Neural Orchestration", desc: "Unlock sub-second swarm latency across all connected nodes." },
                            { title: "Universal Integration", desc: "Connect Slack, Notion, and HubSpot seamlessly with zero-config." },
                            { title: "Enterprise Reliability", desc: "Dedicated cloud instances for your sensitive agentic workloads." }
                        ].map((item, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + idx * 0.1 }}
                                className="group flex gap-6"
                            >
                                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-500/10 group-hover:border-violet-500/30 transition-all">
                                    <Check className="w-5 h-5 text-violet-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{item.title}</h4>
                                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 pt-12 border-t border-white/5 flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                             <Lock className="w-3 h-3 text-zinc-600" />
                             <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Global Partner Network</span>
                        </div>
                         <div className="flex flex-wrap gap-8 opacity-20 grayscale brightness-200">
                             {/* Abstract minimalist logo shapes for FAANG vibe */}
                             <div className="h-3 w-10 bg-white rounded-full translate-y-1" />
                             <div className="h-4 w-12 border-2 border-white rounded-md" />
                             <div className="h-5 w-5 border-2 border-white rotate-45" />
                             <div className="h-4 w-8 bg-white skew-x-12" />
                             <div className="h-4 w-10 bg-white rounded-tl-xl rounded-br-xl" />
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full bg-[#08080c] flex items-center justify-center">
                <PremiumLoading />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
