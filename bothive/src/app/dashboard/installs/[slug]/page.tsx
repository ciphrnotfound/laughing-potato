"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Zap, Layers, Wand2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAppSession } from "@/lib/app-session-context";
import { ProfessionalAlert } from "@/components/ui/glass-alert";
import { cn } from "@/lib/utils";

interface InstalledBotSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  author: string;
  icon: string;
}

type AlertState = {
  variant: "success" | "error" | "info" | "warning";
  title: string;
  message?: ReactNode;
  autoClose?: number;
} | null;

const FALLBACK_ICON = "/logo.svg";

export default function PostInstallDashboardPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const { isAuthenticated, loading } = useAppSession();
  const [alert, setAlert] = useState<AlertState>(null);
  const [bot, setBot] = useState<InstalledBotSummary | null>(null);
  const [isDeploying, setIsDeploying] = useState(true);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace("/signin");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const stored = sessionStorage.getItem("bothive:lastInstalledBot");
    if (!stored) {
      setAlert({
        variant: "info",
        title: "Launch a bot",
        message: "Install a bot from the Hive Store to see personalised onboarding here.",
        autoClose: 6200,
      });
      setIsDeploying(false);
      return;
    }
    try {
      const parsed = JSON.parse(stored) as InstalledBotSummary;
      setBot(parsed);

      // Sequence the fake deployment logs
      const steps = [
        { msg: `> Initializing container for ${parsed.name}...`, delay: 200 },
        { msg: `> Pulling image hive-registry/${parsed.slug}:latest...`, delay: 800 },
        { msg: "> Verifying dependencies... OK", delay: 1800 },
        { msg: "> Allocating shared memory... OK", delay: 2400 },
        { msg: `> Starting ${parsed.name}.service...`, delay: 3000 },
        { msg: "> Health check passed. Agent is LIVE.", delay: 3800 },
      ];

      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep >= steps.length) {
          clearInterval(interval);
          setTimeout(() => setIsDeploying(false), 800);
          return;
        }
        setTerminalLogs(prev => [...prev, steps[currentStep].msg]);
        currentStep++;
      }, 700);

      return () => clearInterval(interval);

    } catch (error) {
      console.error("Failed to parse last install payload", error);
      setIsDeploying(false);
    }
  }, []);

  useEffect(() => {
    if (!bot) return;
    const slug = params.slug;
    if (!slug) return;
    if (typeof slug === "string" && slug !== bot.slug) {
      router.replace(`/dashboard/installs/${bot.slug}`);
    }
  }, [bot, params.slug, router]);

  const heroCopy = useMemo(() => {
    if (!bot) {
      return {
        heading: "Optimise your copilots",
        subheading: "Set up integrations, configure prompts, and deploy flows tailored to your workspace.",
      };
    }
    return {
      heading: `${bot.name} is ready to work`,
      subheading: `We planted ${bot.name} into your Builder workspace. Take it for a spin, invite teammates, and wire up automations right away.`,
    };
  }, [bot]);

  const quickStarts = useMemo(() => {
    if (bot) {
      return [
        {
          title: "Customise prompts",
          description: "Tune the system prompt and guardrails so responses match your org s tone.",
          action: `/builder?bot=${bot.id}&section=agents`,
          icon: Sparkles,
        },
        {
          title: "Connect data sources",
          description: "Wire CRM, docs, and knowledge bases to give the bot richer context.",
          action: `/builder?bot=${bot.id}&section=integrations`,
          icon: Layers,
        },
        {
          title: "Launch a workflow",
          description: "Trigger your first automation sequence with a single click.",
          action: `/builder?bot=${bot.id}&section=orchestrator`,
          icon: Zap,
        },
      ];
    }
    return [
      {
        title: "Browse Hive Store",
        description: "Install a curated bot to unlock personalised guidance.",
        action: "/hivestore",
        icon: Sparkles,
      },
    ];
  }, [bot]);

  if (isDeploying && bot) {
    return (
      <main className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white font-mono p-6">
        <div className="w-full max-w-2xl bg-[#0c0c16] rounded-xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <span className="ml-2 text-xs text-white/40">deployment-console — -zsh — 80x24</span>
          </div>
          <div className="h-64 flex flex-col justify-end gap-2 text-sm text-green-400/90 leading-relaxed">
            {terminalLogs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="whitespace-pre-wrap"
              >
                {log}
              </motion.div>
            ))}
            <motion.div
              animate={{ opacity: [0, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-2.5 h-5 bg-green-500/50 mt-1"
            />
          </div>
        </div>
        <p className="mt-8 text-white/30 text-xs tracking-[0.2em] uppercase animate-pulse">
          Provisioning Secure Environment...
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050312] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.18),transparent_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:48px_48px] opacity-20" />
      </div>

      {alert && (
        <ProfessionalAlert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
          open
          autoClose={alert.autoClose}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-24 pt-16 sm:px-8">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="space-y-5">
            <Link
              href="/hivestore"
              className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /> Hive Store
            </Link>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-white/50">Personalised workspace</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">{heroCopy.heading}</h1>
              <p className="max-w-2xl text-sm text-white/70">{heroCopy.subheading}</p>
            </div>
          </div>
          {bot ? (
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl">
                <Image src={bot.icon || FALLBACK_ICON} alt={`${bot.name} icon`} fill className="object-contain" sizes="80px" />
              </div>
              <div className="flex flex-col text-xs uppercase tracking-[0.24em] text-white/60">
                <span className="text-sm font-semibold text-white/90">{bot.name}</span>
                <span>{bot.category}</span>
                <span className="text-white/45">By {bot.author}</span>
              </div>
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/15 bg-white/10">
              <Loader2 className="h-6 w-6 animate-spin text-white/80" />
            </div>
          )}
        </header>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 text-white shadow-[0_45px_100px_rgba(76,29,149,0.35)]"
          >
            <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/5" />
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-white/60">
                <Wand2 className="h-4 w-4 text-indigo-200" /> Suggested next actions
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {quickStarts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.action}
                      className="group flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-5 text-white/80 transition hover:border-white/40 hover:bg-white/10"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-indigo-100 shadow-[0_12px_32px_rgba(129,140,248,0.4)] transition group-hover:scale-105">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="text-xs text-white/70">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="flex flex-col gap-5 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_35px_80px_rgba(56,189,248,0.28)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.28em] text-white/60">Workspace tips</span>
              <span className="text-[11px] uppercase tracking-[0.32em] text-white/40">Beta</span>
            </div>
            <ul className="space-y-3 text-sm text-white/75">
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="font-semibold text-white/90">Experiment, don t break production</span>
                <p className="mt-1 text-xs text-white/60">Use the sandbox workspace to iterate before inviting collaborators.</p>
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="font-semibold text-white/90">Document your best flows</span>
                <p className="mt-1 text-xs text-white/60">Save your automations as presets so teammates can reuse them instantly.</p>
              </li>
              <li className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <span className="font-semibold text-white/90">Share access securely</span>
                <p className="mt-1 text-xs text-white/60">Invite teammates and assign scoped permissions from the Builder console.</p>
              </li>
            </ul>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/75">
            <h2 className="text-lg font-semibold text-white">Deploy faster</h2>
            <p className="mt-2 text-sm text-white/60">
              Use agent templates, shared memory, and built-in evaluation reports to keep your copilot sharp.
            </p>
            <Link
              href="/builder?section=agents"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Go to builder
            </Link>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/75">
            <h2 className="text-lg font-semibold text-white">Need a walkthrough?</h2>
            <p className="mt-2 text-sm text-white/60">
              Our success team runs weekly office hours. Bring questions, get hands-on help provisioning your workspace.
            </p>
            <Link
              href="mailto:support@bothive.ai"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Request a session
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
