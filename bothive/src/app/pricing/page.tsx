"use client";

import React from "react";
import Navbar2 from "@/components/Navbar2";
import Link from "next/link";

const revenueStreams = [
  {
    title: "Marketplace commission",
    description:
      "Earn 85% of every bot sale. Bothive retains a 15% fee that covers payment processing, fraud protection, and customer support.",
  },
  {
    title: "Recurring usage",
    description:
      "Opt into usage-based billing for high-volume customers. You receive 75% of metered extension fees, paid out monthly.",
  },
  {
    title: "Marketplace boosts",
    description:
      "Fund promotional slots to place your automations in the featured rail. Boosts are optional and priced dynamically.",
  },
];

const marketplaceNumbers = [
  { label: "Average cart value", value: "$162" },
  { label: "Creator payout time", value: "7 days" },
  { label: "Global customers", value: "58 countries" },
  { label: "Refund rate", value: "< 1.2%" },
];

const feeTable = [
  { item: "Primary bot sale", creator: "85%", bothive: "15%" },
  { item: "Recurring usage (opt-in)", creator: "75%", bothive: "25%" },
  { item: "Support escalations", creator: "100%", bothive: "Included" },
  { item: "Marketplace boosts", creator: "Fixed bid", bothive: "N/A" },
];

const milestones = [
  {
    title: "List your agent",
    description: "Upload branding, define capabilities, and set pricing tiers. Submit for a 24-hour review before going live.",
  },
  {
    title: "Activate payment profile",
    description: "Connect Stripe or bank transfer details. Payouts land every Friday with full ledger visibility.",
  },
  {
    title: "Track conversions",
    description: "Use marketplace analytics to monitor trials, upgrades, and retention with per-plan funnel data.",
  },
];

const faqs = [
  {
    q: "Can I bring external billing?",
    a: "Yes. You can connect an external billing URL. Bothive tracks entitlement and usage while letting you manage invoices.",
  },
  {
    q: "How do refunds work?",
    a: "If a refund is issued within 14 days, the commission is clawed back. After that, Bothive absorbs the cost.",
  },
  {
    q: "Are enterprise deals supported?",
    a: "Enterprise customers can request private offers. You negotiate terms and Bothive facilitates contract signing and invoicing.",
  },
];

export default function MarketplaceEconomicsPage() {
  return (
    <main className="relative min-h-screen bg-[#050507] text-white py-12 px-4 sm:px-6 lg:px-8">
      <Navbar2 />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(106,0,255,0.32),transparent_55%),radial-gradient(circle_at_78%_8%,rgba(130,46,255,0.28),transparent_58%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(9,6,18,0.55),rgba(5,6,12,0.9))]" />
        <div className="absolute inset-0 opacity-[0.18] [background-size:48px_48px] [background-image:linear-gradient(to_right,rgba(106,0,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(106,0,255,0.16)_1px,transparent_1px)]" />
      </div>

      <section className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="inline-flex items-center justify-center gap-2 rounded-full border border-[#7b3dff3d] bg-[#6a00ff1a] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/75">
          Marketplace economics
        </p>
        <h1 className="mt-6 text-3xl sm:text-4xl font-extrabold">How creators monetise their Bothive automations</h1>
        <p className="mt-4 text-white/70">
          List your bots, design your pricing, and tap into recurring revenue. Bothive handles payments, compliance, and customer access so you
          can focus on shipping.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#6a00ff] via-[#7c2dff] to-[#9f7aff] px-5 py-3 text-sm font-semibold text-white transition hover:shadow-[0_12px_32px_rgba(106,0,255,0.35)]"
          >
            Launch seller profile
          </Link>
          <Link
            href="#"
            className="inline-flex items-center gap-2 rounded-xl border border-[#6a00ff29] bg-[#140b26] px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-[#8a4dff66] hover:text-white"
          >
            Download revenue guide
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-12 grid max-w-6xl gap-6 rounded-2xl border border-[#7b3dff33] bg-[#15092b] p-6 md:grid-cols-4">
        {marketplaceNumbers.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-[#6a00ff24] bg-[#0f071f] p-5 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">{stat.label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="relative z-10 mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-3">
        {revenueStreams.map((stream) => (
          <div
            key={stream.title}
            className="rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#150a29] via-[#0c0618] to-[#08040f] p-6"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">Revenue stream</p>
            <h2 className="mt-3 text-xl font-semibold text-white">{stream.title}</h2>
            <p className="mt-3 text-sm text-white/70">{stream.description}</p>
          </div>
        ))}
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-6xl rounded-2xl border border-[#7b3dff33] bg-[#1b0e36] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Revenue split</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm text-white/70">
            <thead className="text-xs uppercase tracking-[0.24em] text-white/60">
              <tr>
                <th className="py-3 pr-4 font-semibold">Item</th>
                <th className="py-3 pr-4 font-semibold">Creator</th>
                <th className="py-3 font-semibold">Bothive</th>
              </tr>
            </thead>
            <tbody>
              {feeTable.map((row) => (
                <tr key={row.item} className="border-t border-[#7b3dff33]">
                  <td className="py-3 pr-4 text-white">{row.item}</td>
                  <td className="py-3 pr-4 text-[#bda6ff]">{row.creator}</td>
                  <td className="py-3 text-[#bda6ff]">{row.bothive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-12 grid max-w-6xl gap-6 rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#170a2f] via-[#0e0619] to-[#08050f] p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Launch checklist</p>
          <p className="text-sm text-white/70">
            Follow this sequence to unlock payouts quickly and keep customers delighted. Each step is documented inside the seller console.
          </p>
          <ul className="space-y-3 text-sm text-white/70">
            {milestones.map((milestone) => (
              <li key={milestone.title} className="rounded-xl border border-[#6a00ff24] bg-[#0f071f] p-4">
                <p className="text-sm font-semibold text-white">{milestone.title}</p>
                <p className="mt-2 text-white/65">{milestone.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 rounded-2xl border border-[#6a00ff24] bg-[#140b26] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Need help?</p>
          <p className="text-sm text-white/70">
            Book a 20-minute session with the marketplace success team. We’ll review pricing models, onboarding friction points, and growth
            opportunities tailored to your bot.
          </p>
          <Link
            href="#"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-gradient-to-r from-[#6a00ff] via-[#7c2dff] to-[#9f7aff] px-4 py-2 text-sm font-semibold text-white transition hover:shadow-[0_12px_32px_rgba(106,0,255,0.35)]"
          >
            Schedule strategy call
          </Link>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-12 max-w-6xl grid gap-6 rounded-2xl border border-[#6a00ff24] bg-gradient-to-br from-[#15092b] via-[#0c0618] to-[#08040f] p-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">FAQ</p>
          <ul className="space-y-3 text-sm text-white/70">
            {faqs.map((entry) => (
              <li key={entry.q} className="rounded-xl border border-[#6a00ff24] bg-[#0f071f] p-4">
                <p className="font-semibold text-white">{entry.q}</p>
                <p className="mt-2 text-white/65">{entry.a}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4 rounded-2xl border border-[#6a00ff24] bg-[#140b26] p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Stay updated</p>
          <p className="text-sm text-white/70">
            Subscribe to marketplace release notes to hear about new payout tools, analytics, and promotional events for creators.
          </p>
          <form className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@bothive.dev"
              className="w-full rounded-xl border border-[#7b3dff33] bg-[#100622] px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-[#a47aff70] focus:outline-none focus:ring-2 focus:ring-[#814dff55]"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-[#6a00ff] via-[#7c2dff] to-[#9f7aff] px-4 py-3 text-sm font-semibold text-white transition hover:shadow-[0_12px_32px_rgba(106,0,255,0.35)]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
