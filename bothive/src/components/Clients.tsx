"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote: "Bothive kicks off every bot launch and keeps our studio shipping without context juggling.",
    name: "Sienna Hewitt",
    handle: "@sienna.ops",
    avatar: "/avatars/sienna.jpg",
  },
  {
    quote: "Mission briefs land polished—from ideation to delivery Bothive handles the heavy lifting.",
    name: "Kari Rasmussen",
    handle: "@kari.ai",
    avatar: "/avatars/kari.jpg",
  },
  {
    quote: "Quality stayed top-notch even as we 10x’d output across squads. The swarm just hums.",
    name: "Amélie Laurent",
    handle: "@amelie.builds",
    avatar: "/avatars/amelie.jpg",
  },
  {
    quote: "Our go-to control center for every automation sprint. Ship rooms love the clarity.",
    name: "Aliah Lane",
    handle: "@aliah_ux",
    avatar: "/avatars/aliah.jpg",
  },
  {
    quote: "Bothive gives exactly what we need to start fast and cut review cycles dramatically.",
    name: "Eduard Franz",
    handle: "@eduardfranz",
    avatar: "/avatars/eduard.jpg",
  },
  {
    quote: "From zero to live autopilots in days. Every launch feels choreographed now.",
    name: "Lily-Rose Chedjou",
    handle: "@lilyrose",
    avatar: "/avatars/lilyrose.jpg",
  },
];

export default function Clients() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sectionClass = cn(
    "relative overflow-hidden py-20 sm:py-28",
    isDark ? "bg-[#060812] text-white" : "bg-[#F7F8FF] text-[#0C1024]"
  );

  const cardClass = cn(
    "flex h-full flex-col gap-4 rounded-2xl border p-6 transition-colors duration-300",
    isDark
      ? "border-white/10 bg-white/5 shadow-[0_16px_40px_rgba(14,10,40,0.55)]"
      : "border-[#D5DCFF] bg-white shadow-[0_24px_50px_rgba(103,117,255,0.08)]"
  );

  const subtleText = isDark ? "text-white/60" : "text-[#1F2758]/60";

  return (
    <section className={sectionClass}>
      <div className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            "absolute inset-x-0 top-[-240px] h-[520px] blur-3xl",
            isDark
              ? "bg-[radial-gradient(circle_at_center,rgba(138,82,255,0.25),transparent_70%)]"
              : "bg-[radial-gradient(circle_at_center,rgba(129,118,255,0.18),transparent_75%)]"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 opacity-50",
            isDark
              ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]"
              : "bg-[linear-gradient(to_right,rgba(23,32,80,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,32,80,0.08)_1px,transparent_1px)] bg-[size:64px_64px]"
          )}
        />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 text-center sm:px-6">
        <div className="space-y-4">
          <p className={cn("text-xs font-semibold uppercase tracking-[0.32em]", subtleText)}>Wall of love</p>
          <h2 className={cn("text-3xl font-semibold sm:text-4xl", isDark ? "text-white" : "text-[#0C1024]")}>Signals from the swarm</h2>
          <p className={cn("mx-auto max-w-2xl text-sm sm:text-base", subtleText)}>
            Hear first-hand how founders and ops leads keep missions aligned with Bothive’s automation layer.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className={cardClass}>
              <div className="flex items-center gap-1 text-[#F7C948]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className={cn("text-sm text-left sm:text-base", isDark ? "text-white/85" : "text-[#101430]/85")}>{item.quote}</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/10">
                  <Image src={item.avatar} alt={item.name} fill className="object-cover" />
                </div>
                <div className="text-left">
                  <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-[#0C1024]")}>{item.name}</p>
                  <p className={cn("text-xs", subtleText)}>{item.handle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
