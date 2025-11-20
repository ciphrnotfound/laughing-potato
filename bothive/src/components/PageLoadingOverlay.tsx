"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PageLoadingOverlayProps {
  show: boolean;
  label?: string;
}

export function PageLoadingOverlay({ show, label }: PageLoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative flex min-w-[220px] max-w-xs flex-col items-center gap-3 rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-transparent px-6 py-5 text-xs text-white shadow-[0_32px_120px_rgba(15,23,42,0.9)]"
      >
        <div className="pointer-events-none absolute -inset-16 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.35),transparent_60%)] opacity-80" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10/50" />

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full bg-white/15 blur" />
            <div className="relative grid h-10 w-10 place-items-center rounded-full border border-white/30 bg-black/60">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-white/60">Preparing surface</p>
            <p className="text-[11px] text-white/65">
              {label ?? "Syncing your workspace and agents. This usually takes a moment."}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
