"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useGlassAlert } from "@/components/ui/glass-alert";
import { Users, Check, X, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

import { use } from "react";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function JoinWorkspacePage({ params }: PageProps) {
    const resolvedParams = use(params);
    const slug = resolvedParams.slug;
    const router = useRouter();
    const { showAlert } = useGlassAlert();

    const [workspace, setWorkspace] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuthAndLoadWorkspace();
    }, [slug]);

    const checkAuthAndLoadWorkspace = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session);

            const response = await fetch(`/api/workspaces/${slug}/info`);

            if (response.ok) {
                const data = await response.json();
                setWorkspace(data.workspace);
            } else {
                setError("Workspace not found or invalid invitation");
            }
        } catch (err) {
            console.error("Error loading workspace:", err);
            setError("Failed to load workspace");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!isAuthenticated) {
            router.push(`/signin?redirect=/join/${slug}`);
            return;
        }

        setJoining(true);
        try {
            const response = await fetch(`/api/workspaces/${slug}/accept`, {
                method: "POST"
            });

            const data = await response.json();

            if (response.ok) {
                await showAlert("Welcome!", `You have joined ${workspace?.name || "the workspace"}!`, "success");
                router.push("/dashboard/workspaces");
            } else {
                throw new Error(data.error || "Failed to join");
            }
        } catch (err: any) {
            await showAlert("Join Failed", err.message || "Could not join workspace", "error");
        } finally {
            setJoining(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Invitation Not Found</h1>
                    <p className="text-neutral-500 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-neutral-200 transition-colors"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-[#111113] border border-white/10 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/20">
                        <Users className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-2">
                        You are Invited!
                    </h1>

                    <p className="text-neutral-400 mb-6">
                        You have been invited to join
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-8">
                        <p className="text-xl font-semibold text-white">
                            {workspace?.name || "Workspace"}
                        </p>
                        {workspace?.member_count > 0 && (
                            <p className="text-sm text-neutral-500 mt-1">
                                {workspace.member_count} member{workspace.member_count !== 1 ? "s" : ""}
                            </p>
                        )}
                    </div>

                    {isAuthenticated ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                className="w-full py-3 bg-white text-black rounded-xl font-medium text-sm hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {joining ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Accept Invitation
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full py-3 border border-white/10 text-neutral-400 rounded-xl font-medium text-sm hover:bg-white/5 transition-colors"
                            >
                                Decline
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-neutral-500">
                                Sign in or create an account to join this workspace.
                            </p>
                            <div className="space-y-3">
                                <Link
                                    href={`/signin?redirect=/join/${slug}`}
                                    className="w-full py-3 bg-white text-black rounded-xl font-medium text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    Sign In
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    href={`/signup?redirect=/join/${slug}`}
                                    className="w-full py-3 border border-white/10 text-white rounded-xl font-medium text-sm hover:bg-white/5 transition-colors flex items-center justify-center"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-neutral-600 mt-6">
                    Powered by <span className="text-violet-400">Bothive</span>
                </p>
            </motion.div>
        </div>
    );
}
