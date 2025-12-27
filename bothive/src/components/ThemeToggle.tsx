"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(() => typeof window !== "undefined");

  if (!mounted) {
    return (
      <div className="h-12 w-12 rounded-xl bg-neutral-200/50 dark:bg-white/5 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="group relative inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-all duration-300 overflow-hidden
        border-neutral-200 bg-white text-neutral-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-600 shadow-sm
        dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:border-violet-500/50 dark:hover:bg-violet-500/10 dark:hover:text-white
        focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
    >
      {/* Animated glow background */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: isDark
            ? "radial-gradient(circle at center, rgba(139, 92, 246, 0.15), transparent 70%)"
            : "radial-gradient(circle at center, rgba(251, 191, 36, 0.15), transparent 70%)"
        }}
      />

      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </div>

      {/* Icon container with AnimatePresence for smooth transitions */}
      <div className="relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.svg
              key="sun"
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </motion.svg>
          ) : (
            <motion.svg
              key="moon"
              initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}
