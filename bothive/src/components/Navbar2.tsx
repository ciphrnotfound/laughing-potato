// import React from "react"


"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

type NavItem = { name: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { name: "Features", href: "/features" },
  { name: "Developers", href: "/developers" },
  { name: "Pricing", href: "/pricing" },
  { name: "Blog", href: "/blog" },
  { name: "Changelog", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLinkClick = () => setOpen(false);

  const headerClass = cn(
    "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md",
    isDark ? "border-white/10 bg-[#080A14]/92" : "border-[#D5DCFF]/80 bg-white/90"
  );

  const navItemClass = (href: string) =>
    cn(
      "inline-flex items-center px-1 text-sm font-medium",
      isDark ? "text-white/65" : "text-[#1F2758]/75",
      pathname === href ? (isDark ? "text-white" : "text-[#0C1024]") : undefined
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
                    isDark
                      ? "bg-[radial-gradient(circle_at_center,rgba(140,89,255,0.45),transparent_70%)]"
                      : "bg-[radial-gradient(circle_at_center,rgba(129,118,255,0.26),transparent_72%)]"
                  )}
                />
                <Image
                  src="/colored-logo (2).png"
                  alt="Bothive"
                  width={36}
                  height={36}
                  className="relative z-[1] h-7 w-7"
                  priority
                />
              </span>
              <span
                className={cn(
                  "hidden text-sm font-semibold tracking-[0.28em] uppercase sm:inline-block",
                  isDark ? "text-white/75" : "text-[#1F2758]/75"
                )}
              >
                Bothive
              </span>
            </Link>
          </div>

          <nav className="hidden flex-1 justify-center md:flex" aria-label="Primary">
            <ul className="flex items-center gap-6">
              {NAV_ITEMS.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} onClick={onLinkClick} className={navItemClass(item.href)}>
                    {item.name}
                  </Link>
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
                  "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium",
                  isDark
                    ? "border border-white/12 text-white/70"
                    : "border border-[#C5CEFF]/60 text-[#1F2758]/70"
                )}
              >
                Sign up
              </Link>
              <Link
                href="/signin"
                onClick={onLinkClick}
                className={cn(
                  "inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold",
                  isDark ? "bg-[#6D5BFF] text-white" : "bg-[#5D6BFF] text-white"
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
                isDark
                  ? "text-white/65 hover:bg-white/10"
                  : "text-[#1F2758]/70 hover:bg-[#E8ECFF]"
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

      <div
        className={cn(
          "overflow-hidden transition-[max-height] duration-400 md:hidden",
          open ? "max-h-[460px]" : "max-h-0"
        )}
        aria-hidden={!open}
      >
        <div className="px-4 pb-6 pt-2">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item, idx) => (
              <li
                key={item.name}
                className="border-b border-white/5 last:border-none dark:border-white/10"
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-2 py-3 text-sm font-medium",
                    isDark
                      ? "text-white/80"
                      : "text-[#1F2758]/80"
                  )}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-4 py-3 text-center text-sm font-medium",
                isDark ? "border border-white/12 text-white/70" : "border border-[#C5CEFF]/60 text-[#1F2758]/70"
              )}
            >
              Sign up
            </Link>
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-lg px-4 py-3 text-center text-sm font-semibold",
                isDark ? "bg-[#6D5BFF] text-white" : "bg-[#5D6BFF] text-white"
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