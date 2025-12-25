"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useAppSession } from "@/lib/app-session-context";
import { useGlassAlert } from "@/components/ui/glass-alert";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Notification {
    id: string;
    type: "purchase" | "sale" | "system" | "review" | "alert" | "info";
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    action_link?: string;
    metadata?: Record<string, any>;
}

export function useNotifications() {
    const { profile } = useAppSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const { showAlert } = useGlassAlert();

    // Use new SSR client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch initial notifications
    const fetchNotifications = useCallback(async () => {
        if (!profile?.id) return;

        try {
            const { data, error } = await supabase
                .from("notifications")
                .select("*")
                .eq("user_id", profile.id)
                .order("created_at", { ascending: false })
                .limit(50);

            if (error) throw error;
            setNotifications(data || []);
            setUnreadCount((data || []).filter((n) => !n.read).length);
        } catch (error: any) {
            console.error("Error fetching notifications:", error.message || error, error);
        } finally {
            setLoading(false);
        }
    }, [profile?.id, supabase]);

    // Realtime subscription
    useEffect(() => {
        if (!profile?.id) return;

        fetchNotifications();

        const channel = supabase
            .channel("notifications-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${profile.id}`,
                },
                (payload) => {
                    if (payload.eventType === "INSERT") {
                        const newNotification = payload.new as Notification;
                        setNotifications((prev) => [newNotification, ...prev]);
                        setUnreadCount((prev) => prev + 1);

                        // Show Glass Alert for new notification
                        showAlert(newNotification.title, newNotification.message, (newNotification.type === "alert" || newNotification.type === "purchase") ? "success" : "info");
                    } else if (payload.eventType === "UPDATE") {
                        const updatedNotification = payload.new as Notification;
                        setNotifications((prev) =>
                            prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
                        );
                        // Re-calculate unread count from state to be safe
                        setUnreadCount((prev) => {
                            const old = notifications.find(n => n.id === updatedNotification.id);
                            if (old && !old.read && updatedNotification.read) return Math.max(0, prev - 1);
                            return prev;
                        });
                    } else if (payload.eventType === "DELETE") {
                        const deletedId = payload.old.id;
                        setNotifications((prev) => {
                            const existed = prev.find(n => n.id === deletedId);
                            if (existed && !existed.read) setUnreadCount(c => Math.max(0, c - 1));
                            return prev.filter(n => n.id !== deletedId);
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.id, fetchNotifications, supabase]);

    // Actions
    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => {
                if (n.id === id && !n.read) {
                    setUnreadCount((c) => Math.max(0, c - 1));
                    return { ...n, read: true };
                }
                return n;
            })
        );

        if (profile?.id) {
            await supabase.from("notifications").update({ read: true }).eq("id", id);
        }
    };

    const markAllAsRead = async () => {
        // Optimistic
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);

        if (profile?.id) {
            await supabase
                .from("notifications")
                .update({ read: true })
                .eq("user_id", profile.id)
                .eq("read", false);
        }
    };

    const deleteNotification = async (id: string) => {
        // Optimistic
        setNotifications((prev) => {
            const target = prev.find(n => n.id === id);
            if (target && !target.read) setUnreadCount(c => Math.max(0, c - 1));
            return prev.filter(n => n.id !== id);
        });

        if (profile?.id) {
            await supabase.from("notifications").delete().eq("id", id);
        }
    };

    return {
        notifications,
        loading,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh: fetchNotifications
    };
}
