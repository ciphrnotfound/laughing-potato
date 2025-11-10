"use client";

import { motion } from "framer-motion";

export function AuthLoader() {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#090014]/92 backdrop-blur-sm">
      <div className="relative h-16 w-16">
        <motion.span
          className="absolute inset-0 rounded-full border border-[#6A00FF]/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-3 rounded-full border border-t-[#8F63FF] border-r-transparent border-b-transparent border-l-transparent"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-[18px] rounded-full bg-[#6A00FF]/70"
          animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
