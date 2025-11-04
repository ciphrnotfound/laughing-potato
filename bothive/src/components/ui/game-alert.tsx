"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

interface GameAlertProps {
  type?: AlertType;
  title: string;
  message: string;
  show?: boolean;
  onClose?: () => void;
}

export function GameAlert({ type = "success", title, message, show = true, onClose }: GameAlertProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    error: <XCircle className="h-5 w-5 text-rose-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    info: <Info className="h-5 w-5 text-blue-400" />,
  };

  const styles = {
    success: "bg-emerald-500/10 border-emerald-500/20",
    error: "bg-rose-500/10 border-rose-500/20",
    warning: "bg-amber-500/10 border-amber-500/20",
    info: "bg-blue-500/10 border-blue-500/20",
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-4 top-4 z-50 w-full max-w-md sm:max-w-sm"
        >
          <div
            role="alert"
            className={cn(
              "relative rounded-lg border p-4 shadow-2xl backdrop-blur-xl",
              styles[type]
            )}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0">{icons[type]}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm sm:text-base">{title}</h4>
                <p className="mt-1 text-sm text-white/70">{message}</p>
              </div>
              {onClose && (
                <button
                  onClick={() => {
                    setIsVisible(false);
                    onClose();
                  }}
                  className="shrink-0 rounded p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
