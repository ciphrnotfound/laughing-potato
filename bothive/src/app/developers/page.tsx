"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Navbar2 from "@/components/Navbar2";

const resources = [
  {
    title: "Bothive API",
    description: "Low-latency endpoints for orchestrating missions, managing bot state, and streaming conversation traces.",
    cta: "Read API reference",
    href: "#",
  },
  {
    title: "SDKs & starters",
    description: "TypeScript, Python, and Swift kits with typed agents, mission builders, and testing harnesses.",
    cta: "Browse SDKs",
    href: "#",
  },
  {
    title: "CLI & workflows",
    description: "Provision sandboxes, trigger deployments, and lint agent blueprints straight from your terminal.",
    cta: "Install the CLI",
    href: "#",
  },
];

const panels = [
  {
    heading: "Ship faster with mission blueprints",
    body: "Pull verified templates for support triage, outreach pods, and research copilots. Tailor them, then push live with integrated approvals.",
  },
  {
    heading: "Deep observability",
    body: "Tap structured traces, latency heatmaps, and pheromone logs so you can tune behaviours before production escalations do it for you.",
  },
  {
    heading: "Secure by default",
    body: "Granular secrets, signed actions, and environment isolation keep each hive partition compliant across teams.",
  },
];

const launchChecklist = [
  "Define mission objectives and guardrails",
  "Configure data sources, actions, and webhooks",
  "Run sandbox load tests with synthetic traffic",
  "Capture telemetry benchmarks and review QA traces",
  "Promote blueprint to production and monitor pheromone scores",
];

const ecosystemHighlights = [
  {
    label: "CLI accelerators",
    description: "Spin new missions, inspect logs, and diff blueprints straight from your terminal workflows.",
  },
  {
    label: "Observability hooks",
    description: "Export structured telemetry into Datadog, Honeycomb, or OpenTelemetry pipelines.",
  },
  {
    label: "Partner marketplace",
    description: "Discover prebuilt actions, connectors, and compliance packs curated by the Bothive partner network.",
  },
];

export default function DevelopersPage() {
  return (
    <main className="relative min-h-screen bg-[#06070a] text-white">
      <Navbar2 />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(110,31,255,0.3),transparent_55%),radial-gradient(circle_at_82%_12%,rgba(147,85,255,0.28),transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,5,16,0.55),rgba(6,7,10,0.95))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-size:48px_48px] [background-image:linear-gradient(to_right,rgba(123,67,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(123,67,255,0.14)_1px,transparent_1px)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-28">
        <header className="space-y-6 text-center sm:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#7b3dff3d] bg-[#6a00ff1a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/75">
            Developer central
          </p>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold sm:text-4xl md:text-[2.7rem] md:leading-tight">
              Build, orchestrate, and deploy Bothive agents with precision
            </h1>
            <p className="max-w-3xl text-sm text-white/70">
              Tooling, docs, and starter kits that accelerate everything from prototyping micro-missions to operating enterprise-scale hives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6a00ff] via-[#854dff] to-[#b18dff] px-5 py-3 text-sm font-semibold text-white transition hover:shadow-[0_12px_32px_rgba(110,31,255,0.35)]"
            >
              View quickstart guide
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border border-[#7b3dff33] bg-[#140b26] px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-[#9f6bff66] hover:text-white"
            >
              Join the developer Slack
            </Link>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource, index) => (
            <motion.article
              key={resource.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group flex h-full flex-col gap-4 rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#150a29] via-[#0c0618] to-[#08040f] p-6 transition hover:border-[#9f6bff55] hover:shadow-[0_18px_45px_rgba(110,31,255,0.28)]"
            >
              <div className="flex flex-1 flex-col gap-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/65">Resource</p>
                <h2 className="text-lg font-semibold text-white">{resource.title}</h2>
                <p className="text-sm text-white/65">{resource.description}</p>
                <div className="mt-auto pt-4 text-sm text-[#c9b1ff]">
                  <span className="inline-flex items-center gap-1">
                    {resource.cta}
                    <span className="h-1.5 w-1.5 rounded-full bg-[#c9b1ff]" />
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          {panels.map((panel, index) => (
            <motion.div
              key={panel.heading}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: 0.1 + index * 0.08 }}
              className="flex flex-col gap-3 rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#130a27] via-[#0b0516] to-[#08040f] p-6"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Why developers choose Bothive</p>
              <h3 className="text-lg font-semibold text-white">{panel.heading}</h3>
              <p className="text-sm text-white/65">{panel.body}</p>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-6 rounded-2xl border border-[#6a00ff1f] bg-gradient-to-br from-[#140a28] via-[#0c0617] to-[#08040f] p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Launch checklist</p>
            <h2 className="text-xl font-semibold text-white">Operational guardrails before you go live</h2>
            <ul className="space-y-3 text-sm text-white/70">
              {launchChecklist.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-xl border border-[#6a00ff24] bg-[#0f071f] p-4">
                  <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#c9b1ff]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4 rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#15092b] via-[#0c0618] to-[#08040f] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">SDK deep dives</p>
            <p className="text-sm text-white/65">
              Explore advanced recipes for multi-agent handoffs, deterministic evaluations, and mission failover patterns. Each notebook
              ships with runnable examples and guardrail best practices.
            </p>
            <Link
              href="#"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-[#6a00ff] via-[#854dff] to-[#b18dff] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[0_12px_32px_rgba(110,31,255,0.38)]"
            >
              Open the notebook library
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-6 rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#170a2f] via-[#0e0619] to-[#08050f] p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">Launch your first hive</p>
            <h2 className="text-2xl font-semibold text-white">Get started with the Bothive developer sandbox</h2>
            <p className="text-sm text-white/65">
              Spin up a private workspace, connect your data sources, and deploy agents with simulated traffic before you go live.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6a00ff] via-[#7f3dff] to-[#b18dff] px-5 py-3 text-sm font-semibold text-white transition hover:shadow-[0_12px_32px_rgba(110,31,255,0.4)]"
            >
              Launch sandbox
            </Link>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-xl border border-[#7b3dff33] bg-[#140b26] px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-[#9f6bff66] hover:text-white"
            >
              View roadmap
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-[#6a00ff1f] bg-gradient-to-br from-[#140a29] via-[#0b0516] to-[#08040f] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Ecosystem</p>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {ecosystemHighlights.map((highlight) => (
              <div key={highlight.label} className="flex flex-col gap-2 rounded-xl border border-[#6a00ff24] bg-[#0f071f] p-5">
                <h3 className="text-base font-semibold text-white">{highlight.label}</h3>
                <p className="text-sm text-white/65">{highlight.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
