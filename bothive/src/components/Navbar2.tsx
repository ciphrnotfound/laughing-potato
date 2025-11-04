// import React from "react"


"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HoverBorderGradient } from "./ui/hover-border-gradient";

type NavItem = { name: string; href: string };

const NAV_ITEMS: NavItem[] = [
  { name: "Features", href: "/features" },
  { name: "Developers", href: "/blog" },     // <- keep /blog (root app route)
  { name: "Company", href: "/pricing" },
  { name: "Blog", href: "/verify" },  // <- use /pricing (not /app/pricing)
  { name: "Changelog", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const THEME = "#5900E2";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLinkClick = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-shadow duration-200 ${
        scrolled ? "shadow-md" : ""
      } bg-transparent backdrop-blur-md border-b border-transparent `}
    >
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* LEFT: logo */}
          <div className="flex items-center flex-1 gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(62,64,149,0.45)]"
            >
              <span className="relative grid overflow-hidden rounded-lg h-9 w-9 place-items-center">
                <span className="absolute inset-0 rounded-lg bg-linear-to-br from-[#3E4095]/20 to-[#5a57d9]/25 blur-sm" />
                <Image
                  src="/colored-logo (2).png"
                  alt="BlockCred"
                  width={36}
                  height={36}
                  className="relative z-1 rounded object-cover"
                  priority
                />
              </span>
              <span className="hidden text-sm font-extrabold tracking-widest text-white sm:inline-block">
                BOTHIVE
              </span>
              
            </Link>
          </div>

          {/* CENTER: nav */}
          <nav className="hidden md:flex md:flex-1 md:justify-center" aria-label="Primary">
            <ul className="flex items-center gap-8">
              {NAV_ITEMS.map((item) => {
                const isActive = active === item.name;
                return (
                  <li key={item.name}>
                    {item.href.startsWith("/") ? (
                      <a
                        href={item.href}
                        onMouseEnter={() => setActive(item.name)}
                        onMouseLeave={() => setActive(null)}
                        onClick={onLinkClick}
                        className="relative inline-block text-sm font-medium text-slate-300 group"
                      >
                        <span
                          className="relative z-[1] inline-block px-1 transition-colors duration-200 group-hover:text-[#3E4095]"
                        //   style={{ textShadow: isActive ? "0 0 20px rgba(62,64,149,0.12)" : "none" }}
                        >
                          {item.name}
                        </span>

                        {/* magnetic hover bg pill */}
                        <span
                          aria-hidden="true"
                          className="absolute transition duration-300 rounded-lg opacity-0 -inset-x-2 -inset-y-2 group-hover:opacity-100"
                          style={{
                            background: "radial-gradient(120px 40px at center, rgba(62,64,149,0.10), transparent 60%)",
                          }}
                        />

                        <span
                          aria-hidden="true"
                          className={`absolute left-1/2 top-[calc(100%+6px)] h-[2px] w-0 -translate-x-1/2 rounded bg-[#3E4095] transition-[width] duration-300 group-hover:w-8`}
                        />

                        <span
                          aria-hidden="true"
                          className={`absolute left-1/2 top-[calc(100%+6px)] h-[6px] w-[6px] -translate-x-1/2 translate-y-[6px] rounded-full bg-[#3E4095] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100`}
                        />
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        onMouseEnter={() => setActive(item.name)}
                        onMouseLeave={() => setActive(null)}
                        onClick={onLinkClick}
                        className="relative inline-block text-sm font-medium text-gray-700 dark:text-slate-300 group"
                      >
                        <span
                          className="relative z-[1] inline-block px-1 transition-colors duration-200 group-hover:text-[#3E4095]"
                          style={{ textShadow: isActive ? "0 0 20px rgba(62,64,149,0.12)" : "none" }}
                        >
                          {item.name}
                        </span>

                        {/* magnetic hover bg pill */}
                        <span
                          aria-hidden="true"
                          className="absolute transition duration-300 rounded-lg opacity-0 -inset-x-2 -inset-y-2 group-hover:opacity-100"
                          style={{
                            background: "radial-gradient(120px 40px at center, rgba(62,64,149,0.10), transparent 60%)",
                          }}
                        />

                        <span
                          aria-hidden="true"
                          className={`absolute left-1/2 top-[calc(100%+6px)] h-[2px] w-0 -translate-x-1/2 rounded bg-[#3E4095] transition-[width] duration-300 group-hover:w-8`}
                        />

                        <span
                          aria-hidden="true"
                          className={`absolute left-1/2 top-[calc(100%+6px)] h-[6px] w-[6px] -translate-x-1/2 translate-y-[6px] rounded-full bg-[#3E4095] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100`}
                        />
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* RIGHT: actions */}
          <div className="flex items-center justify-end flex-1 gap-3">
         
            <Link
              href="/signin"
              className="relative items-center hidden px-4 py-2 overflow-hidden text-sm font-medium text-white rounded-md shadow-sm sm:inline-flex"
              onClick={onLinkClick}
            >
              <span
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${THEME} 0%, #5a57d9 100%)`,
                }}
              />
              <span
                className="absolute inset-0 transition-opacity duration-300 opacity-0 hover:opacity-20"
                style={{ background: "radial-gradient(120px 50px at center, #fff, transparent 60%)" }}
              />
              <span className="relative z-[1]">Join waitlist</span>
            </Link>
                             

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open ? "true" : "false"}
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3E4095]/40 md:hidden"
            >
              <svg
                className={`h-6 w-6 transform transition-transform duration-300 ${open ? "rotate-90" : "rotate-0"}`}
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

      {/* MOBILE MENU */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height] duration-500 ${open ? "max-h-[520px]" : "max-h-0"}`}
        aria-hidden={!open ? "true" : "false"}
      >
        <div className="relative">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-950/80 dark:to-slate-950" />
          <div className="relative px-4 pt-2 pb-6">
            <ul className="flex flex-col gap-1">
              {NAV_ITEMS.map((item, idx) => (
                <li
                  key={item.name}
                  style={{ transitionDelay: `${open ? idx * 40 : 0}ms` }}
                  className={`transform transition-all duration-300 ${open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                >
                  {item.href.startsWith('#') ? (
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group block rounded-lg px-3 py-3 text-base font-medium text-slate-200 transition hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-[0.99]"
                    >
                      <span className="relative">
                        {item.name}
                        <span aria-hidden="true" className="absolute -bottom-1 left-0 h-[2px] w-0 rounded bg-[#3E4095] transition-[width] duration-300 group-hover:w-10" />
                      </span>
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group block rounded-lg px-3 py-3 text-base font-medium text-center text-slate-200 transition hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-[0.99]"
                    >
                      <span className="relative">
                        {item.name}
                        <span aria-hidden="true" className="absolute -bottom-1 left-0 h-[2px] w-0 rounded bg-[#3E4095] transition-[width] duration-300 group-hover:w-10" />
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="w-full h-px my-3 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            <div
              style={{
                background: "linear-gradient(135deg, rgba(62,64,149,0.07), rgba(90,87,217,0.07))",
              }}
              className="relative p-4 overflow-hidden border border-gray-100 rounded-xl"
            >
              <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-[#3E4095]/10 blur-2xl" />
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Continue where you left off</p>
                  <p className="text-xs text-gray-600">Sign in to access your credentials</p>
                </div>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="relative inline-flex items-center px-4 py-2 overflow-hidden text-sm font-medium text-white rounded-full shadow"
                >
                  <span
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${THEME} 0%, #5a57d9 100%)`,
                    }}
                  />
                  <span className="relative z-[1]">Log In</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}