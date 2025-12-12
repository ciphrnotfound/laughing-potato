"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Workflow,
    Play,
    Pause,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    ArrowLeft,
    Zap,
    Activity,
    TrendingUp,
    Eye,
    Plus,
    Search
} from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import ThemeToggle from "@/components/ThemeToggle";
import VisualWorkflowBuilder from "@/components/VisualWorkflowBuilder";
import { useAppSession } from "@/lib/app-session-context";
import { cn } from "@/lib/utils";

interface WorkflowType {
    id: string;
    name: string;
    description: string;
    status: "active" | "paused" | "draft";
    created_at: string;
    last_run?: string;
    next_run?: string;
    runs_count: number;
    success_rate: number;
    avg_runtime: number;
}

export default function WorkflowsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { profile } = useAppSession();
    const [workflows, setWorkflows] = useState<WorkflowType[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        try {
            const response = await fetch("/api/workflows");
            if (response.ok) {
                const data = await response.json();
                setWorkflows(data.workflows || []);
            }
        } catch (error) {
            console.error("Failed to fetch workflows:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (workflowId: string) => {
        try {
            const response = await fetch(`/api/workflows/${workflowId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setWorkflows((prev) => prev.filter((w) => w.id !== workflowId));
                setShowDeleteConfirm(null);
            }
        } catch (error) {
            console.error("Failed to delete workflow:", error);
        }
    };

    const toggleWorkflowStatus = async (workflowId: string, currentStatus: string) => {
        const newStatus = currentStatus === "active" ? "paused" : "active";
        try {
            const response = await fetch(`/api/workflows/${workflowId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setWorkflows((prev) =>
                    prev.map((w) =>
                        w.id === workflowId ? { ...w, status: newStatus as WorkflowType["status"] } : w
                    )
                );
            }
        } catch (error) {
            console.error("Failed to update workflow status:", error);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Theme-aware styles
    const cardBg = isDark
        ? "bg-white/[0.02] border-white/[0.06]"
        : "bg-white border-black/[0.06] shadow-sm";
    const textPrimary = isDark ? "text-white" : "text-black";
    const textSecondary = isDark ? "text-white/60" : "text-black/60";
    const inputBg = isDark
        ? "bg-white/[0.03] border-white/[0.08]"
        : "bg-white border-black/[0.1]";

    const filteredWorkflows = workflows.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: workflows.length,
        active: workflows.filter((w) => w.status === "active").length,
        totalRuns: workflows.reduce((acc, w) => acc + w.runs_count, 0),
    };

    if (!profile) {
        return (
            <DashboardPageShell title="Workflows" headerAction={<ThemeToggle />}>
                <div className={cn("p-8 rounded-2xl border text-center", cardBg)}>
                    <p className={textSecondary}>Please sign in to view workflows.</p>
                </div>
            </DashboardPageShell>
        );
    }

    // Visual Workflow Builder View
    if (selectedWorkflow) {
        const workflow = workflows.find((w) => w.id === selectedWorkflow);
        return (
            <DashboardPageShell
                title={selectedWorkflow === "new" ? "New Workflow" : workflow?.name || "Workflow"}
                description="Visual Workflow Editor"
                headerAction={
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSelectedWorkflow(null)}
                            className={cn(
                                "p-2 rounded-lg transition-colors flex items-center gap-2",
                                isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-black/5 text-black/70"
                            )}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                        <ThemeToggle />
                    </div>
                }
            >
                <VisualWorkflowBuilder />
            </DashboardPageShell>
        );
    }

    return (
        <DashboardPageShell
            title="Workflows"
            description="Automate your tasks with visual workflows"
            headerAction={
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedWorkflow("new")}
                        className={cn(
                            "px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all",
                            isDark
                                ? "bg-white text-black hover:bg-white/90"
                                : "bg-black text-white hover:bg-black/90"
                        )}
                    >
                        <Plus className="w-4 h-4" />
                        Create Workflow
                    </motion.button>
                </div>
            }
        >
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("p-5 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", isDark ? "bg-violet-500/10" : "bg-violet-50")}>
                            <Workflow className="w-5 h-5 text-violet-500" />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", textPrimary)}>{stats.total}</p>
                            <p className={cn("text-sm", textSecondary)}>Total Workflows</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className={cn("p-5 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", isDark ? "bg-emerald-500/10" : "bg-emerald-50")}>
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", textPrimary)}>{stats.active}</p>
                            <p className={cn("text-sm", textSecondary)}>Active</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={cn("p-5 rounded-2xl border", cardBg)}
                >
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", isDark ? "bg-blue-500/10" : "bg-blue-50")}>
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className={cn("text-2xl font-bold", textPrimary)}>{stats.totalRuns}</p>
                            <p className={cn("text-sm", textSecondary)}>Total Runs</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6"
            >
                <div className="relative">
                    <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5", textSecondary)} />
                    <input
                        type="text"
                        placeholder="Search workflows..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            "w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-colors focus:border-violet-500",
                            inputBg, textPrimary
                        )}
                    />
                </div>
            </motion.div>

            {/* Workflows List */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
                </div>
            ) : filteredWorkflows.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16"
                >
                    <div className={cn(
                        "w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center",
                        isDark ? "bg-white/[0.03]" : "bg-black/[0.03]"
                    )}>
                        <Workflow className={cn("w-8 h-8", textSecondary)} />
                    </div>
                    <h3 className={cn("text-lg font-semibold mb-2", textPrimary)}>No workflows yet</h3>
                    <p className={cn("mb-6", textSecondary)}>Create your first workflow to automate your tasks</p>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedWorkflow("new")}
                        className={cn(
                            "px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2",
                            isDark
                                ? "bg-white text-black hover:bg-white/90"
                                : "bg-black text-white hover:bg-black/90"
                        )}
                    >
                        <Workflow className="w-5 h-5" />
                        Create Workflow
                    </motion.button>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    {filteredWorkflows.map((workflow, index) => (
                        <motion.div
                            key={workflow.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.03 }}
                            className={cn("p-5 rounded-2xl border transition-colors", cardBg)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    {/* Status Icon */}
                                    <div
                                        className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center",
                                            workflow.status === "active"
                                                ? isDark ? "bg-emerald-500/10" : "bg-emerald-50"
                                                : workflow.status === "paused"
                                                    ? isDark ? "bg-yellow-500/10" : "bg-yellow-50"
                                                    : isDark ? "bg-white/[0.03]" : "bg-black/[0.03]"
                                        )}
                                    >
                                        {workflow.status === "active" ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        ) : workflow.status === "paused" ? (
                                            <Pause className="w-5 h-5 text-yellow-500" />
                                        ) : (
                                            <XCircle className={cn("w-5 h-5", textSecondary)} />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={cn("text-lg font-semibold mb-1", textPrimary)}>
                                            {workflow.name}
                                        </h3>
                                        <p className={cn("text-sm mb-2 truncate", textSecondary)}>
                                            {workflow.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs">
                                            <span className={cn("flex items-center gap-1", textSecondary)}>
                                                <Activity className="w-3 h-3" />
                                                {workflow.runs_count} runs
                                            </span>
                                            <span className={cn("flex items-center gap-1", textSecondary)}>
                                                <Zap className="w-3 h-3" />
                                                {workflow.success_rate}% success
                                            </span>
                                            {workflow.last_run && (
                                                <span className={cn("flex items-center gap-1", textSecondary)}>
                                                    <Clock className="w-3 h-3" />
                                                    Last: {formatDate(workflow.last_run)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleWorkflowStatus(workflow.id, workflow.status)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            isDark ? "hover:bg-white/10" : "hover:bg-black/5"
                                        )}
                                    >
                                        {workflow.status === "active" ? (
                                            <Pause className={cn("w-5 h-5", textSecondary)} />
                                        ) : (
                                            <Play className={cn("w-5 h-5", textSecondary)} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setSelectedWorkflow(workflow.id)}
                                        className={cn(
                                            "p-2 rounded-lg transition-colors",
                                            isDark ? "hover:bg-violet-500/10 text-violet-400" : "hover:bg-violet-50 text-violet-600"
                                        )}
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(workflow.id)}
                                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Delete Confirmation */}
                            <AnimatePresence>
                                {showDeleteConfirm === workflow.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={cn(
                                            "mt-4 pt-4 border-t",
                                            isDark ? "border-white/[0.06]" : "border-black/[0.06]"
                                        )}
                                    >
                                        <p className={cn("text-sm mb-3", textSecondary)}>
                                            Delete this workflow? This cannot be undone.
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDelete(workflow.id)}
                                                className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteConfirm(null)}
                                                className={cn(
                                                    "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                                                    isDark
                                                        ? "border-white/[0.1] text-white hover:bg-white/5"
                                                        : "border-black/[0.1] text-black hover:bg-black/5"
                                                )}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </DashboardPageShell>
    );
}
