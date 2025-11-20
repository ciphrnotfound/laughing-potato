"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type FooterLink = {
  label: string;
  href: string;
  badge?: string;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

const footerSections: FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Overview", href: "#" },
      { label: "Features", href: "#" },
      { label: "Solutions", href: "#", badge: "New" },
      { label: "Tutorials", href: "#" },
      { label: "Pricing", href: "#" },
      { label: "Releases", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "News", href: "#" },
      { label: "Media kit", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Newsletter", href: "#" },
      { label: "Events", href: "#" },
      { label: "Help centre", href: "#" },
      { label: "Tutorials", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Use cases",
    links: [
      { label: "Startups", href: "#" },
      { label: "Enterprise", href: "#" },
      { label: "Government", href: "#" },
      { label: "SaaS centre", href: "#" },
      { label: "Marketplaces", href: "#" },
      { label: "Ecommerce", href: "#" },
    ],
  },
  {
    title: "Social",
    links: [
      { label: "Twitter", href: "#" },
      { label: "LinkedIn", href: "#" },
      { label: "Facebook", href: "#" },
      { label: "GitHub", href: "#" },
      { label: "AngelList", href: "#" },
      { label: "Dribbble", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "Licenses", href: "#" },
      { label: "Settings", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#070910] text-white/80">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(140,137,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(140,137,255,0.08)_1px,transparent_1px)] bg-[length:52px_52px]" />
        <div className="absolute inset-x-0 top-[-200px] h-[480px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,68,255,0.22),transparent_70%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white sm:text-[28px]">
            Let's automate the busy work
          </h2>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            Join the Bothive crew building autonomous swarms that ship faster.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#"
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-[#121726] px-6 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/30 hover:text-white"
            >
              Chat to us
            </Link>
            <Link
              href="#"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-[#633BFF] to-[#8A52FF] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(99,59,255,0.35)] transition hover:brightness-110"
            >
              Get started
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4 text-sm">
              <p className="font-semibold text-white/80">{section.title}</p>
              <ul className="space-y-2 text-white/60">
                {section.links.map((link) => (
                  <li key={link.label} className="flex items-center gap-2">
                    <Link
                      href={link.href}
                      className="transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                    {link.badge ? (
                      <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-[2px] text-[10px] font-semibold uppercase text-white/70">
                        {link.badge}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-3">
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8C89FF] via-[#A9A6FF] to-white shadow-[0_16px_40px_rgba(124,105,255,0.35)]">
              <Image src="/colored-logo (2).png" alt="Bothive" width={22} height={22} className="h-6 w-6" />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Bothive</p>
              <p className="text-xs text-white/45">Mission Control for autonomous teams</p>
            </div>
          </div>
          <p className="text-xs text-white/45">© {new Date().getFullYear()} Bothive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
