"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Mail, Lock, Loader2, Chrome, Github, User } from "lucide-react";
import ProfessionalAlert from "@/components/ui/game-alert";
import { motion } from "framer-motion";
import { AuthLoader } from "@/components/ui/auth-loader";

export default function SignUp() {
  const [showAlert, setShowAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setShowAlert({
          variant: "error",
          title: "Signup Failed",
          message: data.error || "Failed to create account",
        });
        return;
      }

      setShowAlert({
        variant: "success",
        title: "Account Created",
        message: "Your Bothive account has been successfully created. Redirecting...",
      });

      // Redirect to signin after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/signin";
      }, 1500);
    } catch (error) {
      setShowAlert({
        variant: "error",
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#04020A] via-[#090417] to-[#12062A] text-white">
      {isScreenLoading && <AuthLoader />}

      <div className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage:
              "radial-gradient(circle at 10% 15%, rgba(139,92,246,0.25), transparent 45%), radial-gradient(circle at 82% 8%, rgba(88,28,135,0.2), transparent 40%), radial-gradient(circle at 90% 85%, rgba(71,12,134,0.25), transparent 45%)",
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05)_7%,transparent_12%),linear-gradient(-120deg,rgba(255,255,255,0.03)_7%,transparent_12%)] bg-[length:160px_160px] opacity-[0.22]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(140,88,255,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(140,88,255,0.25)_1px,transparent_1px)] bg-[length:42px_42px] opacity-[0.22]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(13,5,29,0.8)_1px,transparent_1px),linear-gradient(to_bottom,rgba(13,5,29,0.8)_1px,transparent_1px)] bg-[length:12px_12px] opacity-[0.18] mix-blend-screen" />
      </div>

      <ProfessionalAlert
        open={Boolean(showAlert)}
        variant={showAlert?.variant}
        title={showAlert?.title}
        message={showAlert?.message}
        onClose={() => setShowAlert(null)}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 flex w-full items-center justify-between text-[11px] uppercase tracking-[0.35em] text-white/50"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-white/70 transition hover:border-white/30 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="tracking-normal">Back home</span>
          </Link>
          <span>Bothive</span>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="w-full space-y-6 rounded-3xl border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(110,60,255,0.18),#0A0616)] px-6 py-8 shadow-[0_30px_80px_rgba(6,3,18,0.65)] backdrop-blur-xl sm:px-9"
        >
          <div className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white/80 shadow-[0_15px_40px_rgba(88,28,135,0.35)]">
              <User className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/60">Create account</p>
              <h1 className="text-2xl font-semibold text-white/95">Deploy your Bothive profile</h1>
              <p className="text-sm text-white/65">
                Provision credentials to access orchestrations, analytics, and monetisation tools.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">Continue with</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-[#A07BFF]/40 hover:bg-white/10"
                >
                  <Chrome className="h-4 w-4" />
                  Google
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:border-[#A07BFF]/40 hover:bg-white/10"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="h-px w-full bg-white/10" />
              <span className="absolute bg-[#0A041A] px-4 text-[11px] uppercase tracking-[0.3em] text-white/45">
                Or use email
              </span>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/65">
                <User className="h-4 w-4 text-[#B5A2FF]" />
                Handle
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-xl border border-white/12 bg-[#080313]/80 px-4 py-3 text-sm text-white placeholder:text-white/35 transition focus:border-[#B5A2FF]/40 focus:outline-none focus:ring-2 focus:ring-[#B5A2FF]/20"
                placeholder="NovaArchitect"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/65">
                <Mail className="h-4 w-4 text-[#B5A2FF]" />
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-xl border border-white/12 bg-[#080313]/80 px-4 py-3 text-sm text-white placeholder:text-white/35 transition focus:border-[#B5A2FF]/40 focus:outline-none focus:ring-2 focus:ring-[#B5A2FF]/20"
                placeholder="you@bothive.dev"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/65">
                <Lock className="h-4 w-4 text-[#B5A2FF]" />
                Password
              </label>
              <div className="rounded-xl border border-white/12 bg-[#080313]/80 p-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-transparent bg-transparent px-2 py-2 text-sm text-white placeholder:text-white/40 transition focus:border-[#B5A2FF]/40 focus:outline-none focus:ring-2 focus:ring-[#B5A2FF]/20"
                  placeholder="Use at least 8 characters"
                />
                <p className="mt-1 px-2 text-xs text-white/45">Include numbers and symbols for maximum integrity.</p>
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border border-white/12 bg-[#0C0C0C]/70 p-4 text-xs text-white/55">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 cursor-pointer rounded border-white/25 bg-black accent-[#B5A2FF]"
              />
              <span>
                I agree to the {" "}
                <a className="text-[#CBB5FF] underline-offset-2 hover:underline" href="#">
                  Terms of Service
                </a>{" "}
                and {" "}
                <a className="text-[#CBB5FF] underline-offset-2 hover:underline" href="#">
                  Privacy Policy
                </a>
              </span>
            </label>
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
                  <span>Deploy profile</span>
                </>
              ) : (
                <span>Deploy profile</span>
              )}
            </div>
            <span className="absolute inset-0 block translate-x-[-100%] bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
          </button>

          <div className="flex items-center justify-between text-xs text-white/65">
            <p>Need to log in instead?</p>
            <Link href="/signin" className="inline-flex items-center gap-2 text-white/80 underline-offset-2 hover:underline">
              Switch to sign in
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
