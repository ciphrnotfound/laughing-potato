"use client";

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
import { User, Settings, CreditCard, LogOut, Sparkles, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

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

    const handleSignOut = async () => {
        try {
            await fetch("/api/auth/session", { method: "DELETE" });
            window.location.href = "/signin";
        } catch (error) {
            console.error("Sign out failed", error);
        }
    };

    const gradient = getGradient(profile?.email || "default");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 p-0 rounded-full ring-2 ring-white/10 hover:ring-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-violet-500/30 overflow-hidden shadow-lg group">
                    <Avatar className="h-9 w-9 transition-transform hover:scale-105 duration-300 ease-out">
                        <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                        <AvatarFallback
                            className="text-white font-bold"
                            style={{ background: gradient }}
                        />
                    </Avatar>
                    <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10 group-hover:ring-white/30 transition-all" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={cn(
                    "w-[280px] p-2 border shadow-2xl rounded-3xl backdrop-blur-3xl overflow-hidden isolate",
                    isDark
                        ? "bg-[#0a0a0f]/80 border-white/[0.08] shadow-black/80"
                        : "bg-white/80 border-black/[0.06] shadow-xl"
                )}
                align="end"
                forceMount
                sideOffset={16}
            >
                {/* Detail: Subtle Noise Texture for Premium Feel */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                {/* Glass Reflection effect */}
                <div className={cn(
                    "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent",
                    isDark ? "opacity-50" : "opacity-100"
                )} />

                <DropdownMenuLabel className="font-normal p-3 pb-4 relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="relative group/avatar cursor-default">
                            <div className="h-10 w-10 rounded-full shadow-lg ring-2 ring-white/10 relative z-10 transition-transform duration-500 hover:scale-105 hover:rotate-3" style={{ background: gradient }} />
                            <div className="absolute inset-0 rounded-full bg-inherit blur-lg opacity-50 group-hover/avatar:opacity-75 transition-opacity duration-500" />
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <p className="text-[14px] font-semibold leading-none tracking-tight text-neutral-900 dark:text-white drop-shadow-sm">
                                {profile?.full_name || "User"}
                            </p>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <p className="text-[11px] leading-none font-mono tracking-tight truncate max-w-[140px]">
                                    {profile?.email}
                                </p>
                            </div>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <div className="px-1 pb-2 relative z-10">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "group relative overflow-hidden rounded-2xl p-0.5 cursor-pointer transition-all duration-300 shadow-md",
                            isDark
                                ? "bg-gradient-to-br from-violet-500/20 via-fuchsia-500/20 to-transparent"
                                : "bg-gradient-to-br from-violet-100 via-fuchsia-100 to-white"
                        )}>
                        <div className={cn(
                            "relative bg-[#0a0a0f] dark:bg-black/40 rounded-[14px] p-3 flex items-center justify-between backdrop-blur-sm border border-white/5",
                            !isDark && "bg-white/60 border-white/40"
                        )}>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className={cn(
                                    "p-2 rounded-xl bg-gradient-to-br shadow-inner",
                                    isDark ? "from-violet-600 to-indigo-600 text-white" : "from-violet-500 to-indigo-500 text-white"
                                )}>
                                    <Zap className="w-3.5 h-3.5 fill-white" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-[12px] font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-200 to-fuchsia-200">
                                        Free Plan
                                    </span>
                                    <span className="text-[10px] text-white/50 font-medium">Unlock Pro Features</span>
                                </div>
                            </div>
                            <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                <ChevronRight className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                    </motion.div>
                </div>

                <DropdownMenuSeparator className={cn("mx-2 my-1", isDark ? "bg-white/[0.08]" : "bg-black/[0.04]")} />

                <DropdownMenuGroup className="space-y-1 p-1.5 relative z-10">
                    <AnimatePresence>
                        {[
                            { href: "/dashboard/profile", icon: User, label: "Profile" },
                            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
                            { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
                        ].map((item, i) => (
                            <motion.div
                                key={item.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + (i * 0.05), duration: 0.2 }}
                            >
                                <MenuItem href={item.href} icon={item.icon} label={item.label} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className={cn("mx-2 my-1", isDark ? "bg-white/[0.08]" : "bg-black/[0.04]")} />

                <div className="p-1.5 relative z-10">
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer focus:bg-red-500/10 focus:text-red-600 text-red-500/90 dark:text-red-400/90 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        asChild
                    >
                        <div className="w-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <LogOut className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                <span className="text-[13px] font-medium ml-2">Log out</span>
                            </div>
                            {/* Cool animated dot for Sign Out */}
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full bg-red-500"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            />
                        </div>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function MenuItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <DropdownMenuItem asChild className="group focus:bg-white/5 active:bg-white/10 rounded-xl cursor-pointer outline-none border border-transparent focus:border-white/5 transition-all duration-200">
            <Link href={href} className="w-full flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity text-neutral-500 dark:text-neutral-400 group-hover:text-violet-400" />
                    <span className="text-[13px] font-medium text-neutral-600 dark:text-neutral-300 group-hover:text-white transition-colors">{label}</span>
                </div>
            </Link>
        </DropdownMenuItem>
    );
}
