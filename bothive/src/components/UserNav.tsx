"use client";

import { useEffect, useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSession } from "@/lib/app-session-context";
import { User, Settings, CreditCard, LogOut, Plus, LifeBuoy, Users, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useGlassAlert } from "@/components/ui/glass-alert";
import { SubscriptionService, type SubscriptionPlan } from "@/lib/services/subscription.service";

const getGradient = (str: string) => {
    const hash = str.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const hue1 = hash % 360;
    const hue2 = (hue1 + 40) % 360;
    return `linear-gradient(135deg, hsl(${hue1}, 95%, 65%), hsl(${hue2}, 95%, 60%))`;
};

export function UserNav() {
    const { profile } = useAppSession();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [plan, setPlan] = useState<SubscriptionPlan | null>(null);

    useEffect(() => {
        if (!profile?.id) return;

        let cancelled = false;

        SubscriptionService.getUserSubscription(profile.id)
            .then((currentPlan) => {
                if (!cancelled) {
                    setPlan(currentPlan);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setPlan(null);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [profile?.id]);

    const { showAlert } = useGlassAlert();

    const handleSignOut = async () => {
        // Game-style "In Your Face" Alert
        await showAlert("Signing Out", "Closing secure session and clearing local data...", "error");

        try {
            // Use client-side signOut provided by the library wrapper
            const { supabase } = await import("@/lib/supabase");
            await supabase.auth.signOut();
            window.location.href = "/signin";
        } catch (error) {
            console.error("Sign out failed", error);
            window.location.href = "/signin";
        }
    };

    const gradient = getGradient(profile?.email || profile?.id || "default");
    const displayName = profile?.fullName || profile?.email?.split("@")[0] || "Your account";
    const displayEmail = profile?.email || "";
    const isPaidPlan = plan === "Pro" || plan === "Business";

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="sm"
                className={cn(
                    "hidden md:inline-flex items-center gap-2 rounded-full pl-4 pr-3 h-9 text-xs font-medium border-neutral-200 bg-white shadow-sm hover:bg-neutral-50 hover:border-neutral-300",
                    "dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white/80"
                )}
            >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                    <Plus className="h-3 w-3" />
                </div>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm ring-0 hover:shadow-md transition-all dark:bg-white/5 dark:border-white/15">
                        <div className="absolute inset-[-2px] rounded-full bg-[conic-gradient(at_top,_#f97316,_#ec4899,_#6366f1,_#22c55e,_#f97316)] opacity-80" />
                        <div className="relative h-8 w-8 rounded-full bg-white p-[2px] dark:bg-neutral-950">
                            <div className="h-full w-full rounded-full overflow-hidden">
                                <Avatar className="h-full w-full">
                                    <AvatarImage src={profile?.avatarUrl || ""} alt={displayName} />
                                    <AvatarFallback
                                        className="h-full w-full text-xs font-semibold text-white"
                                        style={{ background: gradient }}
                                    >
                                        {displayName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className={cn(
                        "w-[280px] rounded-3xl border p-2 shadow-xl bg-white/95 backdrop-blur-md",
                        "border-neutral-200/80 text-neutral-900",
                        "dark:bg-[#050509]/95 dark:border-white/10 dark:text-white"
                    )}
                    align="end"
                    forceMount
                    sideOffset={10}
                >
                    <DropdownMenuLabel className="px-3 pt-3 pb-2">
                        <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold leading-tight truncate">
                                    {displayName}
                                </p>
                                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 truncate">
                                    {displayEmail}
                                </p>
                            </div>
                            <div className="relative">
                                <div className="h-9 w-9 rounded-full bg-white p-[2px] shadow-sm dark:bg-neutral-950">
                                    <div
                                        className="h-full w-full rounded-full"
                                        style={{ background: gradient }}
                                    />
                                </div>
                                <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/70 dark:ring-white/40" />
                            </div>
                        </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator className="mx-2 my-1 h-px bg-neutral-200 dark:bg-white/10" />

                    <DropdownMenuGroup className="p-2 flex flex-col gap-1">
                        <AnimatePresence>
                            {[
                                {
                                    href: "/dashboard/profile",
                                    icon: User,
                                    label: "Profile",
                                    sub: "Manage your account",
                                    color: "text-blue-500",
                                    bg: "bg-blue-500/10",
                                    hoverBg: "group-hover:bg-blue-500"
                                },
                                {
                                    href: "/dashboard/community",
                                    icon: Users,
                                    label: "Community",
                                    sub: "Join the discussion",
                                    color: "text-indigo-500",
                                    bg: "bg-indigo-500/10",
                                    hoverBg: "group-hover:bg-indigo-500"
                                },
                                {
                                    href: "/dashboard/billing",
                                    icon: Sparkles,
                                    label: "Subscription",
                                    sub: isPaidPlan ? "Pro Plan Active" : "Upgrade to Pro",
                                    badge: isPaidPlan ? "PRO" : undefined,
                                    color: "text-amber-500",
                                    bg: "bg-amber-500/10",
                                    hoverBg: "group-hover:bg-amber-500"
                                },
                                {
                                    href: "/dashboard/settings",
                                    icon: Settings,
                                    label: "Settings",
                                    sub: "Preferences & API",
                                    color: "text-slate-500",
                                    bg: "bg-slate-500/10",
                                    hoverBg: "group-hover:bg-neutral-800"
                                },
                            ].map((item, i) => (
                                <motion.div
                                    key={item.href}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 + i * 0.03, duration: 0.18 }}
                                >
                                    <MenuItem {...item} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator className="mx-2 my-1 h-px bg-neutral-100 dark:bg-white/5" />

                    <div className="p-2 pt-1">
                        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <MenuItem
                                href="/help"
                                icon={LifeBuoy}
                                label="Support"
                                sub="Get help & docs"
                                color="text-teal-500"
                                bg="bg-teal-500/10"
                                hoverBg="group-hover:bg-teal-500"
                            />
                        </motion.div>

                        <DropdownMenuItem
                            onClick={handleSignOut}
                            className="group flex items-center gap-3 rounded-xl px-3 py-2.5 mt-1 cursor-pointer focus:bg-red-50 focus:text-neutral-900 dark:focus:bg-red-500/10 dark:focus:text-neutral-100 transition-all duration-200"
                        >
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="h-9 w-9 shrink-0 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center text-red-500 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300"
                            >
                                <LogOut className="h-4 w-4 ml-0.5" strokeWidth={2.5} />
                            </motion.div>
                            <div className="flex flex-col">
                                <span className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">Sign Out</span>
                                <span className="text-[11px] text-neutral-500 dark:text-neutral-400">End session</span>
                            </div>
                        </DropdownMenuItem>
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

function MenuItem({ href, icon: Icon, label, sub, badge, color, bg, hoverBg }: any) {
    return (
        <DropdownMenuItem asChild className="group cursor-pointer rounded-xl px-3 py-2.5 focus:bg-neutral-50 dark:focus:bg-white/5 transition-all outline-none border border-transparent hover:border-neutral-200 dark:hover:border-white/5">
            <Link href={href} className="flex w-full items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={cn(
                        "h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition-all duration-300 group-hover:text-white",
                        color, bg, hoverBg
                    )}
                >
                    <Icon className="h-4 w-4" strokeWidth={2.5} />
                </motion.div>

                <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{label}</span>
                        {badge && (
                            <span className="rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                {badge}
                            </span>
                        )}
                    </div>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 transition-colors truncate">
                        {sub}
                    </span>
                </div>
            </Link>
        </DropdownMenuItem>
    );
}
