"use client";

import Link from "next/link";
import React, { useState } from "react";
import { ArrowLeft, Loader2, Mail, Lock, User } from "lucide-react";
import { ProfessionalAlert } from "@/components/ui/professional-alert";
import { motion } from "framer-motion";

export default function SignUp() {
  const [showAlert, setShowAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
          type: "error",
          title: "Signup Failed",
          message: data.error || "Failed to create account",
        });
        return;
      }

      setShowAlert({
        type: "success",
        title: "Account Created",
        message: "Your Bothive account has been successfully created. Redirecting...",
      });

      // Redirect to signin after 1.5 seconds
      setTimeout(() => {
        window.location.href = "/signin";
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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4 py-16 sm:px-6 lg:px-8">
      {/* Mobile-optimized grid background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="h-full w-full bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[2rem_2rem] sm:bg-size-[4rem_4rem] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Enhanced gradient overlays for mobile */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-purple-950/30 via-black/20 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,#000_70%)]" />
      </div>
      
      {/* Animated purple ring */}
      <div className="pointer-events-none fixed">
        <div className="h-screen w-screen animate-[spin_10s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,transparent_0%,#7c3aed10_50%,transparent_100%)]" />
      </div>

      {showAlert && (
        <ProfessionalAlert
          type={showAlert.type}
          title={showAlert.title}
          message={showAlert.message}
          onClose={() => setShowAlert(null)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute left-0 right-0 top-0 flex justify-center p-4 sm:justify-start"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/70 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back home</span>
        </Link>
      </motion.div>

      <div className="relative w-full max-w-md">
        {/* Enhanced glow effect */}
        <div className="pointer-events-none absolute -inset-x-20 -top-40 -z-10 h-120 w-full">
          <div className="absolute inset-0 rounded-[40rem] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_50%,rgba(124,58,237,0.3)_360deg)] opacity-40 blur-[100px]" />
          <div className="absolute inset-0 rounded-[40rem] bg-purple-500/10 mix-blend-overlay blur-[120px]" />
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
          className="relative mx-auto w-full space-y-6 rounded-xl border border-white/10 bg-black/80 backdrop-blur-2xl p-5 sm:p-8 lg:p-10 shadow-2xl"
        >
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-sm sm:text-base text-white/60">
              Join Bothive and start building with AI agents
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-white/90 flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-white/90 flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-white/90 flex items-center gap-2"
              >
                <Lock className="h-4 w-4" />
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm sm:text-base text-white placeholder:text-white/40 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors"
                placeholder="••••••••"
              />
              <p className="text-xs text-white/50">
                Must be at least 8 characters
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-lg bg-linear-to-r from-purple-600 to-purple-700 py-3 text-sm sm:text-base font-semibold text-white transition-all hover:from-purple-700 hover:to-purple-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-purple-500/20"
            >
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </div>
            </button>

            <p className="text-center text-sm sm:text-base">
              <span className="text-white/60">Already have an account?</span>{" "}
              <Link
                href="/dashboard"
                className="group relative font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Sign in
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-linear-to-r from-purple-400/40 via-purple-400 to-purple-400/40 transition-all group-hover:w-full" />
              </Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
