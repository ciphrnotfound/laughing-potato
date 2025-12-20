// import React from "react"


"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { NavDropdown } from "./NavDropdown";

const NAV_GROUPS = [
  {
    title: "Product",
    items: [
      { title: "Features", description: "The neural engine, memory, and security.", href: "/features" },
      { title: "Swarm Builder", description: "Visually architect your agent swarms.", href: "/builder" },
      { title: "Pricing", description: "Start for free, scale with your swarm.", href: "/pricing" },
    ]
  },
  {
    title: "Resources",
    items: [
      { title: "Documentation", description: "Guides, API references, and concepts.", href: "/changelog" }, // Changelog is now Docs
      { title: "Blog", description: "Latest updates and deep dives.", href: "/blog" },
      { title: "Changelog", description: "See what's new in BotHive.", href: "/changelog" },
    ]
  },
  {
    title: "Company",
    items: [
      { title: "Manifesto", description: "Meet the founder and our mission.", href: "/founder" },
      { title: "Careers", description: "Join the core engineering team.", href: "/developers" }, // Careers is /developers
      { title: "Contact", description: "Get in touch with us.", href: "/contact" },
    ]
  }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLinkClick = () => setOpen(false);

  const headerClass = cn(
    "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-colors duration-300",
    "border-[#D5DCFF]/80 bg-white/20", // Light mode
    "dark:border-white/10 dark:bg-[#080A14]/32" // Dark mode
  );

  return (
    <header className={headerClass}>
      <div className="mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center">
          <div className="flex flex-1 items-center gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5BFF]/60"
            >
              <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl">
                <span
                  className={cn(
                    "absolute inset-0 rounded-xl blur-md",
                    "bg-[radial-gradient(circle_at_center,rgba(129,118,255,0.26),transparent_72%)]",
                    "dark:bg-[radial-gradient(circle_at_center,rgba(140,89,255,0.45),transparent_70%)]"
                  )}
                />
                <Image
                  src="/bothive-ai-logo.svg"
                  alt="Bothive Logo"
                  width={36}
                  height={36}
                  className="relative z-[1] h-7 w-7"
                  priority
                />
              </span>
              <span
                className={cn(
                  "hidden text-sm font-semibold tracking-[0.28em] uppercase sm:inline-block transition-colors",
                  "text-[#1F2758]/75 dark:text-white/75"
                )}
              >
                Bothive
              </span>
            </Link>
          </div>

          <nav className="hidden flex-1 justify-center md:flex" aria-label="Primary">
            <ul className="flex items-center gap-2">
              {NAV_GROUPS.map(group => (
                <li key={group.title}>
                  <NavDropdown title={group.title} items={group.items} scrolled={scrolled} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-1 items-center justify-end gap-3">
            <ThemeToggle />
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/signup"
                onClick={onLinkClick}
                className={cn(
                  "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  "border border-[#C5CEFF]/60 text-[#1F2758]/70",
                  "dark:border-white/12 dark:text-white/70"
                )}
              >
                Sign up
              </Link>
              <Link
                href="/signin"
                onClick={onLinkClick}
                className={cn(
                  "inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                  "bg-[#5D6BFF] text-white",
                  "dark:bg-[#6D5BFF]"
                )}
              >
                Log in
              </Link>
            </div>
            <button
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open ? "true" : "false"}
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-md transition md:hidden",
                "text-[#1F2758]/70 hover:bg-[#E8ECFF]",
                "dark:text-white/65 dark:hover:bg-white/10"
              )}
            >
              <svg
                className={cn("h-6 w-6 transform transition-transform duration-300", open ? "rotate-90" : "rotate-0")}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-400 md:hidden",
          open ? "max-h-[600px]" : "max-h-0"
        )}
        aria-hidden={!open}
      >
        <div className="px-4 pb-6 pt-2 bg-white/95 dark:bg-[#080A14]/95 backdrop-blur-xl border-t border-black/5 dark:border-white/5">
          <ul className="flex flex-col gap-4">
            {NAV_GROUPS.map((group) => (
              <li key={group.title} className="space-y-2">
                <div className="text-xs font-semibold uppercase opacity-40 px-2 tracking-wider">{group.title}</div>
                <div className="pl-2 space-y-1">
                  {group.items.map(item => (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block py-2 text-sm font-medium transition-colors",
                        "text-[#1F2758]/80 dark:text-white/80"
                      )}
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-2">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors",
                "border border-[#C5CEFF]/60 text-[#1F2758]/70",
                "dark:border-white/12 dark:text-white/70"
              )}
            >
              Sign up
            </Link>
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors",
                "bg-[#5D6BFF] text-white",
                "dark:bg-[#6D5BFF]"
              )}
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
