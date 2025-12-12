"use client";

import React from "react";
import { Bot, Play, Edit, Upload, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotCardProps {
    bot: {
        id: string;
        name: string;
        description?: string;
        status?: string;
        lastRun?: string;
    };
    onExecute?: () => void;
    onEdit?: () => void;
    onPublish?: () => void;
    isExecuting?: boolean;
}

export function BotCard({ bot, onExecute, onEdit, onPublish, isExecuting }: BotCardProps) {
    const statusConfig = {
        active: { icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
        draft: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
        error: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10" },
    };

    const status = bot.status || "draft";
    const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock;
    const statusColor = statusConfig[status as keyof typeof statusConfig]?.color || "text-white/50";
    const statusBg = statusConfig[status as keyof typeof statusConfig]?.bg || "bg-white/5";

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/20 to-indigo-900/10 p-5 transition-all hover:border-purple-500/30 hover:shadow-[0_8px_30px_rgba(124,58,237,0.3)]">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-white">{bot.name}</h4>
                        <p className="mt-1 text-xs text-white/60">{bot.description || "No description"}</p>
                    </div>
                </div>
                <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1", statusBg)}>
                    <StatusIcon className={cn("h-3 w-3", statusColor)} />
                    <span className={cn("text-[10px] uppercase tracking-wider", statusColor)}>{status}</span>
                </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
                {onExecute && (
                    <button
                        onClick={onExecute}
                        disabled={isExecuting}
                        className="flex items-center gap-1.5 rounded-lg bg-purple-600/80 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-600 disabled:opacity-50"
                    >
                        <Play className="h-3.5 w-3.5" />
                        {isExecuting ? "Running..." : "Execute"}
                    </button>
                )}
                {onEdit && (
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
                    >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                    </button>
                )}
                {onPublish && (
                    <button
                        onClick={onPublish}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10"
                    >
                        <Upload className="h-3.5 w-3.5" />
                        Publish
                    </button>
                )}
            </div>

            {bot.lastRun && (
                <div className="mt-3 text-[10px] uppercase tracking-wider text-white/40">
                    Last run: {new Date(bot.lastRun).toLocaleDateString()}
                </div>
            )}
        </div>
    );
}
