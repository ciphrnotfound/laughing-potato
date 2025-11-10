"use client";

import Link from "next/link";
import { Sparkles, BookOpen, Layers, Boxes, Bot, Command, ArrowRight } from "lucide-react";

const DOCS_SECTIONS = [
  {
    id: "getting-started",
    title: "Getting started",
    description: "Spin up your first Hive agents and understand the core concepts in minutes.",
    links: [
      { label: "Provision your workspace", href: "#provision" },
      { label: "Invite collaborators", href: "#invite" },
      { label: "Ship your first scenario", href: "#scenario" },
    ],
  },
  {
    id: "architecture",
    title: "Architecture",
    description: "Understand how Hiveland orchestrates agents, memory, and live tooling.",
    links: [
      { label: "Agent lifecycle", href: "#agents" },
      { label: "Shared memory mesh", href: "#memory" },
      { label: "Manifest and permissions", href: "#manifest" },
    ],
  },
  {
    id: "build",
    title: "Build in Hive",
    description: "Deep dive into the Hive language and best practices for resilient bots.",
    links: [
      { label: "Hive language guide", href: "#language" },
      { label: "Testing playbooks", href: "#testing" },
      { label: "Deployment pipeline", href: "#deployment" },
    ],
  },
];

const FEATURE_CALLOUTS = [
  {
    icon: <Bot className="h-5 w-5 text-indigo-300" />,
    title: "Composable agents",
    description: "Design reusable personas and wire them together with shared memories and capabilities.",
  },
  {
    icon: <Layers className="h-5 w-5 text-indigo-300" />,
    title: "Environment aware",
    description: "Bind tools, secret scopes, and environment variables per workspace or deployment stage.",
  },
  {
    icon: <Command className="h-5 w-5 text-indigo-300" />,
    title: "Instant workflows",
    description: "Kick off scenarios, compile Hive, and debug transcripts directly from the command palette.",
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#030305] via-[#050511] to-[#0d0b24] text-slate-100">
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(99,92,255,0.25),transparent_65%)]" />

        <header className="relative flex flex-col gap-6 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-[#11111c]/80 px-4 py-1 text-[11px] uppercase tracking-[0.35em] text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
            Hiveland documentation
          </div>
          <h1 className="text-4xl font-semibold text-slate-50 sm:text-5xl">Build, deploy, and scale your Hive agents</h1>
          <p className="mx-auto max-w-2xl text-base text-slate-400">
            Hiveland is the operating system for collaborative AI agents. Explore guides, architecture notes, and
            reference material to help your swarm ship faster.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6b64ff] via-[#6056ff] to-[#5144ff] px-5 py-2.5 text-sm font-semibold text-white transition hover:shadow-[0_15px_45px_rgba(94,86,255,0.35)]"
            >
              Open builder
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#getting-started"
              className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-[#11111b]/80 px-5 py-2.5 text-sm text-slate-300 transition hover:border-slate-600 hover:text-slate-100"
            >
              Quickstart
            </Link>
          </div>
        </header>

        <section className="relative mt-16 grid gap-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
          <div className="space-y-6">
            {DOCS_SECTIONS.map((section) => (
              <article
                key={section.id}
                className="rounded-3xl border border-slate-900/80 bg-[#0a0a17]/85 px-6 py-6 shadow-[0_45px_90px_-55px_rgba(22,14,60,0.9)] backdrop-blur"
              >
                <h2 className="text-lg font-semibold text-slate-100">{section.title}</h2>
                <p className="mt-2 text-sm text-slate-400">{section.description}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-300">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-900/60 bg-[#0f0f1c] px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400 transition hover:border-slate-700 hover:text-slate-100"
                      >
                        {link.label}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-900/80 bg-[#0c0c1a]/85 px-6 py-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">
                <BookOpen className="h-4 w-4 text-indigo-300" />
                Reference
              </h3>
              <p className="mt-3 text-sm text-slate-400">
                Browse the full Hive language specification, runtime APIs, and deployment CLI.
              </p>
              <Link
                href="/docs/hiveland/language"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#15152a] px-4 py-2 text-xs uppercase tracking-[0.3em] text-indigo-200 transition hover:bg-[#1b1b33]"
              >
                Language reference
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4 rounded-3xl border border-slate-900/80 bg-[#0c0c1a]/85 px-6 py-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">Why Hiveland</h3>
              <div className="space-y-3 text-sm text-slate-300">
                {FEATURE_CALLOUTS.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-slate-900/70 bg-[#11111f]/90 p-3">
                    <span className="mt-1">{item.icon}</span>
                    <div>
                      <p className="font-medium text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-900/80 bg-[#0c0c1a]/85 px-6 py-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-300">Need more?</h3>
              <p className="mt-3 text-sm text-slate-400">
                Join the swarm in Discord, share templates with the community, or request enterprise onboarding help.
              </p>
              <div className="mt-4 flex flex-col gap-2 text-xs uppercase tracking-[0.3em] text-indigo-200">
                <Link href="https://discord.gg" className="hover:text-indigo-100">
                  Community hub ↗
                </Link>
                <Link href="/contact" className="hover:text-indigo-100">
                  Enterprise contact ↗
                </Link>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
