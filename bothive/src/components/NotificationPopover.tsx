"use client";

import React, { useState } from "react";
import {
    Bell,
    Check,
    Trash2,
    AlertCircle,
    Info,
    Package,
    DollarSign,
    Star,
    Sparkles,
    Loader2,
    Users,
    Users2,
    Building2,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { useTheme } from "@/lib/theme-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

export function NotificationPopover() {
    const router = useRouter();
    const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "purchase": return Package;
            case "sale": return DollarSign;
            case "review": return Star;
            case "alert": return AlertCircle;
            case "workspace_invite": return Users;
            case "workspace_joined": return Check;
            case "invite_sent": return Users2;
            case "workspace_created": return Building2;
            default: return Info;
        }
    };

    const getIconColor = (type: Notification["type"]) => {
        switch (type) {
            case "purchase": return "text-violet-500 bg-violet-500/10";
            case "sale": return "text-emerald-500 bg-emerald-500/10";
            case "review": return "text-amber-500 bg-amber-500/10";
            case "alert": return "text-red-500 bg-red-500/10";
            case "workspace_invite": return "text-violet-500 bg-violet-500/10";
            case "workspace_joined": return "text-emerald-500 bg-emerald-500/10";
            case "invite_sent": return "text-blue-500 bg-blue-500/10";
            default: return "text-blue-500 bg-blue-500/10";
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative group rounded-full w-10 h-10 transition-all duration-300",
                        isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                    )}
                >
                    <Bell className={cn(
                        "w-5 h-5 transition-all duration-300 group-hover:scale-110",
                        isDark
                            ? "text-neutral-400 group-hover:text-white"
                            : "text-neutral-500 group-hover:text-black",
                        unreadCount > 0 && "text-violet-500 group-hover:text-violet-400"
                    )} />

                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5"
                            >
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]"></span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className={cn(
                    "w-[340px] sm:w-[380px] p-0 border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200",
                    isDark ? "bg-[#0c0c12]/95 border border-white/10" : "bg-white/95 border border-black/5"
                )}
            >
                {/* Header */}
                <div className={cn(
                    "flex items-center justify-between px-5 py-4 border-b",
                    isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-black/[0.02]"
                )}>
                    <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-[15px] tracking-tight">Notifications</h3>
                        {unreadCount > 0 && (
                            <div className="bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded-full text-[10px] font-bold border border-violet-500/20">
                                {unreadCount} NEW
                            </div>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsRead()}
                            className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <ScrollArea className="h-[420px]">
                    <div className="py-2">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-40 gap-3 text-neutral-500">
                                <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
                                <span className="text-[11px] font-medium tracking-wide uppercase opacity-50">Synchronizing...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[350px] gap-4 px-8 text-center">
                                <div className={cn(
                                    "w-16 h-16 rounded-3xl flex items-center justify-center rotate-3 shadow-inner",
                                    isDark ? "bg-white/5" : "bg-black/5"
                                )}>
                                    <Bell className="w-8 h-8 opacity-20" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold text-white">No notifications yet</p>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        We'll notify you when something important happens in your swarm.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <AnimatePresence mode="popLayout">
                                    {notifications.map((notification) => {
                                        const Icon = getIcon(notification.type);
                                        const iconClasses = getIconColor(notification.type);

                                        return (
                                            <motion.div
                                                key={notification.id}
                                                layout
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className={cn(
                                                    "relative group flex gap-4 px-5 py-4 transition-all duration-500 cursor-pointer overflow-hidden",
                                                    isDark ? "hover:bg-white/[0.04]" : "hover:bg-black/[0.04]",
                                                    !notification.read && (isDark ? "bg-violet-500/[0.04]" : "bg-violet-50/50")
                                                )}
                                                onClick={() => {
                                                    if (notification.action_link) {
                                                        router.push(notification.action_link);
                                                        setIsOpen(false);
                                                    }
                                                    if (!notification.read) markAsRead(notification.id);
                                                }}
                                            >
                                                {/* Glass Shimmer Effect on Hover */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                                                {/* Status Glow Indicator */}
                                                {!notification.read && (
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-violet-400 to-purple-600 rounded-r-full shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
                                                )}

                                                {/* Icon Container with Glass Effect */}
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                                                    iconClasses,
                                                    isDark ? "border border-white/5" : "border border-black/5"
                                                )}>
                                                    <Icon className="w-6 h-6" />
                                                </div>

                                                {/* Content Component */}
                                                <div className="flex-1 min-w-0 glass-content">
                                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                                        <h4 className={cn(
                                                            "text-[14px] font-bold tracking-tight leading-tight",
                                                            isDark ? "text-white" : "text-neutral-900"
                                                        )}>
                                                            {notification.title}
                                                        </h4>
                                                        <span className={cn(
                                                            "text-[10px] whitespace-nowrap opacity-40 font-bold tracking-widest uppercase mt-0.5",
                                                            isDark ? "text-violet-300" : "text-violet-700"
                                                        )}>
                                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: false })}
                                                        </span>
                                                    </div>
                                                    <p className={cn(
                                                        "text-[13px] leading-[1.6] mb-3 line-clamp-2",
                                                        isDark ? "text-neutral-400" : "text-neutral-600"
                                                    )}>
                                                        {notification.message}
                                                    </p>

                                                    {notification.action_link && (
                                                        <div className="flex items-center gap-2 text-[11px] font-black text-violet-500 group-hover:text-violet-400 transition-all duration-300 uppercase tracking-[0.2em]">
                                                            <div className="w-4 h-[1px] bg-current opacity-30" />
                                                            Review Details
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Hover Action: Delete with Glow */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification.id);
                                                    }}
                                                    className={cn(
                                                        "absolute right-4 bottom-4 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500/20 hover:text-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]",
                                                        isDark ? "text-neutral-700 bg-white/5" : "text-neutral-300 bg-black/5"
                                                    )}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className={cn(
                    "p-4 border-t",
                    isDark ? "border-white/5 bg-white/[0.01]" : "border-black/5 bg-black/[0.01]"
                )}>
                    <Link href="/dashboard/notifications" className="block" onClick={() => setIsOpen(false)}>
                        <Button
                            variant="ghost"
                            className="w-full h-10 text-xs font-bold uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all duration-300 border border-white/5"
                        >
                            History Center
                        </Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
