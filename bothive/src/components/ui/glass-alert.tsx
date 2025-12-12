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

const variantStyles: Record<
  AlertVariant,
  {
    icon: typeof CheckCircle2;
    iconClass: string;
    glow: string;
    gradient: string;
    badgeBg: string;
    badgeText: string;
    label: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-200",
    glow: "rgba(16,185,129,0.45)",
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.16), rgba(59,7,100,0.8))",
    badgeBg: "bg-emerald-500/15 border-emerald-300/40",
    badgeText: "text-emerald-200",
    label: "Deployment ready",
  },
  error: {
    icon: XCircle,
    iconClass: "text-rose-200",
    glow: "rgba(244,63,94,0.45)",
    gradient: "linear-gradient(135deg, rgba(244,63,94,0.18), rgba(44,8,36,0.9))",
    badgeBg: "bg-rose-500/15 border-rose-300/40",
    badgeText: "text-rose-200",
    label: "Action required",
  },
  info: {
    icon: Info,
    iconClass: "text-indigo-200",
    glow: "rgba(99,102,241,0.45)",
    gradient: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(8,8,30,0.95))",
    badgeBg: "bg-indigo-500/15 border-indigo-300/40",
    badgeText: "text-indigo-200",
    label: "System notice",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-200",
    glow: "rgba(245,158,11,0.45)",
    gradient: "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(40,26,3,0.92))",
    badgeBg: "bg-amber-500/15 border-amber-300/40",
    badgeText: "text-amber-200",
    label: "Heads up",
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

  const { icon: Icon, iconClass, glow, gradient, badgeBg, badgeText, label } = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" aria-hidden="true" />
      <div
        className="relative z-10 w-full max-w-xl animate-in fade-in zoom-in-95"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[30px] border border-white/12 bg-[#050512]/85 shadow-[0_55px_180px_rgba(3,0,20,0.9)] backdrop-blur-3xl"
          style={{ boxShadow: `0 50px 140px -36px ${glow}` }}
        />
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[30px]">
          <div className="absolute inset-0 opacity-75" style={{ background: gradient }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(180,140,255,0.25),transparent_65%)]" />
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>

        <div className="relative z-10 rounded-[30px] px-7 py-6 text-white sm:px-10 sm:py-9">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[11px] uppercase tracking-[0.35em]",
                  badgeBg,
                  badgeText
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> {label}
              </span>
            </div>
            <button
              onClick={() => {
                if (!isControlled) {
                  setInternalVisible(false);
                }
                onClose?.();
              }}
              className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:border-white/30 hover:text-white"
              aria-label="Close alert"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-6 text-left">
            <div className="flex items-start gap-5">
              <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/5">
                <span className="absolute inset-0 rounded-2xl bg-white/5" />
                <Icon className={cn("relative z-10 h-6 w-6", iconClass)} />
              </span>
              <div className="min-w-0 space-y-3">
                {title ? <p className="text-lg font-semibold text-white/95">{title}</p> : null}
                {message ? <div className="text-base leading-relaxed text-white/75">{message}</div> : null}
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5/10 p-4 text-xs text-white/60 backdrop-blur">
              <p className="font-medium uppercase tracking-[0.3em] text-white/50">Control Room</p>
              <p className="mt-2 leading-relaxed text-white/70">
                Need backup? Relay this reference to the Bothive crew and we&apos;ll help course-correct in real time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}