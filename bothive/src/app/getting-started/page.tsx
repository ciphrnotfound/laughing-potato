"use client";

import React, { useMemo, useState } from "react";
import type { JSX } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  CheckCircle2,
  Circle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StepField {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
}

interface OnboardingStep {
  title: string;
  description: string;
  fields: StepField[];
}

type Role = "user" | "developer";

type Status = "idle" | "submitting" | "success";

const USER_STEPS: OnboardingStep[] = [
  {
    title: "Profile basics",
    description: "Tell us who you are so we can tailor recommendations.",
    fields: [
      { name: "fullName", label: "Full name", placeholder: "Avery Nakamura" },
      { name: "email", label: "Email", placeholder: "avery@bothive.dev", type: "email" },
      { name: "region", label: "Region", placeholder: "Berlin, Germany" },
    ],
  },
  {
    title: "Interests",
    description: "What kind of agents are you looking to try?",
    fields: [
      { name: "categories", label: "Preferred categories", placeholder: "Productivity, Research, Creative" },
      { name: "budget", label: "Monthly budget", placeholder: "$25" },
      { name: "usage", label: "Primary use-case", placeholder: "Streamline product research" },
    ],
  },
  {
    title: "Workspace setup",
    description: "Final questions before we unlock the Hive Store for you.",
    fields: [
      { name: "teamSize", label: "Team size", placeholder: "1-5" },
      { name: "tools", label: "Tools you already use", placeholder: "Slack, Notion, Linear" },
    ],
  },
];

const DEVELOPER_STEPS: OnboardingStep[] = [
  {
    title: "Studio profile",
    description: "Introduce your studio to the Hive community.",
    fields: [
      { name: "studioName", label: "Studio name", placeholder: "Nova Constructs" },
      { name: "contact", label: "Contact email", placeholder: "ops@novaconstructs.ai", type: "email" },
      { name: "headquarters", label: "HQ location", placeholder: "Lisbon, Portugal" },
    ],
  },
  {
    title: "Capability deck",
    description: "Share what you build and how your agents operate.",
    fields: [
      { name: "focusAreas", label: "Focus areas", placeholder: "Autonomous research, workflow automation" },
      { name: "stack", label: "Preferred stack", placeholder: "Next.js, Supabase, OpenAI, LangChain" },
      { name: "compliance", label: "Compliance readiness", placeholder: "SOC2 in progress" },
    ],
  },
  {
    title: "Operational readiness",
    description: "A few more details so we can list you as a Worker Bot.",
    fields: [
      { name: "deployment", label: "Deployment cadence", placeholder: "Weekly" },
      { name: "support", label: "Support channels", placeholder: "Discord, PagerDuty" },
      { name: "pricingModel", label: "Pricing model", placeholder: "Usage-based revenue share" },
    ],
  },
];

const roleCards: Array<{
  role: Role;
  title: string;
  description: string;
  points: string[];
  icon: React.ReactNode;
  accent: string;
}> = [
  {
    role: "user",
    title: "Hive Explorer",
    description: "Discover curated AI companions for your daily rituals.",
    points: ["Hand-picked agent playlists", "Personalised launchpad dashboard", "Transparent free-tier limits"],
    icon: <Store className="h-6 w-6 text-neutral-100" />, 
    accent: "from-[#12121a] via-[#09090f] to-[#1b1524]",
  },
  {
    role: "developer",
    title: "Worker Bot",
    description: "Ship production-grade agents to the Hive marketplace.",
    points: ["CI-integrated deployment", "Analytics + telemetry streams", "Revenue share payouts"],
    icon: <Bot className="h-6 w-6 text-neutral-100" />, 
    accent: "from-[#141420] via-[#0b0b13] to-[#231a31]",
  },
];

export default function GettingStartedPage(): JSX.Element {
  const [role, setRole] = useState<Role | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const steps = useMemo(() => {
    if (role === "user") return USER_STEPS;
    if (role === "developer") return DEVELOPER_STEPS;
    return [];
  }, [role]);

  const activeStep = steps[stepIndex];
  const isLastStep = role !== null && stepIndex === steps.length - 1;
  const progress = role ? ((stepIndex + 1) / steps.length) * 100 : 0;

  const handleSelectRole = (nextRole: Role) => {
    setRole(nextRole);
    setStepIndex(0);
    setStatus("idle");
    setFormValues({});
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      return;
    }
    setRole(null);
    setFormValues({});
    setStatus("idle");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLastStep) {
      setStepIndex((prev) => prev + 1);
      return;
    }
    setStatus("submitting");
    setTimeout(() => {
      setStatus("success");
    }, 900);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508] text-neutral-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(148,163,184,0.18),transparent_52%),radial-gradient(circle_at_82%_12%,rgba(124,58,237,0.16),transparent_55%),radial-gradient(circle_at_50%_85%,rgba(99,102,241,0.1),transparent_60%)] opacity-75" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:62px_62px] opacity-12" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,6,12,0.78),rgba(4,4,8,0.95))]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-24 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.32em] text-white/45">
          <Link href="/" className="inline-flex items-center gap-2 text-white/75 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="tracking-normal uppercase">Back to home</span>
          </Link>
          <span>Bothive onboarding</span>
        </div>

        <section className="max-w-4xl space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="text-3xl font-semibold text-white sm:text-4xl"
          >
            Choose your Hive trajectory.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="max-w-2xl text-sm text-white/65 sm:text-base"
          >
            Whether you want to explore agents or deploy your own swarm, well guide you through a tailored setup. Pick a path to begin; you can always jump back and change your role.
          </motion.p>
        </section>

        {!role && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            {roleCards.map((card) => (
              <button
                key={card.role}
                type="button"
                onClick={() => handleSelectRole(card.role)}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border border-white/8 p-8 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa]/35",
                  "bg-gradient-to-br",
                  card.accent,
                  "hover:-translate-y-1 hover:border-[#c4b5fd]/40"
                )}
              >
                <div className="absolute right-6 top-6 rounded-full border border-white/15 bg-white/10 p-2 backdrop-blur">
                  {card.icon}
                </div>
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-white drop-shadow-[0_8px_20px_rgba(124,58,237,0.22)]">
                    {card.title}
                  </h2>
                  <p className="text-sm text-white/75">{card.description}</p>
                  <ul className="space-y-2 text-sm text-white/60">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#c4b5fd]/80" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Sparkles className="h-4 w-4 text-[#c4b5fd]" />
                    Begin as {card.role === "user" ? "explorer" : "builder"}
                  </div>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {role && status !== "success" && activeStep && (
            <motion.section
              key={`${role}-${stepIndex}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 rounded-3xl border border-white/10 bg-gradient-to-br from-[#111117]/95 via-[#08080d]/95 to-[#1f1b2c]/95 p-6 sm:p-8 shadow-[0_60px_160px_rgba(124,58,237,0.28)] backdrop-blur-xl"
            >
              <div className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr] xl:grid-cols-[0.35fr_0.65fr]">
                <aside className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-white/45">
                      <span>{role === "user" ? "Explorer runbook" : "Builder runbook"}</span>
                      <span>{steps.length} steps</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {steps.map((step, index) => {
                        const isComplete = index < stepIndex;
                        const isActive = index === stepIndex;
                        const statusLabel = isComplete ? "Complete" : isActive ? "In progress" : "Awaiting";
                        return (
                          <div
                            key={step.title}
                            className={cn(
                              "flex items-start gap-3 rounded-2xl border px-3 py-3 transition",
                              isActive
                                ? "border-white/35 bg-white/10"
                                : isComplete
                                ? "border-white/15 bg-white/5 text-white/75"
                                : "border-white/5 text-white/45 hover:border-white/12 hover:text-white/65"
                            )}
                          >
                            <div
                              className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border text-xs",
                                isActive
                                  ? "border-white/60 bg-white text-black"
                                  : isComplete
                                  ? "border-white/25 bg-white/15 text-white"
                                  : "border-white/10 text-white/40"
                              )}
                            >
                              {isComplete ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : isActive ? (
                                <Sparkles className="h-4 w-4" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-white">{step.title}</p>
                              <p className="text-xs text-white/55 line-clamp-2">{step.description}</p>
                              <span className="text-[10px] uppercase tracking-[0.32em] text-white/35">{statusLabel}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/65">
                    <div className="flex items-center gap-2 text-white">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="font-medium">Need a hand?</span>
                    </div>
                    <p className="mt-2 text-xs text-white/55">
                      Our team can review your responses and send a tailored automation checklist within 24 hours.
                    </p>
                    <button
                      type="button"
                      className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/70 underline-offset-4 transition hover:text-white hover:underline"
                    >
                      Book a walkthrough
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </aside>

                <div className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,0.14),rgba(12,10,24,0.92))] p-6 sm:p-7">
                  <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-white/40">
                        <span>{role === "user" ? "Hive explorer" : "Worker bot"}</span>
                        <BadgeCheck className="h-3.5 w-3.5" />
                      </div>
                      <h2 className="mt-2 text-2xl font-semibold text-white">{activeStep.title}</h2>
                      <p className="text-sm text-white/60">{activeStep.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right text-sm text-white/60">
                      <span>
                        Step {stepIndex + 1} of {steps.length}
                      </span>
                      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/12">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#ede9fe] via-[#c4b5fd] to-[#a78bfa]"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-5 md:grid-cols-2">
                      {activeStep.fields.map((field) => (
                        <label key={field.name} className="space-y-2">
                          <span className="text-xs font-medium uppercase tracking-[0.22em] text-white/55">{field.label}</span>
                          <input
                            type={field.type ?? "text"}
                            required
                            value={formValues[field.name] ?? ""}
                            onChange={(event) => handleFieldChange(field.name, event.target.value)}
                            placeholder={field.placeholder}
                            className="w-full rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(12,10,24,0.9))] px-4 py-3 text-sm text-white placeholder:text-[#c4b5fd]/40 transition focus:border-[#c4b5fd]/60 focus:outline-none focus:ring-2 focus:ring-[#a78bfa]/30"
                          />
                        </label>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="group inline-flex items-center gap-2 rounded-2xl border border-[#c4b5fd]/40 bg-gradient-to-r from-white via-white to-white px-5 py-2.5 text-sm font-semibold text-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {status === "submitting" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Saving</span>
                          </>
                        ) : (
                          <>
                            <span>{isLastStep ? "Complete setup" : "Continue"}</span>
                            <Sparkles className="h-4 w-4 text-[#a78bfa]" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {status === "success" && role && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f0f15]/95 via-[#08080d]/95 to-[#1c1525]/95 p-10 shadow-[0_60px_160px_rgba(124,58,237,0.32)] backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.18),transparent_58%)]" />
            <div className="relative z-10 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              {role === "user" ? (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/70">
                    <Store className="h-3.5 w-3.5" />
                    Hive Store
                  </div>
                  <h2 className="text-3xl font-semibold text-white sm:text-4xl">Welcome to the Hive Store.</h2>
                  <p className="max-w-xl text-sm text-white/70 sm:text-base">
                    Your personalised plaza has been provisioned. Curated collections, spotlighted releases, and seasonal drops are ready the moment you land. Expect instant recommendations powered by the preferences you just shared.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {["Featured Realm", "Weekly Drops", "Editors Picks", "Indie Talents"].map((tile) => (
                      <div
                        key={tile}
                        className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(12,10,24,0.85))] p-4 text-sm text-white/80 shadow-[0_20px_50px_rgba(124,58,237,0.25)]"
                      >
                        {tile}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/store"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5"
                    >
                      Enter Hive Store
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSelectRole("developer")}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
                    >
                      Build instead
                      <Wand2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.35em] text-white/70">
                    <Bot className="h-3.5 w-3.5" />
                    Worker Bot
                  </div>
                  <h2 className="text-3xl font-semibold text-white sm:text-4xl">Youre registered in the Hive.</h2>
                  <p className="max-w-xl text-sm text-white/70 sm:text-base">
                    Weve spun up your Bothive workspace with deployment channels, revenue tracking, and compliance tooling. Next stop: ship your first agent and surface it to thousands of explorers.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {["Deploy Pipeline", "Telemetry Console", "Revenue Share", "Launch Checklist"].map((tile) => (
                      <div
                        key={tile}
                        className="rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(148,163,184,0.18),rgba(10,9,20,0.85))] p-4 text-sm text-white/80 shadow-[0_20px_50px_rgba(148,163,184,0.25)]"
                      >
                        {tile}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/builder"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(124,58,237,0.25)] transition hover:-translate-y-0.5"
                    >
                      Open Builder
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleSelectRole("user")}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
                    >
                      Browse instead
                      <Store className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-6 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.2),transparent_72%)] p-6 text-white/80 shadow-[inset_0_0_80px_rgba(124,58,237,0.22)]">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                  <div className="flex items-center gap-3 text-white">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-sm font-medium">Trusted enrolment complete</span>
                  </div>
                  <p className="mt-3 text-sm text-white/60">
                    Weve encrypted your responses and synced them with our orchestration API. Expect a welcome email with next steps and curated resources tailored to your role.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                  <div className="flex items-center gap-3 text-white">
                    <Building2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Need assistance?</span>
                  </div>
                  <p className="mt-3 text-sm text-white/60">
                    Reach out via support@bothive.dev or join the Discord to meet fellow builders and explorers.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setRole(null);
                  setStatus("idle");
                  setFormValues({});
                  setStepIndex(0);
                }}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm text-white/75 transition hover:border-white/35 hover:text-white"
              >
                Start over
              </button>
              <Link
                href={role === "user" ? "/store" : "/builder"}
                className="inline-flex items-center gap-2 text-sm text-white/60 underline-offset-4 hover:text-white/90 hover:underline"
              >
                Continue to {role === "user" ? "Hive Store" : "Builder"}
              </Link>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
