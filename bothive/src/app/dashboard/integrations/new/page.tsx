"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSession } from "@/lib/app-session-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { Database } from "@/lib/database.types";
import {
    Plug,
    Loader2,
    CheckCircle2,
    AlertCircle,
    HelpCircle,
    Lock,
    X,
    Plus,
    Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import { CredentialForm } from "@/components/integrations/CredentialForm";
import { getAuthFields } from "@/lib/integrations/auth-parser";
import { Eye } from "lucide-react";

export default function NewIntegrationPage() {
    const { profile } = useAppSession();
    const { theme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        description: "",
        category: "other",
        type: "custom",
        documentation_url: "",
        hivelang_code: `@integration my_custom_tool
@category productivity

# Custom authentication required for this tool
@auth type: "api_key", fields: [
  { name: "apiKey", label: "Tool API Key", type: "password", required: true }
]

# Define capability
@capability do_something(arg)
  return "You sent: " + arg
@end
`
    });

    const [secrets, setSecrets] = useState<{ key: string, value: string }[]>([
        { key: "CLIENT_ID", value: "" },
        { key: "CLIENT_SECRET", value: "" }
    ]);

    const [showPreview, setShowPreview] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        try {
            const supabase = createClientComponentClient<Database>();

            // Auto-generate slug if empty
            const finalSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

            const { data: newIntegration, error } = await supabase.from("integrations").insert({
                developer_id: profile.id,
                slug: finalSlug,
                name: formData.name,
                description: formData.description,
                category: formData.category,
                type: formData.type,
                hivelang_code: formData.hivelang_code,
                is_active: true,
                documentation_url: formData.documentation_url || null,
            }).select().single();

            if (error) throw error;

            // 2. Insert secrets if any
            if (secrets.some(s => s.key && s.value)) {
                const { error: secretsError } = await supabase.from("integration_secrets").insert(
                    secrets
                        .filter(s => s.key && s.value)
                        .map(s => ({
                            integration_id: newIntegration.id,
                            key: s.key,
                            value: s.value
                        }))
                );
                if (secretsError) throw secretsError;
            }

            if (error) throw error;

            setSuccess(true);

            // Redirect after a delay
            setTimeout(() => {
                router.push("/dashboard/integrations");
            }, 3000);

        } catch (error) {
            console.error("Error creating integration:", error);
            alert("Failed to submit integration. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <DashboardPageShell
                title="Integration Created"
                description="Your custom integration is ready."
            >
                <div className="flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto mt-10 rounded-2xl bg-gradient-to-br from-[#6C43FF]/10 to-[#8A63FF]/5 border border-[#6C43FF]/20">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">Integration Created!</h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
                        <span className="font-semibold text-[#6C43FF]">{formData.name}</span> is now active and ready to be used by your bots.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/integrations")}
                        className="px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-all"
                    >
                        Return to Integrations
                    </button>
                </div>
            </DashboardPageShell>
        );
    }

    return (
        <>
            <DashboardPageShell
                title="Create Custom Integration"
                description="Build a new Hivelang-powered integration."
            >
                <div className="max-w-4xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Integration Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., My Weather Tool"
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Unique Slug (ID)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="my_weather_tool"
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all font-mono text-sm"
                                />
                                <p className="text-xs text-neutral-500 mt-1">Used in Hivelang code to reference this tool (e.g., @integration slug)</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Description</label>
                                <textarea
                                    required
                                    rows={2}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What does this integration do?"
                                    className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                                />
                            </div>

                            {/* Hivelang Code Editor */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">
                                    Hivelang Code
                                    <span className="ml-2 text-xs text-[#6C43FF] bg-[#6C43FF]/10 px-2 py-0.5 rounded-full">Pro</span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        required
                                        rows={12}
                                        value={formData.hivelang_code}
                                        onChange={(e) => setFormData({ ...formData, hivelang_code: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-[#0a0a0f] text-white font-mono text-sm leading-relaxed focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                                        spellCheck={false}
                                    />
                                    <div className="absolute top-3 right-3 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(true)}
                                            className="text-xs text-[#6C43FF] bg-[#6C43FF]/10 px-3 py-1.5 rounded-lg hover:bg-[#6C43FF]/20 transition-all flex items-center gap-2"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Preview Auth Form
                                        </button>
                                        <span className="text-xs text-neutral-500 font-mono">Hivelang</span>
                                    </div>
                                </div>
                                <p className="text-xs text-neutral-500 mt-2">
                                    Define your integration capabilities using Hivelang. These will be instantly available to your bots.
                                </p>
                            </div>

                            {/* Platform Configuration (Secrets) */}
                            <div className="md:col-span-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                <label className="flex items-center gap-2 text-sm font-medium mb-4 text-neutral-700 dark:text-neutral-300">
                                    <Lock size={16} className="text-[#6C43FF]" />
                                    Platform Configuration (Private Secrets)
                                </label>
                                <div className="space-y-3">
                                    {secrets.map((secret, idx) => (
                                        <div key={idx} className="flex gap-3">
                                            <input
                                                type="text"
                                                placeholder="Key (e.g., CLIENT_ID)"
                                                value={secret.key}
                                                onChange={(e) => {
                                                    const newSecrets = [...secrets];
                                                    newSecrets[idx].key = e.target.value;
                                                    setSecrets(newSecrets);
                                                }}
                                                className="flex-1 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                                            />
                                            <input
                                                type="password"
                                                placeholder="Value"
                                                value={secret.value}
                                                onChange={(e) => {
                                                    const newSecrets = [...secrets];
                                                    newSecrets[idx].value = e.target.value;
                                                    setSecrets(newSecrets);
                                                }}
                                                className="flex-2 px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSecrets(secrets.filter((_, i) => i !== idx))}
                                                className="px-3 py-2 text-neutral-400 hover:text-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => setSecrets([...secrets, { key: "", value: "" }])}
                                        className="text-xs text-[#6C43FF] hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={14} />
                                        Add Secret
                                    </button>
                                </div>
                                <p className="text-[10px] text-neutral-500 mt-3 flex items-start gap-1">
                                    <Info size={12} className="mt-0.5" />
                                    These credentials (e.g., Client ID/Secret) are used by the platform to authenticate with the provider.
                                    They are NEVER shown to end users.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-[#6C43FF] hover:bg-[#5a36db] text-white rounded-xl font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plug className="w-5 h-5" />
                                        Create Integration
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </DashboardPageShell>

            {/* Auth Form Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <CredentialForm
                        integration={{
                            id: "preview",
                            name: formData.name || "My Integration",
                            description: formData.description || "Previewing the authentication form...",
                        }}
                        isDark={theme === 'dark'}
                        onClose={() => setShowPreview(false)}
                        onSubmit={async () => {
                            alert("Preview submission: Credentials collected correctly.");
                            setShowPreview(false);
                        }}
                        fields={getAuthFields(formData.hivelang_code)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
