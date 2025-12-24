"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bell,
    Check,
    CheckCheck,
    Mail,
    CreditCard,
    Bot,
    Sparkles,
    Trash2,
    Clock,
    Filter,
    Loader2,
    Package,
    DollarSign,
    Star,
} from "lucide-react";
import { DashboardPageShell } from "@/components/DashboardPageShell";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationsPage() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const filteredNotifications =
        filter === "unread"
            ? notifications.filter((n) => !n.read)
            : notifications;

    const getIcon = (type: string) => {
        switch (type) {
            case "purchase":
                return Package;
            case "sale":
                return DollarSign;
            case "review":
                return Star;
            default:
                return Bell;
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case "purchase":
                return isDark ? "text-violet-400 bg-violet-500/10" : "text-violet-600 bg-violet-50";
            case "sale":
                return isDark ? "text-emerald-400 bg-emerald-500/10" : "text-emerald-600 bg-emerald-50";
            case "review":
                return isDark ? "text-amber-400 bg-amber-500/10" : "text-amber-600 bg-amber-50";
            default:
                return isDark ? "text-blue-400 bg-blue-500/10" : "text-blue-600 bg-blue-50";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <DashboardPageShell
            title="Notifications"
            description="Stay updated on purchases, sales, and system updates"
        >
            <div className="max-w-3xl mx-auto">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                filter === "all"
                                    ? isDark
                                        ? "bg-white/10 text-white"
                                        : "bg-black/10 text-black"
                                    : isDark
                                        ? "text-white/50 hover:text-white"
                                        : "text-black/50 hover:text-black"
                            )}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={cn(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                                filter === "unread"
                                    ? isDark
                                        ? "bg-white/10 text-white"
                                        : "bg-black/10 text-black"
                                    : isDark
                                        ? "text-white/50 hover:text-white"
                                        : "text-black/50 hover:text-black"
                            )}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full text-xs bg-violet-500 text-white">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                isDark
                                    ? "text-white/50 hover:text-white hover:bg-white/5"
                                    : "text-black/50 hover:text-black hover:bg-black/5"
                            )}
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className={cn("w-8 h-8 animate-spin", isDark ? "text-white/40" : "text-black/40")} />
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="text-center py-20">
                        <div
                            className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                                isDark ? "bg-white/5" : "bg-black/5"
                            )}
                        >
                            <Bell className={cn("w-8 h-8", isDark ? "text-white/30" : "text-black/30")} />
                        </div>
                        <p className={cn("font-medium mb-1", isDark ? "text-white" : "text-black")}>
                            {filter === "unread" ? "All caught up!" : "No notifications yet"}
                        </p>
                        <p className={cn("text-sm", isDark ? "text-white/50" : "text-black/50")}>
                            {filter === "unread"
                                ? "You've read all your notifications"
                                : "Notifications about purchases and sales will appear here"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {filteredNotifications.map((notification) => {
                                const Icon = getIcon(notification.type);
                                const iconColor = getIconColor(notification.type);

                                return (
                                    <motion.div
                                        key={notification.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        layout
                                        onClick={() => markAsRead(notification.id)}
                                        className={cn(
                                            "relative p-5 rounded-xl border transition-all cursor-pointer group",
                                            isDark
                                                ? "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]"
                                                : "bg-white border-black/[0.06] hover:bg-black/[0.02] shadow-sm",
                                            !notification.read && (isDark ? "border-violet-500/20" : "border-violet-200")
                                        )}
                                    >
                                        {/* Unread indicator */}
                                        {!notification.read && (
                                            <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-violet-500" />
                                        )}

                                        <div className="flex items-start gap-4">
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconColor)}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h3
                                                            className={cn(
                                                                "font-medium mb-1",
                                                                isDark ? "text-white" : "text-black",
                                                                !notification.read && "font-semibold"
                                                            )}
                                                        >
                                                            {notification.title}
                                                        </h3>
                                                        <p
                                                            className={cn(
                                                                "text-sm leading-relaxed",
                                                                isDark ? "text-white/60" : "text-black/60"
                                                            )}
                                                        >
                                                            {notification.message}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mt-3">
                                                    <span
                                                        className={cn(
                                                            "flex items-center gap-1 text-xs",
                                                            isDark ? "text-white/40" : "text-black/40"
                                                        )}
                                                    >
                                                        <Clock className="w-3 h-3" />
                                                        {formatDate(notification.created_at)}
                                                    </span>

                                                    {notification.metadata?.amount !== undefined && notification.metadata.amount > 0 && (
                                                        <span
                                                            className={cn(
                                                                "text-xs font-medium",
                                                                notification.type === "sale" ? "text-emerald-500" : "text-violet-500"
                                                            )}
                                                        >
                                                            ₦{(notification.metadata.amount / 100).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Delete button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className={cn(
                                                    "p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all",
                                                    isDark
                                                        ? "hover:bg-white/10 text-white/40 hover:text-red-400"
                                                        : "hover:bg-black/10 text-black/40 hover:text-red-500"
                                                )}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </DashboardPageShell>
    );
}
