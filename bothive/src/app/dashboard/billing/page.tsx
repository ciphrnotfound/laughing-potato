"use client";

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, ShieldCheck, Zap, PartyPopper, Sparkles, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { useAppSession } from "@/lib/app-session-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

// Success Modal Component (Refined)
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-[#0a0a0f] border border-white/[0.08] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
        >
          <div className="absolute inset-0 bg-violet-500/5 blur-3xl -z-10 rounded-3xl" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>

          <h2 className="text-2xl font-semibold text-white mb-2">
            Welcome to Premium
          </h2>
          <p className="text-white/50 text-sm mb-8">
            Your workspace has been successfully upgraded.
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors"
          >
            Continue to Dashboard
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

const BillingContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const { profile, loading: sessionLoading } = useAppSession();

  const [loading, setLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  // Default to Starter, sync will update if needed
  const [currentPlanName, setCurrentPlanName] = useState<string>('Starter');
  const [isSyncing, setIsSyncing] = useState(true);

  // Safety timeout - don't show loading spinner forever
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isSyncing) {
        console.log('[BillingPage] Safety timeout - stopping sync');
        setIsSyncing(false);
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isSyncing]);

  useEffect(() => {
    const syncPlan = async () => {
      // If session is still loading, wait for it
      if (sessionLoading) {
        return;
      }

      // If no profile, just show Starter
      if (!profile?.id) {
        setIsSyncing(false);
        return;
      }

      console.log('[BillingPage] Fetching plan for user:', profile.id);

      try {
        // Try user_subscriptions first
        const { data: subscription, error: subError } = await supabase
          .from('user_subscriptions')
          .select('tier, subscription_status, current_period_end')
          .eq('user_id', profile.id)
          .maybeSingle();

        if (!subError && subscription?.tier) {
          const tier = subscription.tier;
          const status = (subscription as any).subscription_status;

          // Only use if active and not expired
          if (status === 'active') {
            const periodEnd = subscription.current_period_end;
            if (!periodEnd || new Date(periodEnd) >= new Date()) {
              const lower = tier.toLowerCase();
              if (lower === 'pro' || lower.includes('pro')) {
                setCurrentPlanName('Pro');
              } else if (lower === 'business' || lower.includes('business')) {
                setCurrentPlanName('Business');
              }
            }
          }
        }

        // Also check user_profiles as backup
        if (currentPlanName === 'Starter') {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('user_id', profile.id)
            .maybeSingle();

          if (profileData?.role) {
            const role = profileData.role.toLowerCase();
            if (role === 'business' || role === 'enterprise') {
              setCurrentPlanName('Business');
            } else if (role === 'developer') {
              setCurrentPlanName('Pro');
            }
          }
        }

      } catch (err) {
        console.error('[BillingPage] Error:', err);
      }

      setIsSyncing(false);
    };
    syncPlan();
  }, [profile?.id, sessionLoading]);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      window.history.replaceState({}, '', '/dashboard/billing');
      const newPlan = searchParams.get('plan');
      if (newPlan) setCurrentPlanName(newPlan);
    }
  }, [searchParams]);

  const handleUpgrade = (plan: typeof PLANS[0]) => {
    if (plan.name === currentPlanName) return;
    if (plan.price === 0) return;

    setLoading(plan.name);
    router.push(`/dashboard/billing/checkout?plan=${plan.name}&amount=${plan.price * 100}`);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f] text-white p-6 md:p-12 font-sans relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1a1025] rounded-full blur-[200px]"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}

      <div className="relative max-w-6xl mx-auto z-10">
        <div className="text-center mb-16 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-white/40 text-sm uppercase mb-4">Billing & Plans</p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
              Manage your subscription
            </h1>
            <p className="text-white/50 max-w-xl mx-auto">
              Simple pricing for every stage of your autonomous workforce.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, index) => {
            const isCurrentPlan = plan.name === currentPlanName;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative h-full"
              >
                <div className={cn(
                  "relative h-full rounded-3xl border bg-[#0a0a0f] p-1",
                  isCurrentPlan ? "border-emerald-500/50" : plan.highlight ? "border-violet-500/50" : "border-white/[0.04]"
                )}>
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                  />

                  <div className="relative h-full flex flex-col justify-between rounded-[1.3rem] p-8 bg-[#0a0a0f] overflow-hidden">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-medium text-white">{plan.name}</h3>
                        {isSyncing ? (
                          <span className="px-3 py-1 rounded-full bg-white/5 text-white/20 text-xs flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                          </span>
                        ) : isCurrentPlan ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Current
                          </span>
                        ) : plan.highlight && (
                          <span className="px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-semibold border border-violet-500/20">
                            Recommended
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-4xl font-semibold text-white">
                          {plan.price === 0 ? "Free" : `₦${plan.price.toLocaleString()}`}
                        </span>
                        {plan.price > 0 && <span className="text-sm text-white/40">/month</span>}
                      </div>

                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-3 text-sm text-white/70">
                            <div className="w-5 h-5 rounded-full bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleUpgrade(plan)}
                      disabled={!!loading || isCurrentPlan}
                      className={cn(
                        "w-full py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2",
                        isCurrentPlan
                          ? "bg-white/[0.05] text-white/40 cursor-default"
                          : plan.highlight
                            ? "bg-white text-black hover:bg-neutral-200"
                            : "bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.05]"
                      )}
                    >
                      {loading === plan.name ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        "Active Plan"
                      ) : (
                        <>
                          Upgrade <Zap className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/20" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
