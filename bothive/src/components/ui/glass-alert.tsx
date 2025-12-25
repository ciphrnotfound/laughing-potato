"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, CheckCircle2, XCircle, AlertOctagon, Terminal, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "success" | "error" | "warning" | "info";

interface GlassAlertContextProps {
  showAlert: (title: string, message: string, type?: AlertType) => Promise<void>;
  hideAlert: () => void;
}

const GlassAlertContext = createContext<GlassAlertContextProps | undefined>(undefined);

export const useGlassAlert = () => {
  const context = useContext(GlassAlertContext);
  if (!context) throw new Error("useGlassAlert must be used within a GlassAlertProvider");
  return context;
};

export const GlassAlertProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState({ title: "", message: "", type: "info" as AlertType });
  const [resolvePromise, setResolvePromise] = useState<(() => void) | null>(null);

  const showAlert = (title: string, message: string, type: AlertType = "info") => {
    return new Promise<void>((resolve) => {
      setContent({ title, message, type });
      setIsOpen(true);
      // Auto close after delay if needed, or let caller handle it. 
      // For "game style", usually we wait? 
      // User request implies "about to sign out it will be read". 
      // Let's auto-resolve after a duration for ephemeral alerts, 
      // but for Sign Out we might want a manual trigger.
      // For now, I'll set a timeout to auto-hide as a default behavior for "toasts-replacement".
      setTimeout(() => {
        setIsOpen(false);
        resolve();
      }, 2500);
      setResolvePromise(() => resolve);
    });
  };

  const hideAlert = () => {
    setIsOpen(false);
    if (resolvePromise) resolvePromise();
  };

  const getTheme = (type: AlertType) => {
    switch (type) {
      case "error": return {
        icon: AlertOctagon,
        color: "text-red-500",
        gradient: "from-red-600/20 to-rose-900/40",
        border: "border-red-500/30",
        glow: "shadow-red-500/20"
      };
      case "success": return {
        icon: CheckCircle2,
        color: "text-emerald-500",
        gradient: "from-emerald-600/20 to-teal-900/40",
        border: "border-emerald-500/30",
        glow: "shadow-emerald-500/20"
      };
      case "warning": return {
        icon: AlertTriangle,
        color: "text-amber-500",
        gradient: "from-amber-600/20 to-orange-900/40",
        border: "border-amber-500/30",
        glow: "shadow-amber-500/20"
      };
      default: return {
        icon: Terminal,
        color: "text-blue-500",
        gradient: "from-blue-600/20 to-indigo-900/40",
        border: "border-blue-500/30",
        glow: "shadow-blue-500/20"
      };
    }
  }

  const theme = getTheme(content.type);
  const Icon = theme.icon;

  return (
    <GlassAlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className={cn(
                "relative w-full max-w-md overflow-hidden rounded-3xl border backdrop-blur-2xl shadow-2xl",
                theme.border,
                "bg-[#0a0a0f]/80"
              )}
            >
              {/* Dynamic Gradient Background */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", theme.gradient)} />

              {/* Noise Texture */}
              <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay pointer-events-none" />

              <div className="relative p-8 flex flex-col items-center text-center">

                {/* Icon Ring */}
                <div className={cn(
                  "mb-6 p-4 rounded-full border bg-white/5 backdrop-blur-xl relative",
                  theme.border,
                  theme.glow,
                  "shadow-[0_0_30px_-5px]"
                )}>
                  <Icon className={cn("w-10 h-10", theme.color)} strokeWidth={1.5} />
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  {content.title}
                </h2>

                <p className="text-white/70 text-[15px] leading-relaxed mb-6 max-w-[90%]">
                  {content.message}
                </p>

                {/* Loading Bar / Timer Indicator (Visual only) */}
                <div className="h-1 w-24 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5, ease: "linear" }}
                    className={cn("h-full", theme.color.replace('text-', 'bg-'))}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassAlertContext.Provider>
  );
};