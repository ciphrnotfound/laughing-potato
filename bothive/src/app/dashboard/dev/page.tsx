"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Rocket,
  BarChart3,
  Layers,
  Folders,
  LineChart,
  ShieldCheck,
  Zap,
  Loader2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSession } from "@/lib/app-session-context";

const GRADIENT_CLASSES = [
  "from-[#7C3AED] via-[#6D28D9] to-[#4C1D95]",
  "from-[#22D3EE] via-[#0EA5E9] to-[#075985]",
  "from-[#F97316] via-[#EA580C] to-[#C2410C]",
  "from-[#10B981] via-[#059669] to-[#065F46]",
];

interface Metric {
  id: string;
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface LaunchTask {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function DeveloperDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading: sessionLoading, profile } = useAppSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!isAuthenticated) {
      router.replace("/signin?redirect=%2Fdashboard%2Fdev");
      return;
    }
    const timeout = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timeout);
  }, [isAuthenticated, sessionLoading, router]);

  const metrics: Metric[] = useMemo(
    () => [
      { id: "installs", label: "Installs this month", value: "312", change: "+24%", icon: Rocket },
      { id: "revenue", label: "Projected revenue", value: "$4.7K", change: "+12%", icon: BarChart3 },
      { id: "agents", label: "Published agents", value: "6", change: "+2", icon: Layers },
      { id: "uptime", label: "Runtime health", value: "99.6%", change: "Stable", icon: ShieldCheck },
    ],
    []
  );

  const launchChecklist: LaunchTask[] = useMemo(
    () => [
      {
        title: "Draft new listing",
        description: "Upload iconography, pricing, and preview flows for your next bot.",
        href: "/builder",
        icon: Sparkles,
      },
      {
        title: "Wire telemetry",
        description: "Connect Supabase traces to monitor crash-free sessions.",
        href: "/dashboard/integrations",
        icon: LineChart,
      },
      {
        title: "Publish changelog",
        description: "Share release notes with existing tenants and highlight fixes.",
        href: "/dashboard/activity",
        icon: Folders,
      },
      {
        title: "Automate trials",
        description: "Spin up a workflow that turns installs into subscriptions automatically.",
        href: "/automations",
        icon: Zap,
      },
    ],
    []
  );

  if (sessionLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080414] text-white">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm uppercase tracking-[0.32em] text-white/60">
          <Loader2 className="h-4 w-4 animate-spin" /> Preparing studio
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080414] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.18),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:56px_56px] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,4,20,0.65),rgba(3,1,9,0.95))]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 pb-24 pt-20 sm:px-7 lg:px-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/70">
              <Sparkles className="h-3.5 w-3.5" /> Developer HQ
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">Orchestrate your studio.</h1>
              <p className="max-w-2xl text-sm text-white/70 sm:text-base">
                Track installs, revenue, and release health in one command center. Configure workflows and publish new agents without leaving your browser.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70 shadow-[0_24px_80px_rgba(124,58,237,0.3)] backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-white/40">Studio owner</p>
              <p className="mt-2 text-white text-lg font-semibold">{profile?.fullName ?? profile?.email ?? "Your workspace"}</p>
            </div>
            <div className="grid gap-3 text-xs uppercase tracking-[0.26em] text-white/55">
              <span>Revenue share beta · Enabled</span>
              <span>Marketplace priority slots · 2 remaining</span>
            </div>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white px-5 py-2.5 text-xs font-semibold text-black shadow-[0_12px_40px_rgba(124,58,237,0.32)] transition hover:-translate-y-0.5"
            >
              Launch Builder
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const gradient = GRADIENT_CLASSES[index % GRADIENT_CLASSES.length] ?? GRADIENT_CLASSES[0]!;
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className={cn(
                  "relative overflow-hidden rounded-3xl border border-white/10 p-5 shadow-[0_28px_70px_rgba(12,10,28,0.45)] transition",
                  "bg-gradient-to-br",
                  gradient
                )}
              >
                <div className="absolute inset-0 opacity-35 mix-blend-soft-light">
                  <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/30 blur-3xl" />
                </div>
                <div className="relative z-10 flex items-start justify-between text-sm text-white/85">
                  <div className="space-y-1">
                    <p className="uppercase tracking-[0.26em] text-white/70 text-[10px]">{metric.label}</p>
                    <p className="text-3xl font-semibold">{metric.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/20">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="relative z-10 mt-6 text-xs uppercase tracking-[0.3em] text-white/75">{metric.change}</p>
              </motion.div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8 text-white/80 shadow-[0_42px_110px_rgba(20,14,56,0.38)] backdrop-blur-xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-white">Launch checklist</h2>
                <p className="text-sm text-white/65">Ship confidently with curated tasks for your next release train.</p>
              </div>
              <Link
                href="/dashboard/activity"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/65 transition hover:border-white/30 hover:text-white"
              >
                View history
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4">
              {launchChecklist.map((task, index) => {
                const Icon = task.icon;
                return (
                  <div
                    key={task.title}
                    className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/75 transition hover:border-white/25 hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">{task.title}</h3>
                          <p className="text-xs text-white/60">{task.description}</p>
                        </div>
                      </div>
                      <Link
                        href={task.href}
                        className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-white/60 transition hover:text-white"
                      >
                        Open
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
            className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 text-white/70 shadow-[0_42px_110px_rgba(20,14,56,0.38)] backdrop-blur-xl"
          >
            <div>
              <h3 className="text-lg font-semibold text-white">Sandbox tenants</h3>
              <p className="text-xs text-white/60">Instant demo credentials to showcase your bots.</p>
              <div className="mt-4 space-y-3 text-xs uppercase tracking-[0.26em] text-white/55">
                <div className="flex items-center justify-between rounded-2xl border border-white/12 bg-black/30 px-4 py-3">
                  <span>Ops automation</span>
                  <span className="text-white/70">ops-demo@bothive.dev</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/12 bg-black/30 px-4 py-3">
                  <span>Research pilot</span>
                  <span className="text-white/70">research-demo@bothive.dev</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-5">
              <div className="flex items-center gap-3 text-white">
                <Plus className="h-4 w-4" />
                <span className="text-sm font-semibold">Need a hand shipping?</span>
              </div>
              <p className="mt-3 text-xs text-white/60">
                Book a 20-minute session with the Bothive crew for monetisation audits, pricing guidance, or marketplace experiments.
              </p>
              <Link
                href="mailto:studio@bothive.dev"
                className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-white/65 transition hover:text-white"
              >
                Contact studio team
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.aside>
        </section>
      </div>
    </main>
  );
}
