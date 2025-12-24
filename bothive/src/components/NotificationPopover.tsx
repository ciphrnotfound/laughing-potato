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
    Loader2
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
import { formatDistanceToNow } from "date-fns";

export function NotificationPopover() {
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
            default: return Info;
        }
    };

    const getIconColor = (type: Notification["type"]) => {
        switch (type) {
            case "purchase": return "text-violet-500 bg-violet-500/10";
            case "sale": return "text-emerald-500 bg-emerald-500/10";
            case "review": return "text-amber-500 bg-amber-500/10";
            case "alert": return "text-red-500 bg-red-500/10";
            default: return "text-blue-500 bg-blue-500/10";
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group rounded-full w-10 h-10 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                    <Bell className={cn(
                        "w-5 h-5 transition-colors",
                        isDark
                            ? "text-neutral-400 group-hover:text-white"
                            : "text-neutral-500 group-hover:text-black",
                        unreadCount > 0 && "text-violet-500 group-hover:text-violet-600"
                    )} />

                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute top-2 right-2 flex h-2.5 w-2.5"
                            >
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500"></span>
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className={cn(
                    "w-80 sm:w-96 p-0 border-none shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl",
                    isDark ? "bg-[#0a0a0f]/90 border border-white/10" : "bg-white/90 border border-black/5"
                )}
            >
                {/* Header */}
                <div className={cn(
                    "flex items-center justify-between px-4 py-3 border-b",
                    isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"
                )}>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="h-5 px-1.5 min-w-[1.25rem] bg-violet-500 text-white border-0 text-[10px]">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAllAsRead()}
                            className="h-7 text-xs px-2 text-violet-500 hover:text-violet-600 hover:bg-violet-500/10"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-500 py-12">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-xs">Loading...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-500 py-12 px-6 text-center">
                            <div className={cn("p-4 rounded-2xl mb-2", isDark ? "bg-white/5" : "bg-black/5")}>
                                <Bell className="w-6 h-6 opacity-30" />
                            </div>
                            <p className="text-sm font-medium">All caught up!</p>
                            <p className="text-xs opacity-60">
                                You don't have any notifications right now.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <AnimatePresence mode="popLayout">
                                {notifications.map((notification) => {
                                    const Icon = getIcon(notification.type);

                                    return (
                                        <motion.div
                                            key={notification.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: -20, height: 0 }}
                                            className={cn(
                                                "relative group flex gap-3 px-4 py-4 border-b transition-colors cursor-pointer",
                                                isDark
                                                    ? "border-white/5 hover:bg-white/5"
                                                    : "border-black/5 hover:bg-black/5",
                                                !notification.read && (isDark ? "bg-violet-500/5" : "bg-violet-50")
                                            )}
                                        >
                                            {/* Unread clickable indicator */}
                                            {!notification.read && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notification.id);
                                                    }}
                                                    className="absolute top-4 right-4 w-2 h-2 rounded-full bg-violet-500 hover:scale-150 transition-transform"
                                                    title="Mark as read"
                                                />
                                            )}

                                            {/* Icon */}
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                                                getIconColor(notification.type)
                                            )}>
                                                <Icon className="w-4 h-4" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className={cn(
                                                    "text-sm font-medium leading-none mb-1.5",
                                                    !notification.read && "font-semibold",
                                                    isDark ? "text-neutral-200" : "text-neutral-800"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                <p className={cn(
                                                    "text-xs leading-relaxed mb-2 line-clamp-2",
                                                    isDark ? "text-neutral-400" : "text-neutral-500"
                                                )}>
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[10px]",
                                                        isDark ? "text-neutral-600" : "text-neutral-400"
                                                    )}>
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </span>

                                                    {/* Delete Action (visible on hover) */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        className={cn(
                                                            "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-500/10 hover:text-red-500",
                                                            isDark ? "text-neutral-600" : "text-neutral-400"
                                                        )}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                <div className={cn(
                    "p-2 border-t",
                    isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-black/[0.02]"
                )}>
                    <Link href="/dashboard/notifications">
                        <Button variant="ghost" className="w-full h-8 text-xs font-medium">
                            View all notifications
                        </Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    );
}
