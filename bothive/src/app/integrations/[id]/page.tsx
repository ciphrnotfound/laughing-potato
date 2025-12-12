"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    Code,
    Globe,
    Zap,
    Star,
    Copy,
    Check,
    Play,
    Settings,
    ExternalLink,
    Calendar,
    User,
    Box,
    Shield,
    Sparkles,
    Download,
    Loader2,
    CheckCircle,
} from "lucide-react";
import { IntegrationTestRunner } from "@/components/IntegrationTestRunner";

interface Integration {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon_url: string;
    banner_url?: string;
    category: string;
    auth_type: string;
    is_official: boolean;
    is_verified: boolean;
    install_count: number;
    status: string;
    hivelang_code: string;
    created_at?: string;
    capabilities: Array<{
        name: string;
        description?: string;
        params?: string[];
    }>;
    documentation_url?: string;
    developer_id?: string;
}

export default function IntegrationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { isDark } = useTheme();
    const [integration, setIntegration] = useState<Integration | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showTestRunner, setShowTestRunner] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchIntegration(params.id as string);
        }
    }, [params.id]);

    async function fetchIntegration(id: string) {
        try {
            setLoading(true);
            const res = await fetch(`/api/integrations/${id}`);
            if (!res.ok) {
                router.push("/integrations");
                return;
            }
            const data = await res.json();
            setIntegration(data.integration);
        } catch (error) {
            console.error("Error fetching integration:", error);
            router.push("/integrations");
        } finally {
            setLoading(false);
        }
    }

    const copyCode = () => {
        if (integration?.hivelang_code) {
            navigator.clipboard.writeText(integration.hivelang_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleInstall = async () => {
        if (!integration || installing || installed) return;

        setInstalling(true);
        try {
            const res = await fetch(`/api/integrations/${integration.id}/install`, {
                method: "POST",
            });

            if (res.ok) {
                setInstalled(true);
                // Update local install count
                setIntegration(prev => prev ? {
                    ...prev,
                    install_count: prev.install_count + 1
                } : null);
            }
        } catch (error) {
            console.error("Error installing integration:", error);
        } finally {
            setInstalling(false);
        }
    };

    const textPrimary = isDark ? "text-white" : "text-gray-900";
    const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
    const textTertiary = isDark ? "text-gray-500" : "text-gray-500";
    const bgCard = isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200";

    if (loading) {
        return (
            <div className={cn("min-h-screen", isDark ? "bg-[#0A0A0A]" : "bg-gray-50")}>
                <div className="max-w-4xl mx-auto px-6 py-20">
                    <div className="animate-pulse space-y-6">
                        <div className={cn("h-48 rounded-2xl", isDark ? "bg-white/5" : "bg-gray-100")} />
                        <div className={cn("h-64 rounded-2xl", isDark ? "bg-white/5" : "bg-gray-100")} />
                    </div>
                </div>
            </div>
        );
    }

    if (!integration) {
        return null;
    }

    const createdDate = integration.created_at
        ? new Date(integration.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Recently';

    return (
        <div className={cn("min-h-screen relative overflow-hidden", isDark ? "bg-[#0A0A0A]" : "bg-gray-50")}>
            {/* Background gradient */}
            {isDark && (
                <>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/30 via-purple-900/20 to-transparent pointer-events-none blur-3xl" />
                    <div className="absolute top-40 right-0 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/15 via-indigo-800/10 to-transparent pointer-events-none blur-2xl" />
                </>
            )}

            {/* Banner */}
            <div className="relative h-48 md:h-64 overflow-hidden">
                {integration.banner_url ? (
                    <img
                        src={integration.banner_url}
                        alt={`${integration.name} banner`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className={cn(
                        "w-full h-full",
                        "bg-gradient-to-br from-purple-600/40 via-indigo-600/30 to-blue-600/20"
                    )} />
                )}
                {/* Overlay gradient */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-t",
                    isDark ? "from-[#0A0A0A] via-transparent to-transparent" : "from-gray-50 via-transparent to-transparent"
                )} />

                {/* Back button on banner */}
                <Link
                    href="/integrations"
                    className={cn(
                        "absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md transition-all",
                        isDark
                            ? "bg-black/40 text-white/80 hover:bg-black/60"
                            : "bg-white/40 text-gray-800 hover:bg-white/60"
                    )}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
            </div>

            <div className="relative max-w-4xl mx-auto px-6 -mt-20">
                {/* Receipt-style Header Card */}
                <div className={cn(
                    "relative p-8 rounded-3xl border backdrop-blur-xl shadow-2xl",
                    isDark
                        ? "bg-[#0C1323]/90 border-white/10"
                        : "bg-white/95 border-gray-200"
                )}>
                    {/* Decorative top bar */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-b-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />

                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Icon */}
                        <div className={cn(
                            "relative w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden",
                            "bg-gradient-to-br from-purple-500/20 via-indigo-500/10 to-blue-500/20",
                            "border-2",
                            isDark ? "border-white/10" : "border-gray-100"
                        )}>
                            {integration.icon_url ? (
                                <img
                                    src={integration.icon_url}
                                    alt={integration.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Zap className={cn("w-10 h-10 text-purple-500")} />
                            )}
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className={cn("text-3xl font-bold", textPrimary)}>
                                    {integration.name}
                                </h1>
                                {integration.is_official && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
                                        <Star className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
                                        <span className="text-xs font-semibold text-purple-400">Official</span>
                                    </span>
                                )}
                                <span className={cn(
                                    "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                                    integration.status === "active"
                                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                )}>
                                    {integration.status}
                                </span>
                            </div>
                            <p className={cn("text-lg mb-4", textSecondary)}>{integration.description}</p>

                            {/* Stats row */}
                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Box className={cn("w-4 h-4", textTertiary)} />
                                    <span className={textSecondary}>
                                        <span className={cn("font-semibold", textPrimary)}>{integration.install_count}</span> installs
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className={cn("w-4 h-4", textTertiary)} />
                                    <span className={cn("capitalize", textSecondary)}>
                                        {integration.auth_type.replace("_", " ")} auth
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Globe className={cn("w-4 h-4", textTertiary)} />
                                    <span className={cn("capitalize", textSecondary)}>{integration.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className={cn("w-4 h-4", textTertiary)} />
                                    <span className={textSecondary}>{createdDate}</span>
                                </div>
                            </div>

                            {/* Install Button */}
                            <div className="mt-6 pt-6 border-t border-white/5">
                                <button
                                    onClick={handleInstall}
                                    disabled={installing || installed}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                                        installed
                                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                            : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02]",
                                        installing && "opacity-70 cursor-wait"
                                    )}
                                >
                                    {installing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Installing...
                                        </>
                                    ) : installed ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Installed
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" />
                                            Install Integration
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Receipt-style divider */}
                    <div className="my-8 border-t border-dashed opacity-20" style={{
                        borderImage: isDark
                            ? 'repeating-linear-gradient(90deg, white 0, white 8px, transparent 8px, transparent 16px) 1'
                            : 'repeating-linear-gradient(90deg, #666 0, #666 8px, transparent 8px, transparent 16px) 1'
                    }} />

                    {/* Integration ID (like a receipt number) */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={cn("text-xs uppercase tracking-wider mb-1", textTertiary)}>Integration ID</p>
                            <p className={cn("font-mono text-sm", textSecondary)}>{integration.id}</p>
                        </div>
                        <div className="text-right">
                            <p className={cn("text-xs uppercase tracking-wider mb-1", textTertiary)}>Slug</p>
                            <p className={cn("font-mono text-sm", textSecondary)}>{integration.slug}</p>
                        </div>
                    </div>
                </div>

                {/* Capabilities */}
                {integration.capabilities && integration.capabilities.length > 0 && (
                    <div className={cn("mt-8 p-6 rounded-2xl border", bgCard)}>
                        <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", textPrimary)}>
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            Capabilities
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {integration.capabilities.map((cap, idx) => (
                                <div key={idx} className={cn(
                                    "p-4 rounded-xl border transition-all hover:scale-[1.02]",
                                    isDark
                                        ? "bg-white/5 border-white/5 hover:border-purple-500/30"
                                        : "bg-gray-50 border-gray-100 hover:border-purple-500/30"
                                )}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Code className={cn("w-4 h-4 text-purple-500")} />
                                        <span className={cn("font-semibold", textPrimary)}>{cap.name}</span>
                                    </div>
                                    {cap.description && (
                                        <p className={cn("text-sm", textSecondary)}>{cap.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* HiveLang Code */}
                {integration.hivelang_code && (
                    <div className={cn("mt-8 p-6 rounded-2xl border", bgCard)}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={cn("text-lg font-semibold flex items-center gap-2", textPrimary)}>
                                <Code className="w-5 h-5 text-purple-500" />
                                HiveLang Code
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowTestRunner(!showTestRunner)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                        showTestRunner
                                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                            : cn(
                                                isDark ? "bg-white/5 text-white/70" : "bg-gray-100 text-gray-700",
                                                "hover:opacity-80"
                                            )
                                    )}
                                >
                                    <Play className="w-4 h-4" />
                                    Test
                                </button>
                                <button
                                    onClick={copyCode}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium",
                                        isDark ? "bg-white/5 text-white/70" : "bg-gray-100 text-gray-700",
                                        "hover:opacity-80 transition-opacity"
                                    )}
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <pre className={cn(
                            "p-4 rounded-xl overflow-x-auto text-sm font-mono",
                            isDark ? "bg-black/50" : "bg-gray-100"
                        )}>
                            <code className={textSecondary}>{integration.hivelang_code}</code>
                        </pre>

                        {/* Test Runner */}
                        {showTestRunner && (
                            <div className="mt-6 pt-6 border-t border-white/10">
                                <IntegrationTestRunner hiveLangCode={integration.hivelang_code} />
                            </div>
                        )}
                    </div>
                )}

                {/* Documentation Link */}
                {integration.documentation_url && (
                    <Link
                        href={integration.documentation_url}
                        target="_blank"
                        className={cn(
                            "mt-8 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all",
                            bgCard,
                            "hover:border-purple-500/50"
                        )}
                    >
                        <ExternalLink className={cn("w-4 h-4", textSecondary)} />
                        <span className={textSecondary}>View Documentation</span>
                    </Link>
                )}

                {/* Bottom spacer */}
                <div className="h-20" />
            </div>
        </div>
    );
}
