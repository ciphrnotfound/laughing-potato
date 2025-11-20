"use client";

import React from "react";
import { motion } from "framer-motion";

import { useTheme } from "@/lib/theme-context";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const nextModeLabel = theme === "dark" ? "light" : "dark";

  const renderIcon = () => {
    if (theme === "dark") {
      return (
        <motion.svg
          key="sun"
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3 }}
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36 6.36-1.42-1.42M7.05 6.05 5.64 4.64M18.36 5.64 16.95 7.05M6.34 17.66l-1.41 1.41"
          />
        </motion.svg>
      );
    }

    return (
      <motion.svg
        key="moon"
        initial={{ rotate: 180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: -180, opacity: 0 }}
        transition={{ duration: 0.3 }}
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        />
      </motion.svg>
    );
  };

  return (
    <motion.button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      title={`Switch to ${nextModeLabel} mode`}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/12 bg-white/5 text-white/80 transition-all hover:text-white hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]/35"
    >
      {/* Animated background */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#7c3aed]/15 to-transparent transform -skew-x-12 group-hover:translate-x-full transition-transform duration-700" />
      </div>

      <div className="relative">{renderIcon()}</div>
    </motion.button>
  );
}
