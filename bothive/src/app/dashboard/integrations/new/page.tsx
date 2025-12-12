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
        description: "",
        category: "other",
        type: "custom",
        documentation_url: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setLoading(true);
        try {
            const supabase = createClientComponentClient<Database>();

            const { error } = await supabase.from("integrations").insert({
                user_id: profile.id,
                name: formData.name,
                description: formData.description,
                category: formData.category,
                type: formData.type,
                status: "pending", // Explicitly set to pending
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
                title="Submit Integration"
                description="Add a new integration to your workspace."
            >
                <div className="flex flex-col items-center justify-center p-12 text-center max-w-2xl mx-auto mt-10 rounded-2xl bg-gradient-to-br from-[#6C43FF]/10 to-[#8A63FF]/5 border border-[#6C43FF]/20">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">Submission Successful!</h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
                        Your integration <span className="font-semibold text-[#6C43FF]">{formData.name}</span> has been submitted and is currently <span className="font-bold text-yellow-500">PENDING APPROVAL</span>.
                    </p>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-start text-left mb-8">
                        <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            An administrator will review your submission shortly. Once approved, it will appear in your connected integrations list. You will be notified of any status changes.
                        </p>
                    </div>
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
            title="Submit New Integration"
            description="Register a new custom integration or API connection."
        >
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Integration Name</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Slack Bot, Custom CRM"
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Description</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="What does this integration do?"
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                            >
                                <option value="communication">Communication</option>
                                <option value="productivity">Productivity</option>
                                <option value="development">Development</option>
                                <option value="analytics">Analytics</option>
                                <option value="payment">Payment</option>
                                <option value="storage">Storage</option>
                                <option value="ai">AI / ML</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                            >
                                <option value="custom">Custom Implementation</option>
                                <option value="webhook">Webhook</option>
                                <option value="api_key">API Key</option>
                                <option value="oauth">OAuth App</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300">Documentation URL (Optional)</label>
                            <input
                                type="url"
                                value={formData.documentation_url}
                                onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                                placeholder="https://"
                                className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:ring-2 focus:ring-[#6C43FF] outline-none transition-all"
                            />
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
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Plug className="w-5 h-5" />
                                    Submit Integration
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardPageShell>
    );
}
