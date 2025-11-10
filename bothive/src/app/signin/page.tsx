"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Mail, Lock, Loader2, Chrome, Github } from "lucide-react"
import ProfessionalAlert from "@/components/ui/game-alert";
import { motion } from "framer-motion";
import { AuthLoader } from "@/components/ui/auth-loader";

export default function SignIn() {
  const [showAlert, setShowAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setShowAlert({
          type: "error",
          title: "Sign In Failed",
          message: data.error || "Invalid credentials",
        });
        return;
      }

      setShowAlert({
        type: "success",
        title: "Welcome Back",
        message: "You have been successfully signed in. Redirecting...",
      });

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      setShowAlert({
        type: "error",
        title: "Error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setIsScreenLoading(false), 900);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#05020E] via-[#070214] to-[#11062C] text-white">
      {isScreenLoading && <AuthLoader />}

      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-35"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 18%, rgba(94,54,173,0.24), transparent 45%), radial-gradient(circle at 82% 12%, rgba(58,28,99,0.28), transparent 48%), radial-gradient(circle at 88% 85%, rgba(83,37,148,0.24), transparent 52%)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(141,99,255,0.22)_1px,transparent_1px),linear-gradient(to_bottom,rgba(141,99,255,0.22)_1px,transparent_1px)] bg-[length:48px_48px] opacity-[0.18]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:14px_14px] opacity-[0.12]" />
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,8,32,0.8),rgba(14,8,32,0.92))]"
          animate={{ opacity: [0.72, 0.78, 0.72] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {showAlert && (
        <ProfessionalAlert
          type={showAlert.type}
          title={showAlert.title}
          message={showAlert.message}
          onClose={() => setShowAlert(null)}
        />
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center justify-center px-4 pb-16 pt-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full space-y-8"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/8">
              <Image src="/Logo2.png" alt="Bothive" width={36} height={36} className="h-9 w-9" priority />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-white/95">Sign in to Bothive</h1>
              <p className="text-sm text-white/60">Access your orchestrations and agent workspace.</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
            >
              <Chrome className="h-4 w-4" />
              Continue with Google
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border.white/15 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-white/30 hover:bg-white/10"
            >
              <Github className="h-4 w-4" />
              Continue with GitHub
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="h-px w-full bg-white/10" />
            <span className="absolute bg-[#080314] px-4 text-[11px] uppercase tracking-[0.3em] text-white/45">
              Or
            </span>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            onSubmit={handleSubmit}
            className="relative w-full space-y-5 overflow-hidden rounded-3xl border border-white/12 bg-[#0B0618]/85 p-6 shadow-[0_25px_70px_rgba(6,3,18,0.55)] backdrop-blur-xl sm:p-8"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:30px_30px] opacity-20" />
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(142,104,255,0.18),transparent_60%)]"
                animate={{ opacity: [0.18, 0.32, 0.2, 0.18], scale: [1, 1.04, 0.99, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-[0.18em] text-white/65">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-white/12 bg-[#060313]/70 px-4 py-3 text-sm text-white placeholder:text-white/40 transition focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
                placeholder="you@bothive.dev"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-white/65">
                <label htmlFor="password">Password</label>
                <Link href="#" className="text-[11px] font-normal tracking-normal text-white/60 underline-offset-4 hover:text-white/80">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full rounded-xl border border-white/12 bg-[#060313]/70 px-4 py-3 text-sm text-white placeholder:text-white/40 transition focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/15"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl border border-white/15 bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              <div className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </div>
              <span className="absolute inset-0 block translate-x-[-100%] bg-gradient-to-r from-transparent via-black/15 to-transparent opacity-0 transition group-hover:opacity-100" />
            </button>

            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">Bothive • Access layer</p>
          </motion.form>

          <p className="text-center text-xs text-white/60">
            Need an account?{" "}
            <Link href="/signup" className="text-white/80 underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}