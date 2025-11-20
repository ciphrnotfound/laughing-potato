"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ArrowUpRight, CircuitBoard, ShieldCheck, Activity, Radar } from "lucide-react";

const heroPoints = [
  "Author multi-agent runbooks with deterministic guardrails.",
  "Expose oversight surfaces that blend telemetry with human evidence.",
  "Deploy across channels under a unified compliance posture.",
];

const heroMetrics = [
  { value: "3,400+", label: "Production swarms" },
  { value: "9.7M", label: "Critical actions/day" },
  { value: "100%", label: "Audit coverage" },
];

const capabilityTracks = [
  {
    icon: CircuitBoard,
    title: "Orchestration spine",
    summary:
      "Model federated agents, dependencies, and escalation routes with deterministic, reviewable logic.",
    signal: "Traceable DAG authoring",
  },
  {
    icon: ShieldCheck,
    title: "Governance mesh",
    summary:
      "Embed policy checkpoints, approvals, and evidence capture directly in the execution fabric.",
    signal: "Zero-drift compliance",
  },
  {
    icon: Radar,
    title: "Live telemetry",
    summary:
      "Observe intent lineage, risk scores, and anomaly spikes in real time across every channel.",
    signal: "Adaptive signal routing",
  },
  {
    icon: Activity,
    title: "Continuous optimisation",
    summary:
      "Benchmark behaviours, roll out experiments, and quantify uplift without interrupting service.",
    signal: "Closed-loop learning",
  },
];

const timelinePhases = [
  {
    stage: "01",
    label: "Discovery alignment",
    detail:
      "Quantify the mission profile, success metrics, and regulatory envelopes before any agents go live.",
    cadence: "Week 0–1",
  },
  {
    stage: "02",
    label: "Systems modelling",
    detail:
      "Design swarm hierarchies, fallback cognition, and human-in-the-loop policies in the Bothive studio.",
    cadence: "Week 2",
  },
  {
    stage: "03",
    label: "Controlled rollout",
    detail:
      "Launch via gated cohorts, observe safeguards, and route exceptions to the command console.",
    cadence: "Week 3–4",
  },
  {
    stage: "04",
    label: "Uptime assurance",
    detail:
      "Automate regression sweeps, export audit packs, and brief leadership through live posture reports.",
    cadence: "Ongoing",
  },
];

const telemetryStats = [
  {
    metric: "112 ms",
    descriptor: "Median command latency",
    note: "Measured across enterprise workloads in the last 90 days.",
  },
  {
    metric: "98.4%",
    descriptor: "Policy adherence",
    note: "Automated guardrails and human approvals remained in lockstep.",
  },
  {
    metric: "7.6 hrs",
    descriptor: "Launch tempo",
    note: "Average journey from design sign-off to monitored production release.",
  },
];

const blueprintHighlights = [
  {
    title: "Operator cockpit",
    description:
      "Consolidated alerting, evidence, and intervention workflows keep oversight disciplined and calm.",
  },
  {
    title: "Resilience playbooks",
    description:
      "Scenario libraries simulate load, risk, and fail states so teams can pre-approve recoveries.",
  },
  {
    title: "Executive telemetry",
    description:
      "Programmatic briefs translate technical posture into strategic language for leadership.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
};

const subtleRise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] as const } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.18,
    },
  },
};

export default function LightLanding() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fdfefe] text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-white via-white/70 to-transparent" />
        <div className="absolute left-[10%] top-24 h-64 w-64 rounded-full bg-slate-200/55 blur-[120px]" />
        <div className="absolute right-[18%] top-48 h-72 w-72 rounded-full bg-sky-100/55 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[length:120px_120px] opacity-30" />
      </div>

      <main className="relative z-10 flex flex-col gap-24 pb-28">
        <motion.section
          className="mx-auto w-full max-w-6xl px-6 pt-28 sm:px-10 lg:pt-32"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.42em] text-slate-500"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
            Bothive intelligence console
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-balance text-[clamp(2.6rem,5vw,3.6rem)] font-medium leading-[1.1] tracking-[-0.03em] text-slate-900"
          >
            A serious automation surface for teams that measure every outcome.
          </motion.h1>

          <motion.p
            variants={subtleRise}
            className="mt-5 max-w-2xl text-lg font-normal leading-relaxed text-slate-600"
          >
            Bothive is the white-label operating fabric for orchestrating autonomous agents under disciplined
            oversight. Design governed swarms, monitor every decision, and deploy confidently across critical
            journeys.
          </motion.p>

          <motion.ul
            variants={subtleRise}
            className="mt-8 grid gap-3 text-sm font-normal text-slate-500 sm:grid-cols-2"
          >
            {heroPoints.map((point) => (
              <motion.li
                key={point}
                variants={subtleRise}
                className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3"
              >
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-700" />
                <span>{point}</span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Request a technical briefing
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-400"
            >
              Explore architecture docs
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-12 grid gap-6 rounded-3xl border border-slate-200/70 bg-white/70 p-6 sm:grid-cols-3"
          >
            {heroMetrics.map((item) => (
              <div key={item.label} className="text-center sm:text-left">
                <p className="text-3xl font-medium tracking-[-0.02em] text-slate-900">{item.value}</p>
                <p className="mt-2 text-xs font-normal uppercase tracking-[0.32em] text-slate-400">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          id="capabilities"
          className="mx-auto w-full max-w-6xl px-6 sm:px-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="max-w-3xl space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-slate-400">Capability lanes</p>
            <h2 className="text-[2rem] font-medium leading-[1.16] tracking-[-0.02em] text-slate-900">
              Tooling built for controlled intelligence at scale.
            </h2>
            <p className="text-sm font-normal leading-relaxed text-slate-500">
              Each lane is instrumented for auditability and performance, turning experimental ideas into
              production-grade services without losing trust.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 grid gap-5 sm:grid-cols-2">
            {capabilityTracks.map((track) => {
              const Icon = track.icon;
              return (
                <motion.div
                  key={track.title}
                  variants={scaleIn}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-8 hover:border-slate-300"
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100" />
                  </div>
                  <div className="relative flex flex-col gap-5">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-white/80 text-slate-800">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-lg font-medium tracking-[-0.015em] text-slate-900">{track.title}</h3>
                      <p className="mt-3 text-sm font-normal leading-relaxed text-slate-500">{track.summary}</p>
                    </div>
                    <span className="text-xs font-medium uppercase tracking-[0.32em] text-slate-400">{track.signal}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        <motion.section
          id="operations"
          className="mx-auto w-full max-w-6xl px-6 sm:px-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="max-w-3xl space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-slate-400">Operational runway</p>
            <h2 className="text-[1.9rem] font-medium leading-[1.16] tracking-[-0.02em] text-slate-900">
              From discovery to uptime assurance, mapped and measured.
            </h2>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-10 grid gap-4 lg:grid-cols-4">
            {timelinePhases.map((phase) => (
              <motion.div
                key={phase.label}
                variants={scaleIn}
                className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 backdrop-blur-sm"
              >
                <p className="text-xs font-medium uppercase tracking-[0.36em] text-slate-400">{phase.stage}</p>
                <h3 className="mt-3 text-lg font-medium tracking-[-0.015em] text-slate-900">{phase.label}</h3>
                <p className="mt-3 text-sm font-normal leading-relaxed text-slate-500">{phase.detail}</p>
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.3em] text-slate-400">{phase.cadence}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          id="telemetry"
          className="mx-auto w-full max-w-6xl px-6 sm:px-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.36em] text-slate-400">Telemetry fabric</p>
              <h2 className="text-[1.9rem] font-medium leading-[1.16] tracking-[-0.02em] text-slate-900">
                Every signal you need, surfaced with context and confidence.
              </h2>
              <p className="text-sm font-normal leading-relaxed text-slate-500">
                Observability is streamed as events, traces, and executive-ready summaries so operators can anticipate
                and intervene before issues propagate.
              </p>
            </div>

            <motion.div
              variants={scaleIn}
              className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-[0_18px_55px_rgba(15,23,42,0.08)]"
            >
              <div className="grid gap-5 sm:grid-cols-3">
                {telemetryStats.map((stat) => (
                  <div key={stat.metric} className="rounded-2xl bg-slate-50/80 p-4 text-center sm:text-left">
                    <p className="text-2xl font-medium tracking-[-0.02em] text-slate-900">{stat.metric}</p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.28em] text-slate-400">
                      {stat.descriptor}
                    </p>
                    <p className="mt-3 text-xs font-normal leading-relaxed text-slate-500">{stat.note}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          id="blueprint"
          className="mx-auto w-full max-w-6xl px-6 sm:px-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-[1.8rem] font-medium leading-[1.16] tracking-[-0.02em] text-slate-900">
            Architect a blueprint that keeps operators, compliance, and leadership aligned.
          </motion.h2>

          <motion.div variants={fadeUp} className="mt-10 grid gap-5 md:grid-cols-3">
            {blueprintHighlights.map((item) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                className="rounded-3xl border border-slate-200/70 bg-white/80 p-6"
              >
                <h3 className="text-lg font-medium tracking-[-0.015em] text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm font-normal leading-relaxed text-slate-500">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="mx-auto w-full max-w-5xl px-6 sm:px-10"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={fadeUp}
        >
          <div className="overflow-hidden rounded-[34px] border border-slate-200/70 bg-white/80 p-10 text-center shadow-[0_26px_70px_rgba(15,23,42,0.08)]">
            <p className="text-xs font-medium uppercase tracking-[0.36em] text-slate-400">Engage with Bothive</p>
            <h2 className="mt-4 text-[1.9rem] font-medium leading-[1.16] tracking-[-0.02em] text-slate-900">
              Schedule a readiness workshop with our systems architects.
            </h2>
            <p className="mt-4 text-sm font-normal leading-relaxed text-slate-500">
              We unpack your current automation landscape, identify compliance constraints, and outline a deployable
              blueprint in under two weeks.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Book a session
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/case-studies"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-400"
              >
                View case studies
              </Link>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
