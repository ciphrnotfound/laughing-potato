"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Command,
  Sparkles,
  Cpu,
  Share2,
  ShieldCheck,
  Workflow,
  Radar,
  Globe,
  Boxes,
} from "lucide-react";

const featureGroups = [
  {
    title: "Deploy autonomous swarms in minutes",
    description:
      "Design, train, and launch orchestrated AI teams without touching infrastructure. Bothive handles scaling, routing, and observability for you.",
    icon: Command,
  },
  {
    title: "Composable workflows",
    description:
      "Drag intelligent macros into place to automate research, content, outreach, and analysis. Pipe outputs between agents with one click.",
    icon: Workflow,
  },
  {
    title: "Realtime co-pilot",
    description:
      "Tap into your swarm live. Inject instructions, override decisions, or ask for ad-hoc summaries mid-run—all from a single console.",
    icon: Sparkles,
  },
  {
    title: "Shared memory mesh",
    description:
      "Agents sync context automatically. Reference customer conversations, product updates, or market shifts across your entire hive.",
    icon: Boxes,
  },
  {
    title: "Enterprise-grade guardrails",
    description:
      "Role-based access, audit logs, and deterministic fallbacks keep every action reviewable while maintaining velocity.",
    icon: ShieldCheck,
  },
  {
    title: "Native integrations",
    description:
      "Connect the tools you already rely on: Notion, Slack, Hubspot, GitHub, Airtable, and custom webhooks ship out of the box.",
    icon: Share2,
  },
  {
    title: "Observability from day one",
    description:
      "Track success metrics, latency, and qualitative feedback with built-in dashboards—or stream events into your warehouse.",
    icon: Radar,
  },
  {
    title: "Dedicated vector intelligence",
    description:
      "Per-agent embeddings with TTL logic keep knowledge bases fresh while isolating sensitive data to the teams who need it.",
    icon: Globe,
  },
  {
    title: "GPU-accelerated brains",
    description:
      "Hybrid inference routes tasks between small distilled models and high-parameter specialists automatically to balance cost and power.",
    icon: Cpu,
  },
];

const staggerParent = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardEase = [0.16, 1, 0.3, 1] as const;

const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: cardEase } },
};

export default function Features() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-24" id="features">
      <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[#070213]/85 px-6 py-14 shadow-[0_45px_120px_rgba(7,3,22,0.65)] backdrop-blur-2xl sm:px-10 lg:px-14">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:34px_34px] opacity-15" />
          <motion.div
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(122,89,255,0.18),transparent_65%)]"
            animate={{ opacity: [0.16, 0.28, 0.18, 0.16] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(167,133,255,0.18),transparent_70%)] blur-[110px]"
            animate={{ scale: [1, 1.08, 0.96, 1], opacity: [0.6, 0.75, 0.55, 0.6] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-white/70">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C7B5FF]" />
              Platform features
            </p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl lg:text-[46px] lg:leading-[1.08]">
              Everything your autonomous organization needs, in one command center.
            </h2>
            <p className="text-sm leading-relaxed text-white/65 sm:text-base">
              Bothive wraps agent creation, workflow automation, and enterprise governance into a single minimalist surface. Scale from your first swarm to thousands of concurrent executions without rearchitecting your stack.
            </p>

            <div className="flex flex-col gap-3 text-sm text-white/65 sm:flex-row sm:items-center sm:gap-6">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#9C83FF]" />
                <span>GPU-powered inference routing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#9C83FF]" />
                <span>Audit-ready event trail</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#9C83FF]" />
                <span>99.9% uptime SLA</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:gap-4">
              <a
                href="#"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Explore product tour
              </a>
              <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-white/80 underline-offset-4 hover:text-white">
                Read the docs
              </a>
            </div>
          </div>

          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {featureGroups.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={staggerItem}
                  whileHover={{ y: -6, borderColor: "rgba(199,181,255,0.4)" }}
                  className="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0C061D]/80 p-5 transition-colors duration-200"
                >
                  <div className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,rgba(150,120,255,0.4),rgba(255,255,255,0.12),rgba(150,120,255,0.4))] opacity-70" />
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/10 text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-white/95">{feature.title}</h3>
                      <p className="text-xs leading-relaxed text-white/65">{feature.description}</p>
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
