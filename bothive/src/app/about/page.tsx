"use client";

import Navbar2 from "@/components/Navbar2";

const entries = [
  {
    version: "v0.9.4",
    date: "Oct 20, 2025",
    highlights: ["Introduced mission grid composer", "Expanded Twitter OAuth safeguards", "Stabilised glass dashboard theme"],
  },
  {
    version: "v0.9.3",
    date: "Oct 5, 2025",
    highlights: ["Launched hive marketplace preview", "Added developer sandbox", "Improved telemetry exports"],
  },
  {
    version: "v0.9.2",
    date: "Sep 18, 2025",
    highlights: ["Unified alert system", "Refined black/purple aesthetic", "Performance optimisations"],
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-[#050507] text-white">
      <Navbar2 />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(110,31,255,0.3),transparent_55%),radial-gradient(circle_at_82%_10%,rgba(147,85,255,0.28),transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,6,18,0.55),rgba(5,6,12,0.9))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-size:48px_48px] [background-image:linear-gradient(to_right,rgba(123,67,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(123,67,255,0.16)_1px,transparent_1px)]" />
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-28">
        <header className="space-y-6 text-center sm:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#7b3dff3d] bg-[#6a00ff1a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/75">
            Changelog
          </p>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold sm:text-4xl md:text-[2.6rem] md:leading-tight">
              Ship log for the Bothive platform
            </h1>
            <p className="max-w-2xl text-sm text-white/70">
              Follow the latest drops across mission control, developer tooling, and hive storefronts.
            </p>
          </div>
        </header>

        <div className="space-y-6">
          {entries.map((entry) => (
            <div
              key={entry.version}
              className="rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#160a2d] via-[#0d0618] to-[#08040f] p-6"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 className="text-lg font-semibold text-white">{entry.version}</h2>
                <span className="text-xs uppercase tracking-[0.28em] text-white/60">{entry.date}</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/65">
                {entry.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#c9b1ff]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <section className="grid gap-6 rounded-2xl border border-[#6a00ff1f] bg-gradient-to-br from-[#15092b] via-[#0c0618] to-[#08040f] p-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Release commentary</p>
            <p className="text-sm text-white/65">
              Each release is benchmarked against latency budgets, guardrail coverage, and customer telemetry. When regressions appear, we
              fork the hive, replay mission traces, and publish the mitigation steps here.
            </p>
            <p className="text-sm text-white/65">
              Subscribe to the changelog feed to receive engineering deep dives, governance updates, and migration guides for upcoming API
              changes.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#160a2e] via-[#0d0618] to-[#08040f] p-5">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Roadmap radar</p>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#c9b1ff]" />
                <span>Mission diffing with structured AI review notes for faster approvals.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#c9b1ff]" />
                <span>Real-time autopilot heatmaps to monitor agent confidence in production.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#c9b1ff]" />
                <span>First-class ServiceNow and Workday actions for enterprise workflows.</span>
              </li>
            </ul>
          </div>
        </section>

        <footer className="space-y-4 rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#170a2f] via-[#0e0619] to-[#08050f] p-6 text-sm text-white/65">
          <p className="font-semibold text-white">Looking ahead</p>
          <p>
            Dark-mode docs, richer autopilot analytics, and expanded OAuth integrations are on deck. Join the developer Slack to follow daily
            drops.
          </p>
        </footer>
      </section>
    </main>
  );
}

