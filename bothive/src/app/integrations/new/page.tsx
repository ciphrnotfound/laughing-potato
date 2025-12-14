"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Code,
    Wand2,
    Eye,
    Play,
    Check,
    AlertCircle,
    TestTube,
    CheckCircle,
    Sparkles,
    Upload,
    Image as ImageIcon,
} from "lucide-react";
import { VisualIntegrationBuilder } from "@/components/VisualIntegrationBuilder";
import { IntegrationTestRunner } from "@/components/IntegrationTestRunner";
import { INTEGRATION_EXAMPLES } from "@/lib/hivelang/examples";

type CreationMode = "visual" | "code";

export default function NewIntegrationPage() {
    const router = useRouter();
    const { isDark } = useTheme();
    const [mode, setMode] = useState<CreationMode>("visual");
    const [hiveLangCode, setHiveLangCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [deploySuccess, setDeploySuccess] = useState<{ id: string; name: string } | null>(null);

    // Image uploads
    const [iconUrl, setIconUrl] = useState("");
    const [bannerUrl, setBannerUrl] = useState("");

    const textPrimary = isDark ? "text-white" : "text-gray-900";
    const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
    const bgInput = isDark
        ? "bg-white/5 border-white/10 text-white placeholder:text-gray-500"
        : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400";

    const handleCodeGenerated = (code: string) => {
        setHiveLangCode(code);
        setMode("code"); // Switch to code view to show generated code
        setShowPreview(true);
    };

    const handleLoadExample = (exampleKey: keyof typeof INTEGRATION_EXAMPLES) => {
        setHiveLangCode(INTEGRATION_EXAMPLES[exampleKey]);
        setShowPreview(true);
    };

    const handleSubmit = async () => {
        if (!hiveLangCode.trim()) {
            alert("Please generate or write integration code first");
            return;
        }

        setLoading(true);

        try {
            // Parse integration metadata from code
            const nameMatch = hiveLangCode.match(/@integration\s+(\w+)/);
            const descMatch = hiveLangCode.match(/@description\s+"([^"]+)"/);
            const categoryMatch = hiveLangCode.match(/@category\s+(\w+)/);
            const authMatch = hiveLangCode.match(/@auth\s+(\w+)/);

            if (!nameMatch) {
                throw new Error("Invalid HiveLang code: Missing @integration");
            }

            const slug = nameMatch[1];
            const name = slug.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            // Extract capabilities
            const capabilities: any[] = [];
            const capabilityRegex = /@capability\s+(\w+)/g;
            let capMatch;
            while ((capMatch = capabilityRegex.exec(hiveLangCode)) !== null) {
                capabilities.push({
                    name: capMatch[1],
                    params: [],
                    returns: "object"
                });
            }

            const response = await fetch("/api/integrations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    slug,
                    description: descMatch?.[1] || `${name} integration`,
                    category: categoryMatch?.[1] || "other",
                    auth_type: authMatch?.[1] || "api_key",
                    hivelang_code: hiveLangCode,
                    capabilities,
                    icon_url: iconUrl || null,
                    banner_url: bannerUrl || null,
                    status: "beta",
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setDeploySuccess({ id: data.integration.id, name: name });
                // Delay redirect to show success message
                setTimeout(() => {
                    router.push(`/integrations/${data.integration.id}`);
                }, 2000);
            } else {
                const error = await response.json();
                alert("Error: " + error.error);
            }
        } catch (error: any) {
            console.error("Error creating integration:", error);
            alert(error.message || "Failed to create integration");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("min-h-screen relative overflow-hidden", isDark ? "bg-[#0A0A0A]" : "bg-gray-50")}>
            {/* Enhanced Purple Gradient */}
            {isDark && (
                <>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/30 via-purple-900/20 to-transparent pointer-events-none blur-3xl" />
                    <div className="absolute top-40 right-0 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-purple-800/10 to-transparent pointer-events-none blur-2xl" />
                    <div className="absolute top-60 left-0 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-700/15 to-transparent pointer-events-none blur-2xl" />
                </>
            )}

            {/* Success Toast */}
            {deploySuccess && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300">
                    <div className={cn(
                        "flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl backdrop-blur-xl",
                        "bg-gradient-to-r from-green-500/20 to-emerald-500/10",
                        "border-green-500/30"
                    )}>
                        <div className="p-2 rounded-full bg-green-500/20">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="font-semibold text-white">Integration Deployed! 🎉</p>
                            <p className="text-sm text-green-300/80">
                                {deploySuccess.name} is now live. Redirecting...
                            </p>
                        </div>
                        <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
                    </div>
                </div>
            )}

            <div className="relative max-w-6xl mx-auto px-6 py-20">
                {/* Header */}
                <div className="mb-12">
                    <Link
                        href="/integrations"
                        className={cn(
                            "inline-flex items-center gap-2 mb-6 text-sm",
                            textSecondary,
                            "hover:opacity-70 transition-opacity"
                        )}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Integrations
                    </Link>

                    <h1 className={cn("text-4xl font-bold mb-2 tracking-tight", textPrimary)}>
                        Create Integration
                    </h1>
                    <p className={cn("text-lg", textSecondary)}>
                        Build once, use everywhere. Choose your preferred creation mode below.
                    </p>
                </div>

                {/* Mode Selector */}
                <div className="mb-8">
                    <div className="grid grid-cols-2 gap-4 max-w-2xl">
                        <button
                            onClick={() => setMode("visual")}
                            className={cn(
                                "p-6 rounded-2xl border transition-all text-left",
                                mode === "visual"
                                    ? isDark
                                        ? "bg-white/10 border-white/20"
                                        : "bg-black/5 border-black"
                                    : cn(
                                        isDark
                                            ? "bg-white/5 border-white/10"
                                            : "bg-white border-gray-200",
                                        isDark ? "hover:bg-white/10" : "hover:bg-gray-50"
                                    )
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <Wand2 className={cn("w-6 h-6", mode === "visual" ? "text-purple-500" : textSecondary)} />
                                {mode === "visual" && <Check className="w-5 h-5 text-purple-500" />}
                            </div>
                            <h3 className={cn("text-lg font-semibold mb-2", textPrimary)}>
                                Visual Builder
                            </h3>
                            <p className={cn("text-sm", textSecondary)}>
                                No code needed. Create integrations with forms and dropdowns. Perfect for non-developers.
                            </p>
                        </button>

                        <button
                            onClick={() => setMode("code")}
                            className={cn(
                                "p-6 rounded-2xl border transition-all text-left",
                                mode === "code"
                                    ? isDark
                                        ? "bg-white/10 border-white/20"
                                        : "bg-black/5 border-black"
                                    : cn(
                                        isDark
                                            ? "bg-white/5 border-white/10"
                                            : "bg-white border-gray-200",
                                        isDark ? "hover:bg-white/10" : "hover:bg-gray-50"
                                    )
                            )}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <Code className={cn("w-6 h-6", mode === "code" ? "text-purple-500" : textSecondary)} />
                                {mode === "code" && <Check className="w-5 h-5 text-purple-500" />}
                            </div>
                            <h3 className={cn("text-lg font-semibold mb-2", textPrimary)}>
                                Code Editor
                            </h3>
                            <p className={cn("text-sm", textSecondary)}>
                                Write HiveLang directly for full control. Advanced features and custom logic.
                            </p>
                        </button>
                    </div>
                </div>

                {/* Image Upload Section */}
                <div className={cn("p-6 rounded-2xl border mb-8", isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}>
                    <h3 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", textPrimary)}>
                        <ImageIcon className="w-5 h-5 text-purple-500" />
                        Integration Branding
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Icon Upload */}
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                Icon URL (Square, 256x256 recommended)
                            </label>
                            <div className="flex gap-3">
                                <div className={cn(
                                    "w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden",
                                    isDark ? "border-white/20 bg-white/5" : "border-gray-300 bg-gray-50"
                                )}>
                                    {iconUrl ? (
                                        <img src={iconUrl} alt="Icon" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload className={cn("w-6 h-6", textSecondary)} />
                                    )}
                                </div>
                                <input
                                    type="url"
                                    value={iconUrl}
                                    onChange={(e) => setIconUrl(e.target.value)}
                                    placeholder="https://example.com/icon.png"
                                    className={cn(
                                        "flex-1 px-4 py-3 rounded-xl border transition-colors",
                                        bgInput,
                                        "focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Banner Upload */}
                        <div>
                            <label className={cn("block text-sm font-medium mb-2", textSecondary)}>
                                Banner URL (Wide, 1200x400 recommended)
                            </label>
                            <div className="flex gap-3">
                                <div className={cn(
                                    "w-24 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden",
                                    isDark ? "border-white/20 bg-white/5" : "border-gray-300 bg-gray-50"
                                )}>
                                    {bannerUrl ? (
                                        <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className={cn("w-6 h-6", textSecondary)} />
                                    )}
                                </div>
                                <input
                                    type="url"
                                    value={bannerUrl}
                                    onChange={(e) => setBannerUrl(e.target.value)}
                                    placeholder="https://example.com/banner.png"
                                    className={cn(
                                        "flex-1 px-4 py-3 rounded-xl border transition-colors",
                                        bgInput,
                                        "focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Editor Area */}
                    <div className="lg:col-span-2">
                        {mode === "visual" ? (
                            <VisualIntegrationBuilder onCodeGenerated={handleCodeGenerated} />
                        ) : (
                            <div className={cn("p-6 rounded-2xl border", isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={cn("text-lg font-semibold", textPrimary)}>
                                        HiveLang Code Editor
                                    </h3>
                                    <button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                            textSecondary,
                                            "hover:opacity-70 transition-opacity"
                                        )}
                                    >
                                        <Eye className="w-4 h-4" />
                                        {showPreview ? "Hide" : "Show"} Preview
                                    </button>
                                </div>

                                <textarea
                                    value={hiveLangCode}
                                    onChange={(e) => setHiveLangCode(e.target.value)}
                                    placeholder={`@integration my_integration
@auth api_key
@category other
@description "My custom integration"

@capability my_capability
@params param1, param2
@returns object

function my_capability(param1, param2):
    response = http.get(f"https://api.example.com/endpoint?p1={param1}", {
        headers: {
            "Authorization": f"Bearer {user.credentials.api_key}"
        }
    })
    
    if response.status >= 400:
        throw Error("API error")
    
    return response.json()`}
                                    rows={20}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-xl border font-mono text-sm resize-none",
                                        bgInput,
                                        "focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                    )}
                                />

                                <div className="mt-4 flex gap-3">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading || !hiveLangCode.trim()}
                                        className={cn(
                                            "flex-1 px-6 py-3 rounded-xl font-medium transition-all",
                                            "bg-purple-600 text-white hover:bg-purple-700",
                                            "disabled:opacity-50 disabled:cursor-not-allowed"
                                        )}
                                    >
                                        {loading ? "Deploying..." : "Deploy Integration"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Examples & Help */}
                    <div className="space-y-6">
                        {/* Examples */}
                        <div className={cn("p-6 rounded-2xl border", isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}>
                            <h3 className={cn("text-lg font-semibold mb-4", textPrimary)}>
                                Examples
                            </h3>
                            <div className="space-y-2">
                                {Object.entries({
                                    vercel: "Vercel Deploy",
                                    stripe: "Stripe Payments",
                                    sendgrid: "SendGrid Email",
                                    github: "GitHub API",
                                    youtube: "📺 YouTube Search",
                                    gmail: "📧 Gmail",
                                    google: "🔍 Google Search",
                                    calendar: "📅 Calendar",
                                }).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleLoadExample(key as any)}
                                        className={cn(
                                            "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm",
                                            isDark
                                                ? "bg-white/5 border-white/10 hover:bg-white/10"
                                                : "bg-gray-50 border-gray-200 hover:bg-gray-100",
                                            textPrimary
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className={cn("p-6 rounded-2xl border", isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}>
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className={cn("w-5 h-5", textSecondary)} />
                                <h3 className={cn("text-sm font-semibold", textPrimary)}>
                                    Quick Tips
                                </h3>
                            </div>
                            <ul className={cn("text-xs space-y-2", textSecondary)}>
                                <li>• All HTTP requests use HTTPS for security</li>
                                <li>• Access user credentials via <code className="text-purple-500">user.credentials</code></li>
                                <li>• Errors auto-handled with <code className="text-purple-500">throw Error()</code></li>
                                <li>• Response parsing with <code className="text-purple-500">response.json()</code></li>
                            </ul>
                        </div>

                        {/* Test Runner */}
                        {mode === "code" && hiveLangCode && (
                            <div className={cn("p-6 rounded-2xl border", isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}>
                                <div className="flex items-center gap-2 mb-4">
                                    <TestTube className={cn("w-5 h-5", textSecondary)} />
                                    <h3 className={cn("text-sm font-semibold", textPrimary)}>
                                        Test Integration
                                    </h3>
                                </div>
                                <IntegrationTestRunner hiveLangCode={hiveLangCode} />
                            </div>
                        )}

                        {/* Live Preview */}
                        {showPreview && hiveLangCode && (
                            <div className={cn("p-6 rounded-2xl border", isDark ? "bg-white/5 border-white/10" : "bg-white border-gray-200")}>
                                <h3 className={cn("text-sm font-semibold mb-3", textPrimary)}>
                                    Live Preview
                                </h3>
                                <pre className={cn(
                                    "text-xs p-4 rounded-lg overflow-x-auto",
                                    isDark ? "bg-black/50" : "bg-gray-100",
                                    textSecondary
                                )}>
                                    {hiveLangCode}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
