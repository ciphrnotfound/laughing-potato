"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

// Types
type GlassAlertAction = { label: string; onClick: () => void; autoClose?: boolean; autoFocus?: boolean };

type GlassAlertProps = {
  open: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
  variant?: "error" | "info" | "success" | "warning";
  primaryAction?: GlassAlertAction;
  secondaryAction?: GlassAlertAction;
  autoClose?: number; // ms
  position?: "center" | "top-right" | "bottom-right";
  // New, optional props (non-breaking):
  id?: string; // useful when stacking multiple toasts
  ariaLabel?: string;
  disableBackdropClose?: boolean;
  closeOnEsc?: boolean;
  pauseOnHover?: boolean;
  pauseOnFocus?: boolean;
  showProgress?: boolean;
  swipeToDismiss?: boolean;
};

// Simple global registry for stacking counts per corner
const toastStackCounters = {
  "top-right": 0,
  "bottom-right": 0,
};

export default function ProfessionalAlert({
  open,
  title = "Something went wrong",
  message,
  onClose,
  variant = "error",
  primaryAction,
  secondaryAction,
  autoClose,
  position = "center",
  id,
  ariaLabel,
  disableBackdropClose = false,
  closeOnEsc = true,
  pauseOnHover = true,
  pauseOnFocus = true,
  showProgress = true,
  swipeToDismiss = true,
}: GlassAlertProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [canPortal, setCanPortal] = useState(false);

  // toast vs modal
  const toastMode = position !== "center";
  const effectiveAutoClose = autoClose ?? (toastMode ? 2600 : undefined);

  // colors/icons
  const colors = {
    error: { main: "#dc2626", light: "rgba(220,38,38,0.3)", bg: "bg-red-500/15", border: "border-red-400/30" },
    success: { main: "#16a34a", light: "rgba(22,163,74,0.28)", bg: "bg-emerald-500/15", border: "border-emerald-400/30" },
    warning: { main: "#f59e0b", light: "rgba(245,158,11,0.3)", bg: "bg-amber-500/15", border: "border-amber-400/30" },
    info: { main: "#3E4095", light: "rgba(62,64,149,0.25)", bg: "bg-indigo-500/15", border: "border-indigo-400/30" },
  } as const;

  const icons = {
    error: AlertTriangle,
    success: CheckCircle2,
    warning: AlertTriangle,
    info: Info,
  } as const;

  const tips = {
    error: "If it bleeds, we can debug it.",
    success: "Achievement unlocked: It actually worked.",
    warning: "Proceed with caution, young padawan.",
    info: "Tip: Knowledge is power. Use it wisely.",
  } as const;

  const IconComponent = icons[variant];
  const { main, light, bg, border } = colors[variant];
  const tip = tips[variant];

  // Timing/pause
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingRef = useRef<number>(effectiveAutoClose ?? 0);
  const [isPaused, setIsPaused] = useState(false);

  // Focus handling (modal)
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const primaryBtnRef = useRef<HTMLButtonElement | null>(null);

  // Swipe-to-dismiss (toast)
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  // Stacking offset (toasts)
  const stackIndex = useRef<number>(0);

  // Helpers
  const prefersReducedMotion = usePrefersReducedMotion();

  const startTimer = useCallback(() => {
    if (!effectiveAutoClose) return;
    startTimeRef.current = performance.now();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      onClose?.();
    }, remainingRef.current) as unknown as number;
  }, [effectiveAutoClose, onClose]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pauseTimer = useCallback(() => {
    if (!effectiveAutoClose) return;
    if (timerRef.current) {
      clearTimer();
      const elapsed = performance.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
  }, [effectiveAutoClose, clearTimer]);

  const resumeTimer = useCallback(() => {
    if (!effectiveAutoClose) return;
    if (!timerRef.current && remainingRef.current > 0) {
      startTimer();
    }
  }, [effectiveAutoClose, startTimer]);

  // Mount/visibility + stacking + scroll lock
  useEffect(() => {
    setCanPortal(true);
  }, []);

  useEffect(() => {
    if (!toastMode) {
      // lock body scroll for modal
      if (open) {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
          document.body.style.overflow = prev;
        };
      }
    }
  }, [open, toastMode]);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));

      // stacking for toast
      if (toastMode) {
        toastStackCounters[position] += 1;
        stackIndex.current = toastStackCounters[position];
      }

      // timers
      remainingRef.current = effectiveAutoClose ?? 0;
      if (effectiveAutoClose) {
        startTimer();
      }
    } else {
      setIsVisible(false);
      const timeout = prefersReducedMotion ? 0 : 250;
      const t = window.setTimeout(() => setIsMounted(false), timeout);
      return () => window.clearTimeout(t);
    }

    return () => {
      if (toastMode) {
        // decrement when unmounting this toast
        toastStackCounters[position] = Math.max(0, toastStackCounters[position] - 1);
      }
      clearTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Pause on hover/focus
  const onMouseEnter = () => {
    if (!toastMode || !pauseOnHover || !effectiveAutoClose) return;
    setIsPaused(true);
    pauseTimer();
  };
  const onMouseLeave = () => {
    if (!toastMode || !pauseOnHover || !effectiveAutoClose) return;
    setIsPaused(false);
    resumeTimer();
  };
  const onFocus = () => {
    if (!toastMode || !pauseOnFocus || !effectiveAutoClose) return;
    setIsPaused(true);
    pauseTimer();
  };
  const onBlur = () => {
    if (!toastMode || !pauseOnFocus || !effectiveAutoClose) return;
    setIsPaused(false);
    resumeTimer();
  };

  // ESC to close (modal + toast)
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose?.();
      }
      if (!toastMode && e.key === "Enter" && primaryAction?.onClick) {
        primaryAction.onClick();
      }
      // basic focus trap for modal
      if (!toastMode && e.key === "Tab" && dialogRef.current) {
        const focusables = getFocusable(dialogRef.current);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey && (active === first || active === dialogRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeOnEsc, onClose, primaryAction, toastMode]);

  // initial focus for modal
  useEffect(() => {
    if (!open || toastMode) return;
    const target =
      (primaryAction?.autoFocus ? primaryBtnRef.current : null) ||
      closeBtnRef.current ||
      dialogRef.current;
    target?.focus();
  }, [open, toastMode, primaryAction?.autoFocus]);

  // swipe-to-dismiss (toast only)
  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!toastMode || !swipeToDismiss) return;
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!toastMode || !swipeToDismiss) return;
    if (touchStartX.current == null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    // apply translation for feedback
    if (dialogRef.current) {
      dialogRef.current.style.transform = `translateX(${touchDeltaX.current}px)`;
      dialogRef.current.style.opacity = String(Math.max(0.3, 1 - Math.abs(touchDeltaX.current) / 200));
    }
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {
    if (!toastMode || !swipeToDismiss) return;
    const threshold = 80;
    if (Math.abs(touchDeltaX.current) > threshold) {
      onClose?.();
    } else {
      // reset
      if (dialogRef.current) {
        dialogRef.current.style.transform = "";
        dialogRef.current.style.opacity = "";
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  // classes per mode/position
  const containerClasses = useMemo(() => {
    if (toastMode) {
      const base = "pointer-events-none fixed inset-0 flex p-3 sm:p-6";
      const align =
        position === "top-right"
          ? "items-start justify-end"
          : "items-end justify-end";
      return `${base} ${align}`;
    }
    return "fixed inset-0 grid place-items-center p-3 pb-[max(1rem,env(safe-area-inset-bottom))]";
  }, [toastMode, position]);

  // motion styles
  const enterClass = prefersReducedMotion
    ? "opacity-100"
    : toastMode
    ? "translate-y-0 opacity-100"
    : "scale-100 opacity-100";
  const exitClass = prefersReducedMotion
    ? "opacity-0"
    : toastMode
    ? "translate-y-2 opacity-0"
    : "scale-95 opacity-0";

  const stackOffset = toastMode ? (stackIndex.current - 1) * 12 : 0; // px gap for stacking
  const toastPositionStyle =
    toastMode && position === "top-right"
      ? { marginTop: `${stackOffset}px` }
      : toastMode
      ? { marginBottom: `${stackOffset}px` }
      : undefined;

  // ARIA
  const role = toastMode ? "status" : "alertdialog";
  const labelledById = useMemo(() => (id ? `${id}-title` : undefined), [id]);
  const describedById = useMemo(() => (id ? `${id}-desc` : undefined), [id]);

  if (!isMounted) return null;

  const content = (
    <div className={`z-[9999] ${containerClasses}`} aria-live={toastMode ? "polite" : undefined}>
      {/* Backdrop for modal */}
      {!toastMode && (
        <>
          <div
            ref={backdropRef}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            style={{ opacity: isVisible ? 1 : 0 }}
            onClick={() => {
              if (!disableBackdropClose) onClose?.();
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(1200px 600px at 50% -10%, ${light}, transparent 60%)`,
              opacity: isVisible ? 1 : 0,
              transition: "opacity 300ms",
            }}
          />
        </>
      )}

      {/* Card */}
      <div
        ref={dialogRef}
        role={role as any}
        aria-modal={!toastMode || undefined}
        aria-label={ariaLabel}
        aria-labelledby={labelledById}
        aria-describedby={describedById}
        tabIndex={toastMode ? -1 : 0}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-2xl border ${border} ${bg} p-4 sm:p-5 text-white ${
          toastMode ? "shadow-xl backdrop-blur supports-[backdrop-filter]:backdrop-blur-md" : "shadow-2xl backdrop-blur-md mx-4"
        } transition-all duration-300 ${isVisible ? enterClass : exitClass}`}
        style={{
          boxShadow: toastMode ? `0 12px 40px -12px ${main}55` : `0 20px 60px -10px ${main}88`,
          ...(toastPositionStyle || {}),
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 grid h-9 w-9 place-items-center rounded-lg"
            style={{ background: `linear-gradient(135deg, ${main}, #5a57d9)` }}
          >
            <IconComponent className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id={labelledById} className="truncate text-lg font-semibold" style={{ color: main }}>
              {title}
            </h3>
            {message && (
              <p id={describedById} className="mt-1 text-sm/5 text-white/80">
                {message}
              </p>
            )}
            {!toastMode && <p className="mt-2 text-xs text-white/70">{tip}</p>}

            {(primaryAction || secondaryAction) && (
              <div className="mt-4 flex gap-2">
                {primaryAction && (
                  <button
                    ref={primaryBtnRef}
                    onClick={() => {
                      primaryAction.onClick();
                      if (primaryAction.autoClose) onClose?.();
                    }}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white/20 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                    style={{ color: main }}
                  >
                    {primaryAction.label}
                  </button>
                )}
                {secondaryAction && (
                  <button
                    onClick={() => {
                      secondaryAction.onClick();
                      if (secondaryAction.autoClose) onClose?.();
                    }}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border border-white/20 hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    {secondaryAction.label}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {onClose && (
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
            aria-label="Close alert"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}

        {/* Progress bar */}
        {toastMode && showProgress && effectiveAutoClose ? (
          <ProgressBar
            color={main}
            duration={effectiveAutoClose}
            running={isVisible && !isPaused}
            key={`${id ?? "alert"}-${effectiveAutoClose}`}
          />
        ) : null}
      </div>
    </div>
  );

  if (canPortal && typeof window !== "undefined") {
    return createPortal(content, document.body);
  }
  return content;
}

// Utilities

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

function getFocusable(root: HTMLElement): HTMLElement[] {
  const selectors = [
    "a[href]",
    "area[href]",
    "button:not([disabled])",
    "input:not([disabled]):not([type='hidden'])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "iframe",
    "summary",
    "[contenteditable='true']",
    "[tabindex]:not([tabindex='-1'])",
  ];
  const elements = Array.from(root.querySelectorAll<HTMLElement>(selectors.join(",")));
  // Filter out hidden
  return elements.filter((el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length));
}

// ProgressBar component keeps animation in sync with pause/resume
function ProgressBar({ color, duration, running }: { color: string; duration: number; running: boolean }) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const step = useCallback(
    function stepFrame(ts: number) {
      if (!running) return;
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(stepFrame);
      }
    },
    [duration, running]
  );

  useEffect(() => {
    if (running) {
      setProgress(0);
      rafRef.current = requestAnimationFrame(step);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, step]);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = `${(1 - progress) * 100}%`;
    }
  }, [progress]);

  return (
    <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-transparent">
      <div ref={barRef} className="h-full" style={{ background: color, width: "100%", transition: "none" }} />
    </div>
  );
}