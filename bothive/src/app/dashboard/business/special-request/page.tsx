'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Building2, ChevronRight, Send, Sparkles, Target, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

const BUSINESS_TYPES = [
    { id: 'ecommerce', label: 'E-Commerce & Retail', icon: '🛍️' },
    { id: 'real_estate', label: 'Real Estate', icon: '🏠' },
    { id: 'saas', label: 'SaaS & Technology', icon: '💻' },
    { id: 'agency', label: 'Agency & Services', icon: '🤝' },
    { id: 'finance', label: 'Finance & Fintech', icon: '💰' },
    { id: 'healthcare', label: 'Healthcare & Wellness', icon: '⚕️' },
    { id: 'education', label: 'Education & EdTech', icon: '🎓' },
    { id: 'other', label: 'Other', icon: '✨' }
];

const GOALS = [
    { id: 'support', label: 'Customer Support (24/7)', icon: '🎧' },
    { id: 'sales', label: 'Lead Gen & Sales', icon: '📈' },
    { id: 'operations', label: 'Internal Operations', icon: '⚙️' },
    { id: 'onboarding', label: 'User Onboarding', icon: '👋' }
];

export default function SpecialBotRequestPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        businessType: '',
        customBusinessType: '',
        primaryGoal: '',
        botName: '',
        description: '',
        brandTone: ''
    });

    const handleNext = () => setStep(s => s + 1);
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        // Simulate API call
        // await new Promise(resolve => setTimeout(resolve, 2000));

        toast.success("Request Received! A Success Manager will contact you shortly.");
        setLoading(false);
        // Reset or redirect
    };

    return (
        <div className="p-6 md:p-12 max-w-5xl mx-auto min-h-screen">
            {/* Header */}
            <div className="mb-12 relative">
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
                        Business Elite
                    </span>
                </div>
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 mb-2">
                    Request Special Bot
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    As a Business partner, you get a dedicated "Special Bot" tailored to your exact industry needs. Tell us what you need, and our experts will build it.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form Area */}
                <div className="lg:col-span-2">
                    <GlassCard className="p-8 border-amber-500/20 bg-gradient-to-b from-card/50 to-card/10 min-h-[500px] flex flex-col">

                        {/* Progress */}
                        <div className="flex items-center gap-2 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={cn(
                                    "h-1 flex-1 rounded-full transition-all duration-500",
                                    step >= i ? "bg-amber-500" : "bg-muted"
                                )} />
                            ))}
                        </div>

                        <div className="flex-1">
                            {/* Step 1: Business Type */}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Building2 className="w-6 h-6 text-amber-500" /> What's your business type?
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {BUSINESS_TYPES.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setFormData({ ...formData, businessType: type.id })}
                                                className={cn(
                                                    "p-4 rounded-xl border text-left transition-all hover:scale-[1.02]",
                                                    formData.businessType === type.id
                                                        ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10"
                                                        : "bg-background/50 border-border hover:border-amber-500/50"
                                                )}
                                            >
                                                <div className="text-2xl mb-2">{type.icon}</div>
                                                <div className="font-semibold text-sm">{type.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                    {formData.businessType === 'other' && (
                                        <div className="mt-4">
                                            <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Specify Industry</label>
                                            <input
                                                value={formData.customBusinessType}
                                                onChange={e => setFormData({ ...formData, customBusinessType: e.target.value })}
                                                className="w-full bg-background/50 border border-border p-3 rounded-xl focus:border-amber-500 outline-none transition-all"
                                                placeholder="e.g. Logistics, Manufacturing..."
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Step 2: Goals */}
                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Target className="w-6 h-6 text-amber-500" /> Primary Goal
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {GOALS.map(goal => (
                                            <button
                                                key={goal.id}
                                                onClick={() => setFormData({ ...formData, primaryGoal: goal.id })}
                                                className={cn(
                                                    "p-6 rounded-xl border text-left transition-all hover:scale-[1.02] flex items-center gap-4",
                                                    formData.primaryGoal === goal.id
                                                        ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10"
                                                        : "bg-background/50 border-border hover:border-amber-500/50"
                                                )}
                                            >
                                                <div className="text-3xl bg-background p-3 rounded-full shadow-sm">{goal.icon}</div>
                                                <div>
                                                    <div className="font-bold">{goal.label}</div>
                                                    <div className="text-xs text-muted-foreground mt-1">Optimization focus</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Details */}
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-amber-500" /> Bot Specs
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Bot Name Idea</label>
                                            <input
                                                value={formData.botName}
                                                onChange={e => setFormData({ ...formData, botName: e.target.value })}
                                                className="w-full bg-background/50 border border-border p-3 rounded-xl focus:border-amber-500 outline-none transition-all"
                                                placeholder="e.g. SalesWizard 3000"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">What should it do?</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full h-32 bg-background/50 border border-border p-3 rounded-xl focus:border-amber-500 outline-none transition-all resize-none"
                                                placeholder="Describe the workflows, integrations, or specific tasks you need..."
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold uppercase text-muted-foreground mb-2 block">Brand Tone</label>
                                            <div className="flex gap-2">
                                                {['Professional', 'Friendly', 'Witty', 'Urgent'].map(tone => (
                                                    <button
                                                        key={tone}
                                                        onClick={() => setFormData({ ...formData, brandTone: tone })}
                                                        className={cn(
                                                            "px-4 py-2 rounded-lg text-sm border transition-all",
                                                            formData.brandTone === tone
                                                                ? "bg-amber-500 text-white border-amber-500"
                                                                : "bg-background border-border hover:border-amber-500"
                                                        )}
                                                    >
                                                        {tone}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between mt-8 pt-8 border-t border-border/50">
                            {step > 1 ? (
                                <button onClick={handleBack} className="px-6 py-2 text-muted-foreground hover:text-foreground">
                                    Back
                                </button>
                            ) : <div />}

                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    disabled={
                                        (step === 1 && !formData.businessType) ||
                                        (step === 2 && !formData.primaryGoal)
                                    }
                                    className="px-8 py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    Next Step <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.botName || !formData.description}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Bot className="w-5 h-5 animate-bounce" /> : <Send className="w-5 h-5" />}
                                    Submit Request
                                </button>
                            )}
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                        <h3 className="font-bold text-amber-500 mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5" /> What to expect
                        </h3>
                        <ul className="space-y-4 text-sm text-foreground/80">
                            <li className="flex gap-3">
                                <span className="bg-amber-500/20 w-6 h-6 rounded-full flex items-center justify-center text-amber-500 text-xs font-bold shrink-0">1</span>
                                <span>We review your request within 24 hours.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="bg-amber-500/20 w-6 h-6 rounded-full flex items-center justify-center text-amber-500 text-xs font-bold shrink-0">2</span>
                                <span>A Success Manager will schedule a discovery call.</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="bg-amber-500/20 w-6 h-6 rounded-full flex items-center justify-center text-amber-500 text-xs font-bold shrink-0">3</span>
                                <span>Our elite engineering team builds your custom bot.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border">
                        <h3 className="font-bold mb-2">Need Inspiration?</h3>
                        <p className="text-sm text-muted-foreground mb-4">See what other Business partners have built.</p>
                        <button className="text-amber-500 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            View Case Studies <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
