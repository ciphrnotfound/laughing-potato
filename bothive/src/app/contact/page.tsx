"use client";

import Navbar2 from "@/components/Navbar2";
import ProfessionalAlert from "@/components/ui/game-alert";
import { FormEvent, useState } from "react";

const responseTimes = [
  { label: "Enterprise onboarding", eta: "< 6 hours", channel: "Dedicated CSM" },
  { label: "Critical escalation", eta: "< 1 hour", channel: "Pager channel" },
  { label: "Platform questions", eta: "< 12 hours", channel: "Developer Slack" },
];

const offices = [
  { city: "San Francisco", detail: "R&D and mission control" },
  { city: "Berlin", detail: "EU compliance and support" },
  { city: "Singapore", detail: "APAC solutions team" },
];

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    autoClose?: number;
  } | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!fullName || !email || !message) {
      setAlert({
        variant: "warning",
        title: "Missing details",
        message: "Give us a name, a signal, and the mission so we can deploy the right crew.",
        autoClose: 2200,
      });
      return;
    }

    setIsSubmitting(true);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setAlert({
        variant: "success",
        title: "Signal received",
        message: "The Bothive ops team will reply with coordinates within one business day.",
        autoClose: 2600,
      });
      setFullName("");
      setEmail("");
      setMessage("");
    }, 900);
  };

  return (
    <main className="relative min-h-screen bg-[#050507] text-white">
      <Navbar2 />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(110,31,255,0.32),transparent_55%),radial-gradient(circle_at_80%_8%,rgba(147,85,255,0.28),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,6,18,0.55),rgba(5,6,12,0.9))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-size:48px_48px] [background-image:linear-gradient(to_right,rgba(123,67,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(123,67,255,0.16)_1px,transparent_1px)]" />
      </div>

      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-28 pt-28">
        <header className="space-y-6 text-center sm:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#7b3dff3d] bg-[#6a00ff1a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/75">
            Contact
          </p>
          <div className="space-y-4">
            <h1 className="text-3xl font-semibold sm:text-4xl md:text-[2.6rem] md:leading-tight">
              Let’s align your hive roadmap
            </h1>
            <p className="max-w-2xl text-sm text-white/70">
              Reach the Bothive crew for enterprise onboarding, partnership opportunities, or anything else you need to orchestrate.
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <form onSubmit={onSubmit} className="grid gap-6 rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#150a29] via-[#0c0617] to-[#08040f] p-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Full name
              <input
                type="text"
                placeholder="Alex Rivera"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="rounded-xl border border-[#7b3dff33] bg-[#100622] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a47aff70] focus:outline-none focus:ring-2 focus:ring-[#814dff55]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-white/70">
              Work email
              <input
                type="email"
                placeholder="you@bothive.dev"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-[#7b3dff33] bg-[#100622] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a47aff70] focus:outline-none focus:ring-2 focus:ring-[#814dff55]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-white/70 sm:col-span-2">
              What are you planning to build?
              <textarea
                rows={4}
                placeholder="Walk us through your agents, integrations, and timeline."
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="rounded-xl border border-[#7b3dff33] bg-[#100622] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a47aff70] focus:outline-none focus:ring-2 focus:ring-[#814dff55]"
              />
            </label>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || !fullName || !email || !message}
                className="rounded-xl bg-gradient-to-r from-[#6a00ff] via-[#814dff] to-[#b18dff] px-5 py-3 text-sm font-semibold text-white transition hover:shadow-[0_12px_32px_rgba(110,31,255,0.35)] disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/80"
              >
                {isSubmitting ? "Sending..." : "Send message"}
              </button>
              <span className="text-xs text-white/55">
                Response within one business day. For urgent support ping the developer Slack channel.
              </span>
            </div>
          </form>

          <aside className="flex flex-col gap-6 rounded-2xl border border-[#6a00ff1f] bg-gradient-to-br from-[#140a29] via-[#0b0516] to-[#08040f] p-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Response times</p>
              <ul className="space-y-3 text-sm text-white/70">
                {responseTimes.map((slot) => (
                  <li key={slot.label} className="rounded-xl border border-[#6a00ff24] bg-[#0f071f] p-4">
                    <p className="text-sm font-semibold text-white">{slot.label}</p>
                    <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                      <span>{slot.eta}</span>
                      <span>{slot.channel}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Global offices</p>
              <ul className="space-y-2 text-sm text-white/70">
                {offices.map((office) => (
                  <li key={office.city} className="flex flex-col rounded-xl border border-[#6a00ff24] bg-[#0f071f] p-4">
                    <span className="text-sm font-semibold text-white">{office.city}</span>
                    <span className="text-xs text-white/60">{office.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        <section className="grid gap-6 rounded-2xl border border-[#6a00ff1f] bg-gradient-to-br from-[#15092b] via-[#0c0618] to-[#08040f] p-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Support playbooks</p>
            <p className="text-sm text-white/65">
              Certified specialists help you script missions, define guardrails, and roll out agent governance that matches your industry.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Integration partners</p>
            <p className="text-sm text-white/65">
              Slack, Salesforce, Zendesk, HubSpot, Linear, ServiceNow, and bespoke data warehouses plug directly into the hive.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Community</p>
            <p className="text-sm text-white/65">
              Join weekly office hours, quarterly roadmap briefings, and the community showcase to see how teams launch new automation pods.
            </p>
          </div>
        </section>
      </section>

      <ProfessionalAlert
        open={Boolean(alert)}
        variant={alert?.variant ?? "info"}
        title={alert?.title ?? ""}
        message={alert?.message}
        autoClose={alert?.autoClose}
        onClose={() => setAlert(null)}
      />
    </main>
  );
}
