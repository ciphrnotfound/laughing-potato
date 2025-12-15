'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, ShieldCheck, Zap, PartyPopper, Sparkles, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    name: 'Starter',
    price: 0,
    description: 'For hobbyists and explorers.',
    features: ['1 Workspace', '3 Active Bots', 'Basic Analytics', 'Community Support'],
    current: true,
  },
  {
    name: 'Pro',
    price: 9900,
    description: 'For power users and creators.',
    features: ['Unlimited Workspaces', 'Unlimited Bots', '1 Free Premium Bot / mo', '15% Store Discount', 'Full HiveMind Access', 'Priority Support'],
    highlight: true,
  },
  {
    name: 'Business',
    price: 24900,
    description: 'For teams scaling up.',
    features: ['Everything in Pro', '1 Free Super Business Bot', '30% Store Discount', 'Request Special Bot', 'Dedicated Success Manager', 'SLA Guarantee'],
  },
];

// Confetti component
function Confetti() {
  /* eslint-disable react-hooks/exhaustive-deps */
  const confettiPieces = useMemo(() => {
    const colors = ['#8B5CF6', '#A855F7', '#D946EF', '#22C55E', '#FBBF24', '#3B82F6'];
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    }));
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.x}vw`, rotate: 0, opacity: 1 }}
          animate={{
            y: '110vh',
            rotate: piece.rotation + 720,
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'linear'
          }}
          style={{
            position: 'absolute',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.borderRadius,
          }}
        />
      ))}
    </div>
  );
}

// Success Modal Component
function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <Confetti />
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 15 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-500/30"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
            >
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>

          {/* Celebration Icons */}
          <div className="flex justify-center gap-2 mb-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <PartyPopper className="w-6 h-6 text-yellow-500" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Sparkles className="w-6 h-6 text-violet-500" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <PartyPopper className="w-6 h-6 text-pink-500" />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
          >
            Welcome to Premium!
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-zinc-400 text-lg mb-8"
          >
            Your plan has been successfully upgraded. Enjoy all the premium features!
          </motion.p>

          {/* Features Highlight */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">You now have access to:</h3>
            <div className="grid grid-cols-2 gap-3 text-left">
              {['Unlimited Bots', 'HiveMind AI', 'Priority Support', 'Store Discounts'].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-violet-600/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-violet-400" />
                  </div>
                  <span className="text-sm text-zinc-300">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-lg flex items-center justify-center gap-2 hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25 group"
          >
            Start Exploring
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4 text-xs text-zinc-600"
          >
            A confirmation email has been sent to your inbox.
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      // Clean up the URL
      window.history.replaceState({}, '', '/dashboard/billing');
    }
  }, [searchParams]);

  const handleUpgrade = (plan: typeof PLANS[0]) => {
    if (plan.price === 0) {
      toast.info("You're already on the Starter plan.");
      return;
    }

    setLoading(plan.name);
    router.push(`/dashboard/billing/checkout?plan=${plan.name}&amount=${plan.price * 100}`);
  };

  return (
    <div className="min-h-screen w-full bg-background p-6 md:p-12 font-sans relative">
      {/* Success Modal */}
      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}

      <div className="max-w-6xl mx-auto mb-16 pt-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto">
          Choose the plan that fits your ambition. Upgrade anytime as you scale your swarm.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {PLANS.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -5 }}
            className={cn(
              "relative rounded-3xl p-8 flex flex-col justify-between border transition-all",
              plan.highlight
                ? "bg-foreground text-background shadow-2xl scale-105 z-10 border-transparent"
                : "bg-card border-border text-foreground hover:border-foreground/20"
            )}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Most Popular
              </div>
            )}

            <div>
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className={cn("text-sm mb-6", plan.highlight ? "text-background/70" : "text-muted-foreground")}>
                {plan.description}
              </p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold">
                  {plan.price === 0 ? "Free" : `₦${plan.price.toLocaleString()}`}
                </span>
                {plan.price > 0 && <span className="text-sm opacity-60">/month</span>}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className={cn("w-5 h-5", plan.highlight ? "text-violet-300" : "text-violet-600")} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleUpgrade(plan)}
              disabled={!!loading || plan.current}
              className={cn(
                "w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                plan.highlight
                  ? "bg-background text-foreground hover:bg-neutral-200"
                  : "bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90",
                plan.current && "opacity-50 cursor-default bg-neutral-200 text-neutral-500 hover:opacity-50 hover:bg-neutral-200"
              )}
            >
              {loading === plan.name ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : plan.current ? (
                "Current Plan"
              ) : (
                <>
                  Upgrade to {plan.name} <Zap className="w-4 h-4" />
                </>
              )}
            </button>

            {plan.highlight && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-background/60">
                <ShieldCheck className="w-3 h-3" />
                Secure payment via Paystack
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
