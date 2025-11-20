"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Docs', href: '#docs' },
  ];

  return (
    <header 
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/85 backdrop-blur-md border-b border-white/10 shadow-[0_12px_40px_rgba(12,12,16,0.6)]' 
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="Home">
            <div className="relative h-8 w-8">
              <Image
                src="/logo.png"
                alt="Bothive"
                width={32}
                height={32}
                priority
                className="transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 -z-10 rounded-full bg-white/10 blur-md group-hover:bg-[#a78bfa]/20 transition-colors duration-300" />
            </div>
            <span className="text-lg font-bold text-white tracking-[0.22em]">
              Bothive
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-zinc-200 hover:text-white transition duration-200 relative group transform-gpu will-change-transform"
              >
                <span className="inline-block transition-transform duration-200 group-hover:-translate-y-1">{item.name}</span>
                <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-linear-to-r from-white/80 via-white to-transparent transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/signin"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors duration-200 hover:-translate-y-0.5 transform"
            >
              Sign in
            </Link>
            <Link
              href="/signup?redirect=%2Fgetting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5"
            >
              Get Started
              <svg
                className="ml-1.5 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#a78bfa] focus:ring-offset-2 focus:ring-offset-zinc-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen ? "true" : "false"}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - animated bottom sheet */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              id="mobile-menu"
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[#0b0b0f]/95 border-t border-white/6 p-4 shadow-2xl"
            >
              <div className="mx-auto max-w-3xl">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold">Menu</div>
                  <button
                    aria-label="Close menu"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 hover:bg-zinc-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="grid gap-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block rounded-lg px-4 py-3 text-base font-medium text-white/90 hover:bg-white/5"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                <div className="mt-4 space-y-3">
                  <Link
                    href="/signin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center rounded-lg bg-white/8 px-4 py-3 text-sm font-semibold"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup?redirect=%2Fgetting-started"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black shadow-[0_8px_30px_rgba(124,58,237,0.2)]"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
