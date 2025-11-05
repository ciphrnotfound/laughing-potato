"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  PieChart,
  Zap,
  FileText,
  Target,
  Bell,
  Link as LinkIcon,
  Bolt,
  Columns,
} from "lucide-react";

const items = [
  { title: "User-friendly dashboard", desc: "Perform comprehensive audits and optimizations with a single click.", icon: BarChart2 },
  { title: "Visual reports", desc: "Visual insights into your site’s performance.", icon: PieChart },
  { title: "Smart Content Generator", desc: "Automatic suggestions to help you write better content.", icon: Zap },
  { title: "Content evaluation", desc: "Simple corrections for immediate improvements.", icon: FileText },
  { title: "Goal setting", desc: "Helps you set and achieve performance goals with guided assistance.", icon: Target },
  { title: "Automated alerts", desc: "Automatic notifications about your project health, including quick fixes.", icon: Bell },
  { title: "Link Management Wizard", desc: "Guides you through creating and managing links.", icon: LinkIcon },
  { title: "One-click improvements", desc: "Perform common improvements with a single click.", icon: Bolt },
  { title: "Competitor reports", desc: "Provides insights into competitors’ keyword strategies and ranking.", icon: Columns },
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariant = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function Features() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#120c1d] via-[#0e0a15] to-[#0a0a0a] p-8 md:p-12">
        {/* subtle grid overlay + purple glow */}
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)],[background-size:28px_28px]" />
        <div className="pointer-events-none absolute -inset-12 rounded-4xl bg-[radial-gradient(1200px_600px_at_20%_20%,rgba(139,92,246,0.28),transparent_60%)]" />

        <div className="relative z-10 grid md:grid-cols-3 gap-8 items-start">
          <div className="pr-4">
            <h2 className="text-4xl max-w-md md:text-6xl lg:text-7xl  leading-tight">Elevate your performance.</h2>
            <p className="mt-6 text-white/70 max-w-lg">Powerful tools and clear visualizations designed to make site performance and workflows approachable for teams of any size.</p>
          </div>

          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="md:col-span-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={itemVariant}
                  whileHover={{ translateY: -6, boxShadow: '0 10px 30px rgba(99,102,241,0.12)' }}
                  className="space-y-3 p-4 rounded-xl transition-transform will-change-transform"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-white/6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className=" text-white">{f.title}</h3>
                      <p className="mt-2 text-sm text-white/70">{f.desc}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
