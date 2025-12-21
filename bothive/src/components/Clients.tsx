"use client";

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { Marquee } from "./ui/Marquee";

const testimonials = [
  {
    name: "Alex Chen",
    handle: "@alexchen",
    quote: "This is exactly what we needed. Simple, fast, and it just works.",
  },
  {
    name: "Sarah Kim",
    handle: "@sarahkim",
    quote: "Deployed our first agents in under an hour. Incredible experience.",
  },
  {
    name: "Michael Park",
    handle: "@mpark",
    quote: "The best developer experience I've had in years.",
  },
  {
    name: "Emma Wilson",
    handle: "@emmaw",
    quote: "Finally, AI automation that doesn't require a PhD to set up.",
  },
  {
    name: "David Lee",
    handle: "@dlee",
    quote: "Our team productivity increased 10x. Not exaggerating.",
  },
  {
    name: "Jessica Torres",
    handle: "@jtorres",
    quote: "The workflow builder is intuitive and powerful. Love it.",
  },
];

export default function Clients() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      className="relative py-24 overflow-hidden transition-colors duration-500 bg-[#f5f5fa] dark:bg-[#08080c]"
    >
      {/* Animated border */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="h-full w-1/3 bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"
          animate={{ x: ["-100%", "400%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-[150px]"
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center text-sm text-black/40 dark:text-white/40 uppercase tracking-[0.2em] mb-12"
        >
          What developers are saying
        </motion.p>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#f5f5fa] dark:from-[#08080c] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#f5f5fa] dark:from-[#08080c] to-transparent z-10 pointer-events-none" />

        <Marquee
          items={testimonials}
          pauseOnHover
          speed="slow"
          renderItem={(item) => (
            <motion.div
              className="relative w-80 p-6 rounded-2xl border overflow-hidden group
                border-black/[0.06] bg-white/90 shadow-sm
                dark:border-white/[0.04] dark:bg-gradient-to-b dark:from-white/[0.03] dark:to-transparent
              "
              whileHover={{
                y: -4,
                borderColor: "rgba(139,92,246,0.2)",
                transition: { duration: 0.2 }
              }}
            >
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              <p className="relative z-10 text-sm leading-relaxed mb-4 transition-colors
                text-black/60 group-hover:text-black/80
                dark:text-white/60 dark:group-hover:text-white/80
              ">
                "{item.quote}"
              </p>

              <div className="relative z-10 flex items-center gap-3">
                {/* Animated avatar ring */}
                <motion.div
                  className="relative w-10 h-10 rounded-full overflow-hidden"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "conic-gradient(from 0deg, rgba(139,92,246,0.3), transparent, rgba(139,92,246,0.3))",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-[#15131d] dark:to-[#0d0d15] flex items-center justify-center">
                    <span className="text-sm font-medium text-zinc-700 group-hover:text-violet-600 dark:text-white/50 dark:group-hover:text-violet-400 transition-colors">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                </motion.div>

                <div>
                  <p className="text-sm font-medium transition-colors text-black/80 group-hover:text-black dark:text-white/80 dark:group-hover:text-white">
                    {item.name}
                  </p>
                  <p className="text-xs text-black/40 dark:text-white/30">
                    {item.handle}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        />
      </div>
    </section>
  );
}
