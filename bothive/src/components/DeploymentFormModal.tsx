"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ChevronRight,
    ChevronLeft,
    Sparkles,
    Check,
    AlertCircle,
    Instagram,
    Mail,
    MessageCircle,
    Globe,
    Phone,
    Zap,
    Bot,
    Rocket,
    CreditCard,
    LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { ProfessionalAlert } from "@/components/ui/glass-alert";

interface DeploymentFormData {
    botName: string;
    description: string;
    type: "agent" | "bot";
    category: string;
    pricingTier: "free" | "basic" | "pro";
    sendEmailConfirmation: boolean;
    acceptedTerms: boolean;
    channels: string[];
}

interface DeploymentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: DeploymentFormData) => void;
    initialData?: Partial<DeploymentFormData>;
}

interface DeploymentResult {
    success: boolean;
    status: "pending" | "approved" | "rejected";
    message: string;
    botId?: string;
}

const STEPS = [
    { id: 1, title: "Identity", icon: Bot },
    { id: 2, title: "Channels", icon: Globe },
    { id: 3, title: "Pricing", icon: CreditCard },
    { id: 4, title: "Review", icon: Rocket },
];

const CHANNELS = [
    { id: "web", name: "Web Widget", icon: Globe, color: "from-blue-500 to-cyan-500" },
    { id: "whatsapp", name: "WhatsApp", icon: Phone, color: "from-green-500 to-emerald-500" },
    { id: "telegram", name: "Telegram", icon: MessageCircle, color: "from-sky-500 to-blue-500" },
    { id: "instagram", name: "Instagram", icon: Instagram, color: "from-pink-500 to-rose-500" },
    { id: "email", name: "Email", icon: Mail, color: "from-yellow-500 to-orange-500" },
];

const CATEGORIES = [
    { value: "productivity", label: "Productivity", icon: "⚡", color: "from-violet-500 to-purple-500" },
    { value: "sales", label: "Sales & Marketing", icon: "📈", color: "from-blue-500 to-indigo-500" },
    { value: "support", label: "Customer Support", icon: "💬", color: "from-green-500 to-teal-500" },
    { value: "development", label: "Development", icon: "💻", color: "from-cyan-500 to-blue-500" },
    { value: "analytics", label: "Analytics", icon: "📊", color: "from-orange-500 to-red-500" },
    { value: "other", label: "Other", icon: "🔧", color: "from-gray-500 to-slate-500" },
];

export default function DeploymentFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
}: DeploymentFormModalProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<DeploymentFormData>({
        botName: initialData?.botName || "",
        description: initialData?.description || "",
        type: initialData?.type || "bot",
        category: initialData?.category || "productivity",
        pricingTier: initialData?.pricingTier || "free",
        sendEmailConfirmation: initialData?.sendEmailConfirmation ?? true,
        acceptedTerms: initialData?.acceptedTerms ?? false,
        channels: initialData?.channels ?? [],
    });

    const [errors, setErrors] = useState<Partial<Record<keyof DeploymentFormData, string>>>({});
    const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
    const [showAlert, setShowAlert] = useState(false);

    const validateStep = (currentStep: number) => {
        const newErrors: Partial<Record<keyof DeploymentFormData, string>> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.botName.trim()) {
                newErrors.botName = "Bot name is required";
                isValid = false;
            }
            if (!formData.description.trim()) {
                newErrors.description = "Description is required";
                isValid = false;
            }
        } else if (currentStep === 2) {
            if (formData.channels.length === 0) {
                newErrors.channels = "Select at least one channel";
                isValid = false;
            }
        } else if (currentStep === 4) {
            if (!formData.acceptedTerms) {
                newErrors.acceptedTerms = "You must accept the terms";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep((prev) => Math.min(prev + 1, STEPS.length));
        }
    };

    const handleBack = () => {
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (validateStep(step)) {
            // Call parent onSubmit
            onSubmit(formData);

            // Simulate deployment and check approval status
            // In production, this would be an API call that returns the bot status
            try {
                const response = await fetch("/api/bots/deploy", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                setDeploymentResult({
                    success: result.success ?? true,
                    status: result.status ?? "pending", // "pending" or "approved"
                    message: result.message ?? "",
                    botId: result.botId,
                });

                setShowAlert(true);

                // Close modal after showing alert
                setTimeout(() => {
                    onClose();
                }, 500);
            } catch (error) {
                // Fallback for demo - show pending status
                setDeploymentResult({
                    success: true,
                    status: "pending",
                    message: "Bot deployed successfully! Awaiting approval from Bothive team.",
                });
                setShowAlert(true);

                setTimeout(() => {
                    onClose();
                }, 500);
            }
        }
    };

    const toggleChannel = (channelId: string) => {
        setFormData(prev => ({
            ...prev,
            channels: prev.channels.includes(channelId)
                ? prev.channels.filter(c => c !== channelId)
                : [...prev.channels, channelId]
        }));
    };

    // Styling tokens matching sign-in page
    const cardShellClass = cn(
        "pointer-events-none absolute inset-0 rounded-[28px] border backdrop-blur-xl transition-all duration-500",
        isDark
            ? "border-white/12 bg-[#0C1323]/80 shadow-[0_48px_120px_rgba(12,15,35,0.55)]"
            : "border-[#B8C4FF]/40 bg-white/80 shadow-[0_44px_110px_rgba(88,112,255,0.18)]"
    );

    const subduedText = isDark ? "text-white/55" : "text-[#0C1024]/55";
    const subtleText = isDark ? "text-white/40" : "text-[#0C1024]/40";
    const strongText = isDark ? "text-white" : "text-[#0C1024]";

    const inputClass = cn(
        "w-full rounded-xl border py-3 pr-4 text-sm transition focus:outline-none focus:ring-2",
        isDark
            ? "border-white/12 bg-black/40 text-white placeholder:text-white/35 focus:border-white/30 focus:ring-white/20"
            : "border-[#D7DEF8] bg-white/90 text-[#0C1024] placeholder:text-[#3B446B]/55 focus:border-[#A3B4F2] focus:ring-[#CDD5FF]"
    );

    const submitButtonClass = cn(
        "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
        isDark
            ? "bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white shadow-[0_16px_40px_rgba(108,67,255,0.35)] hover:brightness-110"
            : "bg-gradient-to-r from-[#5163FF] to-[#7F92FF] text-white shadow-[0_18px_46px_rgba(118,132,255,0.28)] hover:brightness-105"
    );

    const secondaryButtonClass = cn(
        "text-sm font-medium transition",
        isDark ? "text-white/50 hover:text-white" : "text-[#0C1024]/50 hover:text-[#0C1024]"
    );

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className={cn(
                        "fixed inset-0 z-50 flex items-center justify-center px-4 py-16 sm:px-6",
                        "transition-colors duration-500",
                        isDark
                            ? "bg-[#070910]"
                            : "bg-gradient-to-br from-[#F5F7FF] via-white to-[#E9EEFF]"
                    )}>
                        {/* Backdrop with hexagon pattern */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="absolute inset-0"
                        >
                            <div className={cn("absolute inset-0", isDark ? "bg-black/40" : "bg-white/40")} />
                            {/* Hexagonal hive pattern */}
                            <div
                                className="absolute inset-0 opacity-30"
                                style={{
                                    backgroundImage: isDark
                                        ? `radial-gradient(circle 8px at 50% 0, transparent 99%, rgba(255,255,255,0.1) 100%),
                                           radial-gradient(circle 8px at 100% 50%, transparent 99%, rgba(255,255,255,0.1) 100%),
                                          radial-gradient(circle 8px at 0% 50%, transparent 99%, rgba(255,255,255,0.1) 100%)`
                                        : `radial-gradient(circle 8px at 50% 0, transparent 99%, rgba(108,67,255,0.15) 100%),
                                           radial-gradient(circle 8px at 100% 50%, transparent 99%, rgba(108,67,255,0.15) 100%),
                                           radial-gradient(circle 8px at 0% 50%, transparent 99%, rgba(108,67,255,0.15) 100%)`,
                                    backgroundSize: "50px 87px",
                                    backgroundPosition: "0 0, 25px 44px, 25px 44px",
                                }}
                            />
                            <div className="absolute inset-0 backdrop-blur-sm" />
                        </motion.div>

                        {/* Modal Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.45, ease: "easeOut" }}
                            className="relative w-full max-w-md"
                        >
                            <div className={cardShellClass} />

                            {/* Hexagon pattern overlay on card */}
                            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
                                <div
                                    className={cn(
                                        "absolute inset-0",
                                        isDark
                                            ? "bg-[radial-gradient(circle_at_top,rgba(124,68,255,0.22),transparent_70%)]"
                                            : "bg-[radial-gradient(circle_at_top,rgba(104,120,255,0.18),transparent_72%)]"
                                    )}
                                />
                                <div
                                    className="absolute inset-0 mix-blend-overlay opacity-20"
                                    style={{
                                        backgroundImage: isDark
                                            ? `radial-gradient(circle 5px at 50% 0, transparent 99%, rgba(255,255,255,0.08) 100%),
                                           radial-gradient(circle 5px at 100% 50%, transparent 99%, rgba(255,255,255,0.08) 100%),
                                           radial-gradient(circle 5px at 0% 50%, transparent 99%, rgba(255,255,255,0.08) 100%)`
                                            : `radial-gradient(circle 5px at 50% 0, transparent 99%, rgba(108,67,255,0.1) 100%),
                                           radial-gradient(circle 5px at 100% 50%, transparent 99%, rgba(108,67,255,0.1) 100%),
                                           radial-gradient(circle 5px at 0% 50%, transparent 99%, rgba(108,67,255,0.1) 100%)`,
                                        backgroundSize: "35px 61px",
                                        backgroundPosition: "0 0, 17.5px 30.5px, 17.5px 30.5px",
                                    }}
                                />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 space-y-8 px-8 py-10 sm:px-10">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8C89FF] via-[#A3A0FF] to-white shadow-[0_14px_32px_rgba(124,111,255,0.42)]">
                                            <Rocket className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className={cn("text-xs font-semibold uppercase tracking-[0.28em]", subduedText)}>Deploy</p>
                                            <p className={cn("text-lg font-semibold", strongText)}>Launch your assistant</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className={cn(
                                            "group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                                            isDark
                                                ? "border-white/12 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10"
                                                : "border-[#D7DEF8] bg-white/80 text-[#0C1024]/70 hover:border-[#B3C2FF] hover:bg-white"
                                        )}
                                        aria-label="Close"
                                    >
                                        <X className="h-4.5 w-4.5" />
                                    </button>
                                </div>

                                {/* Progress Indicator */}
                                <div className="flex items-center gap-2">
                                    {STEPS.map((s, idx) => {
                                        const isActive = s.id === step;
                                        const isCompleted = s.id < step;
                                        return (
                                            <div key={s.id} className="flex flex-1 items-center gap-2">
                                                <div className={cn(
                                                    "h-1 flex-1 rounded-full transition-all duration-300",
                                                    isCompleted
                                                        ? isDark ? "bg-white" : "bg-[#5163FF]"
                                                        : isActive
                                                            ? isDark ? "bg-white/40" : "bg-[#5163FF]/40"
                                                            : isDark ? "bg-white/10" : "bg-[#D7DEF8]"
                                                )} />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Step Content */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={step}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-5"
                                    >
                                        {step === 1 && (
                                            <div className="space-y-5">
                                                <div className="space-y-2 text-center">
                                                    <h3 className={cn("text-xl font-semibold", strongText)}>Basic Information</h3>
                                                    <p className={cn("text-sm", subduedText)}>Tell us about your assistant</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="botName" className={cn("text-xs font-medium uppercase tracking-[0.2em]", subduedText)}>
                                                        Assistant Name
                                                    </label>
                                                    <input
                                                        id="botName"
                                                        type="text"
                                                        value={formData.botName}
                                                        onChange={(e) => setFormData({ ...formData, botName: e.target.value })}
                                                        placeholder="Enter assistant name"
                                                        className={cn("pl-4", inputClass)}
                                                    />
                                                    {errors.botName && (
                                                        <p className="flex items-center gap-1.5 text-xs text-red-400">
                                                            <AlertCircle className="h-3 w-3" />
                                                            {errors.botName}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="description" className={cn("text-xs font-medium uppercase tracking-[0.2em]", subduedText)}>
                                                        Description
                                                    </label>
                                                    <textarea
                                                        id="description"
                                                        value={formData.description}
                                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                        placeholder="What does this assistant do?"
                                                        rows={3}
                                                        className={cn("pl-4 resize-none", inputClass)}
                                                    />
                                                    {errors.description && (
                                                        <p className="flex items-center gap-1.5 text-xs text-red-400">
                                                            <AlertCircle className="h-3 w-3" />
                                                            {errors.description}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className={cn("text-xs font-medium uppercase tracking-[0.2em]", subduedText)}>Type</label>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {[
                                                            { id: "bot", label: "Standard Bot", icon: Zap, desc: "Rule-based" },
                                                            { id: "agent", label: "AI Agent", icon: Sparkles, desc: "LLM-powered" }
                                                        ].map((type) => (
                                                            <button
                                                                key={type.id}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, type: type.id as "bot" | "agent" })}
                                                                className={cn(
                                                                    "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                                                                    formData.type === type.id
                                                                        ? isDark
                                                                            ? "border-white bg-white/10 ring-1 ring-white/20"
                                                                            : "border-[#5163FF] bg-[#5163FF]/5 ring-1 ring-[#5163FF]/20"
                                                                        : isDark
                                                                            ? "border-white/10 bg-white/5 hover:bg-white/10"
                                                                            : "border-[#D7DEF8] bg-white hover:bg-gray-50"
                                                                )}
                                                            >
                                                                <type.icon className={cn("h-6 w-6", formData.type === type.id ? strongText : subduedText)} />
                                                                <div className="text-center">
                                                                    <p className={cn("text-sm font-medium", strongText)}>{type.label}</p>
                                                                    <p className={cn("text-xs", subtleText)}>{type.desc}</p>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <label className={cn("text-xs font-medium uppercase tracking-[0.2em]", subduedText)}>Category</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {CATEGORIES.map((cat) => (
                                                            <button
                                                                key={cat.value}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                                                className={cn(
                                                                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all",
                                                                    formData.category === cat.value
                                                                        ? isDark
                                                                            ? "border-white bg-white/10"
                                                                            : "border-[#5163FF] bg-[#5163FF]/5"
                                                                        : isDark
                                                                            ? "border-white/10 bg-white/5 hover:bg-white/10"
                                                                            : "border-[#D7DEF8] bg-white hover:bg-gray-50"
                                                                )}
                                                            >
                                                                <span className="text-xl">{cat.icon}</span>
                                                                <span className={cn("text-[10px] font-medium text-center", formData.category === cat.value ? strongText : subduedText)}>
                                                                    {cat.label}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {step === 2 && (
                                            <div className="space-y-5">
                                                <div className="space-y-2 text-center">
                                                    <h3 className={cn("text-xl font-semibold", strongText)}>Select Channels</h3>
                                                    <p className={cn("text-sm", subduedText)}>Where should we deploy?</p>
                                                </div>

                                                {errors.channels && (
                                                    <p className="flex items-center justify-center gap-1.5 text-xs text-red-400">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {errors.channels}
                                                    </p>
                                                )}

                                                <div className="space-y-3">
                                                    {CHANNELS.map((channel) => {
                                                        const isSelected = formData.channels.includes(channel.id);
                                                        return (
                                                            <button
                                                                key={channel.id}
                                                                type="button"
                                                                onClick={() => toggleChannel(channel.id)}
                                                                className={cn(
                                                                    "flex w-full items-center justify-between rounded-xl border p-4 transition-all",
                                                                    isSelected
                                                                        ? isDark
                                                                            ? "border-white bg-white/10"
                                                                            : "border-[#5163FF] bg-[#5163FF]/5"
                                                                        : isDark
                                                                            ? "border-white/10 bg-white/5 hover:bg-white/10"
                                                                            : "border-[#D7DEF8] bg-white hover:bg-gray-50"
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br", channel.color)}>
                                                                        <channel.icon className="h-5 w-5 text-white" />
                                                                    </div>
                                                                    <span className={cn("font-medium", strongText)}>{channel.name}</span>
                                                                </div>
                                                                <div className={cn(
                                                                    "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                                                                    isSelected
                                                                        ? isDark
                                                                            ? "bg-white border-white text-black"
                                                                            : "bg-[#5163FF] border-[#5163FF] text-white"
                                                                        : isDark
                                                                            ? "border-white/30"
                                                                            : "border-[#D7DEF8]"
                                                                )}>
                                                                    {isSelected && <Check className="h-3 w-3" />}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {step === 3 && (
                                            <div className="space-y-5">
                                                <div className="space-y-2 text-center">
                                                    <h3 className={cn("text-xl font-semibold", strongText)}>Choose a Plan</h3>
                                                    <p className={cn("text-sm", subduedText)}>Select your pricing tier</p>
                                                </div>

                                                <div className="space-y-3">
                                                    {[
                                                        { id: "free", name: "Free", price: "$0", features: ["1K messages/mo", "Community support", "Basic analytics"] },
                                                        { id: "basic", name: "Basic", price: "$29", features: ["10K messages/mo", "Email support", "Advanced analytics"] },
                                                        { id: "pro", name: "Pro", price: "$99", features: ["Unlimited messages", "Priority support", "Custom integrations"] },
                                                    ].map((tier) => (
                                                        <button
                                                            key={tier.id}
                                                            type="button"
                                                            onClick={() => setFormData({ ...formData, pricingTier: tier.id as any })}
                                                            className={cn(
                                                                "flex w-full items-center justify-between rounded-xl border p-4 transition-all text-left",
                                                                formData.pricingTier === tier.id
                                                                    ? isDark
                                                                        ? "border-white bg-white/10 ring-1 ring-white/20"
                                                                        : "border-[#5163FF] bg-[#5163FF]/5 ring-1 ring-[#5163FF]/20"
                                                                    : isDark
                                                                        ? "border-white/10 bg-white/5 hover:bg-white/10"
                                                                        : "border-[#D7DEF8] bg-white hover:bg-gray-50"
                                                            )}
                                                        >
                                                            <div className="flex-1">
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className={cn("text-lg font-bold", strongText)}>{tier.name}</span>
                                                                    <span className={cn("text-2xl font-bold", isDark ? "text-white" : "text-[#5163FF]")}>{tier.price}</span>
                                                                    {tier.price !== "$0" && <span className={subduedText}>/mo</span>}
                                                                </div>
                                                                <ul className="mt-2 space-y-1">
                                                                    {tier.features.map((f, i) => (
                                                                        <li key={i} className={cn("flex items-center gap-2 text-xs", subduedText)}>
                                                                            <Check className="h-3 w-3" /> {f}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div className={cn(
                                                                "h-5 w-5 rounded-full border flex items-center justify-center",
                                                                formData.pricingTier === tier.id
                                                                    ? isDark ? "bg-white border-white" : "bg-[#5163FF] border-[#5163FF]"
                                                                    : isDark ? "border-white/30" : "border-[#D7DEF8]"
                                                            )}>
                                                                {formData.pricingTier === tier.id && (
                                                                    <div className={cn("h-2 w-2 rounded-full", isDark ? "bg-black" : "bg-white")} />
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {step === 4 && (
                                            <div className="space-y-5">
                                                <div className="space-y-2 text-center">
                                                    <h3 className={cn("text-xl font-semibold", strongText)}>Review & Deploy</h3>
                                                    <p className={cn("text-sm", subduedText)}>Check your configuration</p>
                                                </div>

                                                <div className={cn("rounded-xl border p-4 space-y-3", isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-[#D7DEF8]")}>
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="h-4 w-4 text-yellow-500" />
                                                        <span className={cn("font-semibold text-sm", strongText)}>Summary</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                                        <div>
                                                            <p className={subtleText}>Name</p>
                                                            <p className={strongText}>{formData.botName}</p>
                                                        </div>
                                                        <div>
                                                            <p className={subtleText}>Type</p>
                                                            <p className={cn(strongText, "capitalize")}>{formData.type}</p>
                                                        </div>
                                                        <div>
                                                            <p className={subtleText}>Category</p>
                                                            <p className={cn(strongText, "capitalize")}>{formData.category}</p>
                                                        </div>
                                                        <div>
                                                            <p className={subtleText}>Plan</p>
                                                            <p className={cn(strongText, "capitalize")}>{formData.pricingTier}</p>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className={cn(subtleText, "mb-2")}>Channels ({formData.channels.length})</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {formData.channels.map(c => {
                                                                const ch = CHANNELS.find(x => x.id === c);
                                                                return ch ? (
                                                                    <div key={c} className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1", isDark ? "border-white/10 bg-white/5" : "border-[#D7DEF8] bg-white")}>
                                                                        <ch.icon className={cn("h-3 w-3", subduedText)} />
                                                                        <span className={cn("text-xs", subduedText)}>{ch.name}</span>
                                                                    </div>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>

                                                <label className={cn("flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition", isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-[#D7DEF8] bg-white hover:bg-gray-50")}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.sendEmailConfirmation}
                                                        onChange={(e) => setFormData({ ...formData, sendEmailConfirmation: e.target.checked })}
                                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#5163FF] focus:ring-[#5163FF]"
                                                    />
                                                    <div className="text-sm">
                                                        <p className={strongText}>Email confirmation</p>
                                                        <p className={subtleText}>Receive deployment details via email</p>
                                                    </div>
                                                </label>

                                                <label className={cn("flex items-start gap-3 cursor-pointer rounded-xl border p-4 transition", errors.acceptedTerms ? "border-red-500/50 bg-red-500/5" : isDark ? "border-white/10 bg-white/5 hover:bg-white/10" : "border-[#D7DEF8] bg-white hover:bg-gray-50")}>
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.acceptedTerms}
                                                        onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                                                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#5163FF] focus:ring-[#5163FF]"
                                                    />
                                                    <div className="text-sm">
                                                        <p className={strongText}>Accept Terms of Service</p>
                                                        <p className={subtleText}>I agree to the deployment terms</p>
                                                        {errors.acceptedTerms && (
                                                            <p className="mt-1 text-xs text-red-400">{errors.acceptedTerms}</p>
                                                        )}
                                                    </div>
                                                </label>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation */}
                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <button
                                        onClick={step === 1 ? onClose : handleBack}
                                        className={secondaryButtonClass}
                                    >
                                        {step === 1 ? "Cancel" : (
                                            <div className="flex items-center gap-1">
                                                <ChevronLeft className="h-4 w-4" />
                                                Back
                                            </div>
                                        )}
                                    </button>

                                    <button
                                        onClick={step === STEPS.length ? handleSubmit : handleNext}
                                        className={submitButtonClass}
                                    >
                                        {step === STEPS.length ? (
                                            <>
                                                Deploy Now
                                                <Rocket className="h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                Continue
                                                <ChevronRight className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Deployment Confirmation Alert */}
            {deploymentResult && (
                <ProfessionalAlert
                    variant={deploymentResult.status === "approved" ? "success" : "warning"}
                    title={
                        deploymentResult.status === "approved"
                            ? "🎉 Bot Approved & Deployed!"
                            : "⏳ Bot Deployed - Pending Approval"
                    }
                    message={
                        deploymentResult.status === "approved" ? (
                            <div>
                                <p>Your bot <strong>{formData.botName}</strong> has been automatically approved and is now live!</p>
                                <p className="mt-2 text-sm opacity-75">
                                    ✓ Deployed to {formData.channels.length} channel{formData.channels.length > 1 ? 's' : ''}<br />
                                    ✓ Pricing tier: {formData.pricingTier}<br />
                                    ✓ Status: <span className="text-emerald-300">Approved</span>
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p>Your bot <strong>{formData.botName}</strong> has been submitted for review!</p>
                                <p className="mt-2 text-sm opacity-75">
                                    📋 Status: Pending approval from Bothive team<br />
                                    ⏱️ Estimated review time: 24-48 hours<br />
                                    📧 You'll receive an email once approved
                                </p>
                                <p className="mt-3 text-xs opacity-60">
                                    <strong>Pro tip:</strong> Verified developers with 1+ years experience get auto-approved! Build more to unlock this perk.
                                </p>
                            </div>
                        )
                    }
                    show={showAlert}
                    onClose={() => setShowAlert(false)}
                    autoClose={8000}
                />
            )}
        </>
    );
}
