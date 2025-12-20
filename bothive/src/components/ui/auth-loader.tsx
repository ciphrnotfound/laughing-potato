"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

const ORBIT_SIZES = [120, 156, 198];

export function AuthLoader() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const containerClass = cn(
    "fixed inset-0 z-[10000] flex items-center justify-center overflow-hidden transition-colors duration-300",
    isDark ? "bg-[#04010a] text-white" : "bg-[#eef0ff] text-[#0C1024]"
  );

  const gridLayer = cn(
    "absolute inset-0 mix-blend-soft-light",
    isDark
      ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:60px_60px]"
      : "bg-[linear-gradient(to_right,rgba(25,37,96,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(25,37,96,0.06)_1px,transparent_1px)] bg-[length:60px_60px]"
  );

  const glowLayer = cn(
    "absolute inset-0",
    isDark
      ? "bg-[radial-gradient(circle_at_center,rgba(126,86,255,0.34),transparent_70%)]"
      : "bg-[radial-gradient(circle_at_center,rgba(108,88,255,0.22),transparent_72%)]"
  );

  return (
    <div className={containerClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className={glowLayer} />
        <div className={gridLayer} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex h-[230px] w-[230px] items-center justify-center"
        aria-label="Loading Bothive"
      >
        <motion.div
          className="absolute inset-0 rounded-full border border-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        />

        <div className="absolute inset-10 rounded-[32px] bg-gradient-to-br from-white/8 via-transparent to-white/0 blur-xl" />

        {ORBIT_SIZES.map((size, index) => (
          <motion.div
            key={size}
            className="absolute rounded-full border border-white/10"
            style={{ width: size, height: size }}
            animate={{ rotate: index % 2 === 0 ? 360 : -360 }}
            transition={{ duration: 18 + index * 4, repeat: Infinity, ease: "linear" }}
          >
            <motion.span
              className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full"
              style={{
                width: 10 + index * 2,
                height: 10 + index * 2,
                background: "linear-gradient(135deg, #8C89FF 0%, #A3A0FF 100%)",
                boxShadow: "0 0 20px rgba(140,137,255,0.55)",
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3.6 + index, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        ))}

        <motion.div
          className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8C89FF] via-[#A3A0FF] to-white shadow-[0_16px_40px_rgba(124,105,255,0.35)]"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image src="/bothive-ai-logo.svg" alt="Bothive" width={32} height={32} className="h-8 w-8" />
        </motion.div>

        <motion.div
          className="absolute -bottom-16 flex flex-col items-center gap-2 text-center text-xs uppercase tracking-[0.4em]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <motion.span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-1 text-[10px] tracking-[0.5em]",
              isDark
                ? "border-white/15 bg-white/5 text-white/70"
                : "border-[#A3B1FF]/40 bg-[#F7F8FF]/80 text-[#1E2654]/70"
            )}
            animate={{ opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            BOTHIVE
          </motion.span>
          <span className={cn(isDark ? "text-white/55" : "text-[#1E2654]/65", "tracking-[0.24em]")}>Initializing swarm</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
