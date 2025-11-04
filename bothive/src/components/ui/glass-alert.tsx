"use client";

import { CheckCircle2, XCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GlassAlertProps {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
  show?: boolean;
}

export function GlassAlert({ type, message, onClose, show = true }: GlassAlertProps) {
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

  if (!isVisible) return null;

  return (
    <div
      role="alert"
      className={cn(
        "fixed right-4 top-4 z-50 flex items-center gap-3 rounded-lg border border-white/10 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-xl transition-all duration-500",
        type === "success" ? "bg-emerald-500/10" : "bg-rose-500/10",
        "animate-in fade-in slide-in-from-top"
      )}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      ) : (
        <XCircle className="h-5 w-5 text-rose-400" />
      )}
      <p>{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        className="ml-2 rounded-full p-1 hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}