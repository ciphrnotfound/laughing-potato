"use client";

import { CheckCircle2, XCircle, X, Info, AlertTriangle } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "success" | "error" | "info" | "warning";

interface GlassAlertProps {
  variant?: AlertVariant;
  title?: string;
  message?: ReactNode;
  onClose?: () => void;
  show?: boolean;
  open?: boolean;
  autoClose?: number;
  durationMs?: number;
}

const variantStyles: Record<AlertVariant, { icon: typeof CheckCircle2; iconClass: string; glow: string; gradient: string }> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-300",
    glow: "rgba(34,197,94,0.42)",
    gradient: "linear-gradient(135deg, rgba(34,197,94,0.28), rgba(124,58,237,0.22))",
  },
  error: {
    icon: XCircle,
    iconClass: "text-rose-300",
    glow: "rgba(244,63,94,0.42)",
    gradient: "linear-gradient(135deg, rgba(244,63,94,0.26), rgba(124,58,237,0.22))",
  },
  info: {
    icon: Info,
    iconClass: "text-indigo-300",
    glow: "rgba(99,102,241,0.42)",
    gradient: "linear-gradient(135deg, rgba(99,102,241,0.28), rgba(124,58,237,0.22))",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-300",
    glow: "rgba(245,158,11,0.42)",
    gradient: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(124,58,237,0.22))",
  },
};

export function ProfessionalAlert({
  variant = "info",
  title,
  message,
  onClose,
  show,
  open,
  autoClose,
  durationMs = 5000,
}: GlassAlertProps) {
  const initialVisibility = show ?? open ?? true;
  const isControlled = show !== undefined || open !== undefined;
  const [internalVisible, setInternalVisible] = useState(initialVisibility);
  const derivedVisibility = show ?? open;
  const currentVisible = isControlled ? (derivedVisibility ?? false) : internalVisible;
  const effectiveDuration = autoClose ?? durationMs;

  useEffect(() => {
    if (currentVisible && (effectiveDuration ?? 0) > 0) {
      const timer = setTimeout(() => {
        if (!isControlled) {
          setInternalVisible(false);
        }
        onClose?.();
      }, effectiveDuration);
      return () => clearTimeout(timer);
    }
  }, [currentVisible, effectiveDuration, isControlled, onClose]);

  if (!currentVisible) return null;

  const { icon: Icon, iconClass, glow, gradient } = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-md" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95">
        <div
          className="pointer-events-none absolute inset-0 rounded-[26px] border border-white/12 bg-[#090815]/85 shadow-[0_40px_120px_rgba(109,40,217,0.32)] backdrop-blur-2xl"
          style={{ boxShadow: `0 48px 140px -40px ${glow}` }}
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[26px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(203,181,255,0.18),transparent_68%)]" />
          <div className="absolute inset-0" style={{ background: gradient, opacity: 0.7 }} />
        </div>

        <div className="relative z-10 rounded-[26px] px-6 py-6 text-white sm:px-8 sm:py-8">
          <button
            onClick={() => {
              if (!isControlled) {
                setInternalVisible(false);
              }
              onClose?.();
            }}
            className="absolute right-5 top-5 rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close alert"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/8" style={{ background: gradient }}>
                <Icon className={cn("h-5 w-5", iconClass)} />
              </span>
              <div className="min-w-0 space-y-2 text-left">
                {title ? <p className="text-base font-semibold text-white/95">{title}</p> : null}
                {message ? <div className="text-sm text-white/75">{message}</div> : null}
              </div>
            </div>

            <div className="h-px w-full bg-white/10" />

            <div className="flex flex-col gap-2 text-xs text-white/60">
              <span>Need anything else? Ping the Bothive crew and we’ll help you deploy faster.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}