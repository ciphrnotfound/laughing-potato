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
    <section ref={ref} className="relative py-24 bg-[#08080c] overflow-hidden">
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
          className="text-center text-sm text-white/40 uppercase tracking-[0.2em] mb-12"
        >
          What developers are saying
        </motion.p>
      </div>

      {/* Marquee */}
      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-[#08080c] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-[#08080c] to-transparent z-10 pointer-events-none" />

        <Marquee
          items={testimonials}
          pauseOnHover
          speed="slow"
          renderItem={(item) => (
            <motion.div
              className="relative w-80 p-6 rounded-2xl border border-white/[0.04] bg-gradient-to-b from-white/[0.03] to-transparent overflow-hidden group"
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

              <p className="relative z-10 text-sm text-white/60 leading-relaxed mb-4 group-hover:text-white/80 transition-colors">
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
                  <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-[#15131d] to-[#0d0d15] flex items-center justify-center">
                    <span className="text-sm font-medium text-white/50 group-hover:text-violet-400 transition-colors">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                </motion.div>

                <div>
                  <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{item.name}</p>
                  <p className="text-xs text-white/30">{item.handle}</p>
                </div>
              </div>
            </motion.div>
          )}
        />
      </div>
    </section>
  );
}
