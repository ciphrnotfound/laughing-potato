"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/lib/app-session-context";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { Database } from "@/lib/database.types";
import {
    Plug,
    Loader2,
    CheckCircle2,
    AlertCircle,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";

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

# Define capability
@capability do_something(arg)
  return "You sent: " + arg
`
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        try {
            const supabase = createClientComponentClient<Database>();

            // Auto-generate slug if empty
            const finalSlug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

            const { error } = await supabase.from("integrations").insert({
                // user_id: profile.id, // Removed as per schema (integrations might be global, or we need to add owner_id if not present)
                slug: finalSlug,
                name: formData.name,
                description: formData.description,
                category: formData.category,
                type: formData.type,
                hivelang_code: formData.hivelang_code,
                is_active: true, // Auto-activate custom integrations
                documentation_url: formData.documentation_url || null,
            });

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
                                <div className="absolute top-3 right-3 text-xs text-neutral-500 pointer-events-none">
                                    Hivelang
                                </div>
                            </div>
                            <p className="text-xs text-neutral-500 mt-2">
                                Define your integration capabilities using Hivelang. These will be instantly available to your bots.
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
    );
}
