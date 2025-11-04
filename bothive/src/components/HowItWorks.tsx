"use client";

import React from "react";
import Link from "next/link";

const items = [
  {
    title: "Agent Builder",
    desc:
      "Create agents via no‑code blocks or SDK. Define tools, memory, and guardrails.",
    cta: { label: "Open Builder", href: "/features" },
  },
  {
    title: "Marketplace",
    desc:
    "Discover, test, and integrate pre‑built agents. Monetize your own with one click.",
    cta: { label: "Browse agents", href: "/blog" },
  },
  {
    title: "Orchestrator",
    desc:
      "Visual dashboard to drag, connect, and run multi‑agent flows in real time.",
    cta: { label: "Design a flow", href: "/features" },
  },
  {
    title: "Memory",
    desc:
      "Agents remember behavior, decisions, and artifacts across projects for compounding gains.",
    cta: { label: "See how", href: "/about" },
  },
  {
    title: "Integrations",
    desc:
      "Connect Slack, Notion, Discord and more to trigger, observe, and automate.",
    cta: { label: "Connect apps", href: "/contact" },
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative mx-auto max-w-6xl px-4 sm:px-6 md:px-8 py-16 md:py-24">
      <div className="mb-10 md:mb-14 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
          How Bothive works
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[var(--fg-muted)]">
          Thousands of specialized agents, thinking as one.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map((item) => (
          <div key={item.title} className="panel">
            <div className="panel-ring" />
            <h3 className="text-lg md:text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-[var(--fg-muted)]">{item.desc}</p>
            <div className="mt-4">
              <Link href={item.cta.href} className="btn btn-secondary">
                {item.cta.label}
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-[var(--fg-muted)]">
        <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">Slack</span>
        <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">Notion</span>
        <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">Discord</span>
        <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">GitHub</span>
        <span className="px-2 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border)]">Zapier</span>
      </div>
    </section>
  );
}



