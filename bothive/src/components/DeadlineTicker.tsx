"use client";

import { useDeadlines } from "@/lib/deadline-context";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Calendar, CheckCircle2, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function DeadlineTicker() {
    const { deadlines } = useDeadlines();
    const [activeDeadline, setActiveDeadline] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        // Find shortest upcoming deadline
        const now = new Date();
        const upcoming = deadlines
            .filter((d) => new Date(d.date) > now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

        setActiveDeadline(upcoming || null);
    }, [deadlines]);

    useEffect(() => {
        if (!activeDeadline) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(activeDeadline.date).getTime();
            const distance = target - now;

            if (distance < 0) {
                setTimeLeft("Overdue");
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) setTimeLeft(`${days}d ${hours}h left`);
            else setTimeLeft(`${hours}h ${minutes}m left`);
        }, 60000); // Update every minute to save resources

        // Initial set
        const now = new Date().getTime();
        const target = new Date(activeDeadline.date).getTime();
        const distance = target - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) setTimeLeft(`${days}d ${hours}h left`);
        else setTimeLeft(`${hours}h ${Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))}m left`);

        return () => clearInterval(timer);
    }, [activeDeadline]);

    if (!activeDeadline) return null;

    const isUrgent = activeDeadline.priority === "high";

    return (
        <div className={cn(
            "w-full h-10 flex items-center justify-center text-xs font-medium border-b transition-colors",
            isUrgent
                ? "bg-amber-950/30 border-amber-900/50 text-amber-500"
                : "bg-zinc-900/50 border-zinc-800 text-zinc-400"
        )}>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
            >
                {isUrgent ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span className="uppercase tracking-wider opacity-70">Focus Mode:</span>
                <span className="text-white font-semibold">{activeDeadline.title}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-black/20 border border-white/5 font-mono">
                    {timeLeft}
                </span>
            </motion.div>
        </div>
    );
}
