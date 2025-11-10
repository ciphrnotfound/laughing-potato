"use client";

import Link from "next/link";
import { ArrowLeft, TerminalSquare, PlayCircle, Share2 } from "lucide-react";

const HIVE_EXAMPLE = `bot SupportGuide
  description "Answers onboarding questions for new Hive members"

  memory shared
    notes store key "faq"
  end

  on input when input.question?
    say "Here’s what I found about {input.topic}:"
    recall notes as faq
    if faq.blank?
      say "No entry yet — logging this so another agent can fill it in."
      notes.append key "faq" value "{input.topic}: pending research"
    else
      say faq
    end
  end

  on input when not input.question?
    say "Ask me anything about Hiveland policies, pricing, or integrations."
  end
end`;

const LANGUAGE_SECTIONS = [
  {
    title: "01 · Structure",
    points: [
      "Every HiveLang file defines one or more bots with the `bot Name` declaration.",
      "Each bot can describe memory blocks, event handlers, and helper routines.",
      "Indentation is semantic: two spaces is the recommended style for nested blocks.",
    ],
  },
  {
    title: "02 · Capabilities",
    points: [
      "Attach capabilities by referencing tool manifests in the Builder, or declare inline scaffolds.",
      "Use `on input when condition?` to branch on structured inputs (questions, intents, scenario payloads).",
      "Combine `say` for responses, `call` for tool invocations, and `emit` for events between agents.",
    ],
  },
  {
    title: "03 · Memory",
    points: [
      "`memory shared` blocks declare durable context across runs; use keys to organize records.",
      "In short-lived agents, prefer `memory ephemeral` to keep transcripts lean.",
      "Helpers like `recall`, `notes.append`, and `notes.remove` let you mutate state predictably.",
    ],
  },
];

export default function HivelangDocsPage() {
  return (
    <div className="min-h-screen bg-[#05030c] text-slate-100">
      <div className="relative mx-auto max-w-5xl px-6 py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(99,92,255,0.28),transparent_70%)]" />

        <header className="relative space-y-6">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-slate-500 hover:text-slate-200"
          >
            <ArrowLeft className="h-4 w-4" /> Back to docs
          </Link>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold text-slate-50">HiveLang reference</h1>
            <p className="max-w-2xl text-sm text-slate-400">
              HiveLang is the DSL that powers Bothive agents. It combines declarative flows, shared memory, and
              capability orchestration so your swarm stays predictable.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.32em] text-slate-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-[#11111b]/80 px-3 py-1">
                <TerminalSquare className="h-4 w-4 text-indigo-300" />
                Version 0.9
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-[#11111b]/80 px-3 py-1">
                <PlayCircle className="h-4 w-4 text-indigo-300" />
                Run inside builder
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-800/70 bg-[#11111b]/80 px-3 py-1">
                <Share2 className="h-4 w-4 text-indigo-300" />
                Swarm ready
              </span>
            </div>
          </div>
        </header>

        <section className="relative mt-12 grid gap-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,0.4fr)]">
          <article className="rounded-3xl border border-slate-900/80 bg-[#0b0a18]/90 p-6 shadow-[0_30px_80px_-50px_rgba(22,16,60,0.8)]">
            <h2 className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Example bot</h2>
            <p className="mt-2 text-sm text-slate-400">
              The snippet below mirrors the example highlighted in the builder. Paste it into the Hive editor to explore
              memory lookups, conversational branching, and system messaging.
            </p>
            <pre className="mt-4 max-h-[420px] overflow-auto rounded-2xl border border-slate-900/70 bg-[#080716] p-5 text-sm leading-relaxed text-slate-100">
{HIVE_EXAMPLE}
            </pre>
          </article>

          <aside className="space-y-4">
            {LANGUAGE_SECTIONS.map((section) => (
              <div key={section.title} className="rounded-3xl border border-slate-900/80 bg-[#0c0b1a]/85 p-5">
                <h3 className="text-sm font-semibold text-slate-200">{section.title}</h3>
                <ul className="mt-3 space-y-2 text-xs text-slate-400">
                  {section.points.map((point) => (
                    <li key={point} className="leading-relaxed">{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        </section>

        <section className="relative mt-12 grid gap-6 rounded-3xl border border-slate-900/80 bg-[#090817]/80 p-6 text-sm text-slate-300 lg:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">Runtime tips</h3>
            <ul className="space-y-2">
              <li>Use `compile` in the builder to validate before every deployment.</li>
              <li>Surface feature flags or experiments via shared memory to coordinate agent handoffs.</li>
              <li>Call `emit` to notify other bots in workflows—especially orchestration or auditing agents.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">Learn more</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-indigo-200 hover:text-indigo-100">
                  Documentation home ↗
                </Link>
              </li>
              <li>
                <Link href="/builder" className="text-indigo-200 hover:text-indigo-100">
                  Open builder ↗
                </Link>
              </li>
              <li>
                <Link href="/docs/hivelang/changelog" className="text-indigo-200 hover:text-indigo-100">
                  HiveLang changelog ↗
                </Link>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
