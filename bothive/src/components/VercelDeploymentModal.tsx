"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    ChevronRight,
    Sparkles,
    Check,
    AlertCircle,
    Globe,
    Smartphone,
    MessageCircle,
    Mail,
    Zap,
    Bot,
    Rocket,
    CreditCard,
    Settings,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

interface DeploymentData {
    name: string;
    description: string;
    subdomain: string;
    customDomain?: string;
    environment: "development" | "staging" | "production";
    aiModel: "llama-3.3-70b" | "mixtral-8x7b" | "gemma-7b" | "custom";
    tools: string[];
    memory: "ephemeral" | "persistent" | "hybrid";
    visibility: "public" | "private" | "unlisted";
    analytics: boolean;
    monitoring: boolean;
    autoScale: boolean;
}

interface VercelDeploymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDeploy: (data: DeploymentData) => Promise<void>;
    initialData?: Partial<DeploymentData>;
    botCode?: string;
    isLoading?: boolean;
}

const STEPS = [
    { id: 1, title: "Configure", icon: Settings },
    { id: 2, title: "AI Setup", icon: Bot },
    { id: 3, title: "Deploy", icon: Rocket },
];

const AI_MODELS = [
    { id: "llama-3.3-70b", name: "Llama 3.3 70B", provider: "Groq", speed: "Fastest", quality: "Excellent", color: "from-purple-500 to-pink-500" },
    { id: "mixtral-8x7b", name: "Mixtral 8x7B", provider: "Groq", speed: "Fast", quality: "Great", color: "from-blue-500 to-cyan-500" },
    { id: "gemma-7b", name: "Gemma 7B", provider: "Groq", speed: "Very Fast", quality: "Good", color: "from-green-500 to-emerald-500" },
    { id: "custom", name: "Custom Model", provider: "API", speed: "Variable", quality: "Custom", color: "from-gray-500 to-slate-500" },
];

const TOOLS_CATALOG = [
    { id: "web-search", name: "Web Search", icon: Globe, description: "Real-time web search capabilities" },
    { id: "code-execution", name: "Code Execution", icon: Zap, description: "Run and test code snippets" },
    { id: "image-analysis", name: "Image Analysis", icon: Eye, description: "Analyze and describe images" },
    { id: "memory-store", name: "Memory Store", icon: CreditCard, description: "Persistent conversation memory" },
    { id: "analytics", name: "Analytics", icon: Sparkles, description: "Usage analytics and insights" },
    { id: "monitoring", name: "Monitoring", icon: AlertCircle, description: "Performance monitoring and alerts" },
];

export default function VercelDeploymentModal({
    isOpen,
    onClose,
    onDeploy,
    initialData,
    botCode,
    isLoading = false,
}: VercelDeploymentModalProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<DeploymentData>({
        name: initialData?.name || "",
        description: initialData?.description || "",
        subdomain: initialData?.subdomain || "",
        customDomain: initialData?.customDomain || "",
        environment: initialData?.environment || "production",
        aiModel: initialData?.aiModel || "llama-3.3-70b",
        tools: initialData?.tools || ["web-search", "analytics"],
        memory: initialData?.memory || "ephemeral",
        visibility: initialData?.visibility || "public",
        analytics: initialData?.analytics ?? true,
        monitoring: initialData?.monitoring ?? true,
        autoScale: initialData?.autoScale ?? true,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof DeploymentData, string>>>({});
    const [isDeploying, setIsDeploying] = useState(false);
    const [deployProgress, setDeployProgress] = useState(0);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const validateStep = (currentStep: number) => {
        const newErrors: Partial<Record<keyof DeploymentData, string>> = {};
        let isValid = true;

        if (currentStep === 1) {
            if (!formData.name.trim()) {
                newErrors.name = "Bot name is required";
                isValid = false;
            }
            if (!formData.description.trim()) {
                newErrors.description = "Description is required";
                isValid = false;
            }
            if (!formData.subdomain.trim()) {
                newErrors.subdomain = "Subdomain is required";
                isValid = false;
            } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
                newErrors.subdomain = "Subdomain can only contain lowercase letters, numbers, and hyphens";
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

    const handleDeploy = async () => {
        if (validateStep(step)) {
            setIsDeploying(true);
            
            // Simulate deployment progress
            const progressInterval = setInterval(() => {
                setDeployProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(progressInterval);
                        return 100;
                    }
                    return prev + 10;
                });
            }, 300);

            try {
                await onDeploy(formData);
                setTimeout(() => {
                    onClose();
                }, 2000);
            } catch (error) {
                console.error("Deployment failed:", error);
            } finally {
                setIsDeploying(false);
                clearInterval(progressInterval);
            }
        }
    };

    const toggleTool = (toolId: string) => {
        setFormData(prev => ({
            ...prev,
            tools: prev.tools.includes(toolId)
                ? prev.tools.filter(t => t !== toolId)
                : [...prev.tools, toolId]
        }));
    };

    const inputClass = cn(
        "w-full rounded-xl border bg-white/5 px-4 py-3 text-sm transition-all duration-200",
        "placeholder:text-white/40 focus:outline-none focus:ring-2",
        isDark 
            ? "border-white/10 text-white focus:border-white/20 focus:ring-white/10"
            : "border-black/10 text-black focus:border-black/20 focus:ring-black/10"
    );

    const cardClass = cn(
        "rounded-2xl border bg-white/5 p-6 backdrop-blur-sm transition-all duration-200",
        "hover:bg-white/10 hover:border-white/20",
        isDark ? "border-white/10" : "border-black/10"
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className={cn(
                            "relative w-full max-w-4xl rounded-3xl border bg-gray-900/90 p-8 backdrop-blur-xl",
                            "shadow-2xl shadow-purple-500/10"
                        )}
                    >
                        {/* Header */}
                        <div className="mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500">
                                    <Rocket className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Deploy Bot</h2>
                                    <p className="text-sm text-white/60">Configure and deploy your AI assistant</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X className="h-5 w-5 text-white/60" />
                            </button>
                        </div>

                        {/* Progress */}
                        <div className="mb-8 flex items-center gap-2">
                            {STEPS.map((s, idx) => {
                                const isActive = s.id === step;
                                const isCompleted = s.id < step;
                                return (
                                    <div key={s.id} className="flex items-center gap-2">
                                        <div className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                                            isCompleted ? "bg-green-500 text-white" : 
                                            isActive ? "bg-purple-500 text-white" : 
                                            "bg-white/10 text-white/40"
                                        )}>
                                            {isCompleted ? <Check className="h-4 w-4" /> : s.id}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium transition-colors",
                                            isActive ? "text-white" : "text-white/40"
                                        )}>
                                            {s.title}
                                        </span>
                                        {idx < STEPS.length - 1 && (
                                            <ArrowRight className="h-4 w-4 text-white/20" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Content */}
                        <div className="mb-8 min-h-[400px]">
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/80">Bot Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="My AI Assistant"
                                            className={inputClass}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/80">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="What does your bot do?"
                                            rows={3}
                                            className={inputClass}
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-white/80">Subdomain</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={formData.subdomain}
                                                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                                    placeholder="my-bot"
                                                    className={cn(inputClass, "pr-16")}
                                                />
                                                <span className="absolute right-3 top-3 text-sm text-white/40">.bothive.app</span>
                                            </div>
                                            {errors.subdomain && <p className="mt-1 text-sm text-red-400">{errors.subdomain}</p>}
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-white/80">Environment</label>
                                            <select
                                                value={formData.environment}
                                                onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                                                className={inputClass}
                                            >
                                                <option value="development">Development</option>
                                                <option value="staging">Staging</option>
                                                <option value="production">Production</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
                                    >
                                        <Settings className="h-4 w-4" />
                                        Advanced Settings
                                        {showAdvanced ? <ChevronRight className="h-4 w-4 rotate-90" /> : <ChevronRight className="h-4 w-4" />}
                                    </button>

                                    {showAdvanced && (
                                        <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-white/80">Visibility</label>
                                                    <select
                                                        value={formData.visibility}
                                                        onChange={(e) => setFormData({ ...formData, visibility: e.target.value as any })}
                                                        className={inputClass}
                                                    >
                                                        <option value="public">Public</option>
                                                        <option value="private">Private</option>
                                                        <option value="unlisted">Unlisted</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-white/80">Memory</label>
                                                    <select
                                                        value={formData.memory}
                                                        onChange={(e) => setFormData({ ...formData, memory: e.target.value as any })}
                                                        className={inputClass}
                                                    >
                                                        <option value="ephemeral">Ephemeral</option>
                                                        <option value="persistent">Persistent</option>
                                                        <option value="hybrid">Hybrid</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="mb-2 block text-sm font-medium text-white/80">Custom Domain</label>
                                                    <input
                                                        type="text"
                                                        value={formData.customDomain}
                                                        onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
                                                        placeholder="optional"
                                                        className={inputClass}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.analytics}
                                                        onChange={(e) => setFormData({ ...formData, analytics: e.target.checked })}
                                                        className="rounded border-white/20 bg-white/5"
                                                    />
                                                    <span className="text-sm text-white/80">Analytics</span>
                                                </label>

                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.monitoring}
                                                        onChange={(e) => setFormData({ ...formData, monitoring: e.target.checked })}
                                                        className="rounded border-white/20 bg-white/5"
                                                    />
                                                    <span className="text-sm text-white/80">Monitoring</span>
                                                </label>

                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.autoScale}
                                                        onChange={(e) => setFormData({ ...formData, autoScale: e.target.checked })}
                                                        className="rounded border-white/20 bg-white/5"
                                                    />
                                                    <span className="text-sm text-white/80">Auto-scale</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="mb-4 text-lg font-semibold text-white">AI Model Selection</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {AI_MODELS.map((model) => (
                                                <div
                                                    key={model.id}
                                                    onClick={() => setFormData({ ...formData, aiModel: model.id as any })}
                                                    className={cn(
                                                        cardClass,
                                                        formData.aiModel === model.id && "border-purple-500 bg-purple-500/10"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                                                        model.color
                                                    )}>
                                                        <Bot className="h-5 w-5 text-white" />
                                                    </div>
                                                    <h4 className="font-semibold text-white">{model.name}</h4>
                                                    <p className="text-sm text-white/60">{model.provider}</p>
                                                    <div className="mt-2 flex gap-2">
                                                        <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/60">
                                                            {model.speed}
                                                        </span>
                                                        <span className="rounded bg-white/10 px-2 py-1 text-xs text-white/60">
                                                            {model.quality}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="mb-4 text-lg font-semibold text-white">Available Tools</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {TOOLS_CATALOG.map((tool) => (
                                                <label
                                                    key={tool.id}
                                                    className={cn(
                                                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors",
                                                        formData.tools.includes(tool.id)
                                                            ? "border-purple-500 bg-purple-500/10"
                                                            : "border-white/10 bg-white/5 hover:bg-white/10"
                                                    )}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.tools.includes(tool.id)}
                                                        onChange={() => toggleTool(tool.id)}
                                                        className="rounded border-white/20 bg-white/5"
                                                    />
                                                    <tool.icon className="h-4 w-4 text-white/60" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white">{tool.name}</p>
                                                        <p className="text-xs text-white/40">{tool.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="text-center">
                                        <h3 className="mb-2 text-xl font-bold text-white">Ready to Deploy</h3>
                                        <p className="text-white/60">Your bot will be live in seconds</p>
                                    </div>

                                    {isDeploying && (
                                        <div className="space-y-4">
                                            <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                                                <motion.div
                                                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${deployProgress}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                            <p className="text-center text-sm text-white/60">
                                                {deployProgress < 30 && "Initializing deployment..."}
                                                {deployProgress >= 30 && deployProgress < 60 && "Building your bot..."}
                                                {deployProgress >= 60 && deployProgress < 90 && "Configuring AI models..."}
                                                {deployProgress >= 90 && "Finalizing deployment..."}
                                            </p>
                                        </div>
                                    )}

                                    <div className={cn(cardClass, "border-purple-500/20 bg-purple-500/5")}>
                                        <h4 className="mb-4 font-semibold text-white">Deployment Summary</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Name</span>
                                                <span className="text-white">{formData.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">URL</span>
                                                <span className="text-white">{formData.subdomain}.bothive.app</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">AI Model</span>
                                                <span className="text-white">
                                                    {AI_MODELS.find(m => m.id === formData.aiModel)?.name}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Tools</span>
                                                <span className="text-white">{formData.tools.length} enabled</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-white/60">Environment</span>
                                                <span className="text-white capitalize">{formData.environment}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-200">Deployment Notes</p>
                                                <p className="text-sm text-yellow-300/80">
                                                    Your bot will be deployed with automatic scaling and monitoring. 
                                                    You can update settings after deployment.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className={cn(
                                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                                    step === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10"
                                )}
                            >
                                <ChevronRight className="h-4 w-4 rotate-180" />
                                Back
                            </button>

                            <div className="flex items-center gap-3">
                                {step < STEPS.length ? (
                                    <button
                                        onClick={handleNext}
                                        className={cn(
                                            "flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600"
                                        )}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleDeploy}
                                        disabled={isDeploying}
                                        className={cn(
                                            "flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2 text-sm font-medium text-white transition-all hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
                                        )}
                                    >
                                        {isDeploying ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Deploying...
                                            </>
                                        ) : (
                                            <>
                                                Deploy Bot
                                                <Rocket className="h-4 w-4" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}