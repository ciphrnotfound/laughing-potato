"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle } from "lucide-react";

const futuristicMessages = [
  "RESOURCE_NOT_FOUND: Target path does not exist in current dimension",
  "QUANTUM_ENTANGLEMENT_FAILURE: Requested endpoint not synchronized",
  "NEURAL_LINK_DISCONNECTED: Communication pathway terminated",
  "TIMELINE_BRANCH_NOT_FOUND: Requested state does not exist in multiverse",
  "HOLOGRAM_PROJECTION_FAILED: Virtual resource unrenderable",
  "CYBERSPACE_NODE_MISSING: Target location not mapped in network topology",
  "DIMENSIONAL_DRIFT_DETECTED: Requested coordinates outside known space",
  "SYSTEM_MEMORY_CORRUPTION: Resource allocation failed",
  "NODE_ORPHANED: Requested resource has been deallocated",
  "ROUTING_TABLE_EXCEPTION: Path resolution failed at network layer",
];

export default function NotFound() {
  const randomMessage =
    futuristicMessages[Math.floor(Math.random() * futuristicMessages.length)];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 sm:px-6 lg:px-8">
      {/* Grid background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Subtle gradient overlay */}
      <div className="pointer-events-none fixed inset-0 bg-linear-to-b from-purple-950/10 via-transparent to-black" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl text-center">
        {/* Error code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 sm:mb-12"
        >
          <div className="relative inline-block">
            <motion.h1
              className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-linear-to-b from-white/20 via-white/10 to-transparent leading-none"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              404
            </motion.h1>
            {/* Subtle glow */}
            <div className="absolute inset-0 text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black text-purple-500/5 blur-2xl">
              404
            </div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 sm:mb-12 space-y-4"
        >
          <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
              Resource Not Found
            </h2>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
            <p className="font-mono text-xs sm:text-sm md:text-base text-purple-300/80 mb-2">
              ERROR_CODE: 404
            </p>
            <p className="font-mono text-xs sm:text-sm text-white/60 wrap-break-word">
              {randomMessage}
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/"
            className="group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/20"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Return to Base</span>
          </Link>

          <Link
            href="/features"
            className="group flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-500/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-purple-500/20 hover:border-purple-500/50"
          >
            <span>Explore Features</span>
          </Link>
        </motion.div>

        {/* System info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 sm:mt-12 text-xs text-white/40 font-mono space-y-1"
        >
          <p>SYSTEM_STATUS: OPERATIONAL</p>
          <p>TIMESTAMP: {new Date().toISOString()}</p>
        </motion.div>
      </div>
    </div>
  );
}
