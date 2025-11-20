"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Mail, Lock, Loader2, Moon, Sun, CheckCircle2, Github } from "lucide-react";
import ProfessionalAlert from "@/components/ui/game-alert";
import { motion } from "framer-motion";
import { AuthLoader } from "@/components/ui/auth-loader";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

export default function SignUp() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const [showAlert, setShowAlert] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    autoClose?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isScreenLoading, setIsScreenLoading] = useState(true);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        setShowAlert({
          type: "error",
          title: "Sign up failed",
          message: error.message || "We couldn’t create your workspace account.",
        });
        return;
      }

      setShowAlert({
        type: "success",
        title: "Workspace created",
        message:
          data.session?.access_token
            ? "Redirecting you to the dashboard."
            : "Check your inbox to confirm your email before signing in.",
        autoClose: data.session?.access_token ? 1200 : undefined,
      });

      if (data.session?.access_token) {
        setTimeout(() => {
          window.location.href = "/dashboard/home";
        }, 1200);
      }
    } catch (error) {
      setShowAlert({
        type: "error",
        title: "Unexpected error",
        message: "Please try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider: "google" | "github") => {
    setShowAlert(null);
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setShowAlert({
          type: "error",
          title: "Sign up failed",
          message: error.message || `Could not continue with ${provider === "google" ? "Google" : "GitHub"}.`,
        });
        setOauthLoading(null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown OAuth error";
      setShowAlert({
        type: "error",
        title: "Sign up failed",
        message,
      });
      setOauthLoading(null);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setIsScreenLoading(false), 900);
    return () => clearTimeout(timeout);
  }, []);

  const rootBackground = cn(
    "relative min-h-screen overflow-hidden transition-colors duration-500",
    isDark
      ? "bg-[#070910] text-white"
      : "bg-gradient-to-br from-[#F5F7FF] via-white to-[#E9EEFF] text-[#0C1024]"
  );

  const cardShellClass = cn(
    "pointer-events-none absolute inset-0 rounded-[28px] border backdrop-blur-xl transition-all duration-500",
    isDark
      ? "border-white/12 bg-[#0C1323]/80 shadow-[0_48px_120px_rgba(12,15,35,0.55)]"
      : "border-[#B8C4FF]/40 bg-white/85 shadow-[0_44px_110px_rgba(88,112,255,0.18)]"
  );

  const gridOverlayClass = cn(
    "absolute inset-0 bg-[length:64px_64px]",
    isDark
      ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] opacity-40"
      : "bg-[linear-gradient(to_right,rgba(12,16,36,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(12,16,36,0.08)_1px,transparent_1px)] opacity-70"
  );

  const radialOverlayClass = cn(
    "absolute inset-x-0 top-[-240px] h-[520px] rounded-full",
    isDark
      ? "bg-[radial-gradient(circle_at_center,rgba(108,67,255,0.28),transparent_70%)]"
      : "bg-[radial-gradient(circle_at_center,rgba(99,109,255,0.22),transparent_70%)]"
  );

  const subduedText = isDark ? "text-white/55" : "text-[#0C1024]/55";
  const subtleText = isDark ? "text-white/40" : "text-[#0C1024]/40";
  const strongText = isDark ? "text-white" : "text-[#0C1024]";

  const inputClass = cn(
    "w-full rounded-xl border py-3 pr-4 text-sm transition focus:outline-none focus:ring-2",
    isDark
      ? "border-white/12 bg-black/40 text-white placeholder:text-white/35 focus:border-white/30 focus:ring-white/20"
      : "border-[#D7DEF8] bg-white/90 text-[#0C1024] placeholder:text-[#3B446B]/55 focus:border-[#A3B4F2] focus:ring-[#CDD5FF]"
  );

  const tabWrapperClass = cn(
    "grid grid-cols-2 gap-2 rounded-xl border p-1 text-sm font-medium transition-all",
    isDark ? "border-white/10 bg-black/40" : "border-[#C5CEFF]/60 bg-white/70"
  );

  const primaryTabClass = cn(
    "flex items-center justify-center rounded-lg px-3 py-2 text-white shadow-[0_12px_32px_rgba(20,27,47,0.6)] transition",
    isDark
      ? "bg-[#141B2F]"
      : "bg-gradient-to-r from-[#5F6BFF] to-[#8A9AFF] text-white shadow-[0_16px_40px_rgba(134,149,255,0.28)]"
  );

  const secondaryButtonClass = cn(
    "flex items-center justify-center rounded-lg px-3 py-2 transition",
    isDark ? "text-white/55 hover:text-white" : "text-[#1E2654]/65 hover:text-[#0C1024]"
  );

  const submitButtonClass = cn(
    "flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70",
    isDark
      ? "bg-gradient-to-r from-[#6C43FF] to-[#8A63FF] text-white shadow-[0_16px_40px_rgba(108,67,255,0.35)] hover:brightness-110"
      : "bg-gradient-to-r from-[#5163FF] to-[#7F92FF] text-white shadow-[0_18px_46px_rgba(118,132,255,0.28)] hover:brightness-105"
  );

  const oauthButtonClass = cn(
    "flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60",
    isDark
      ? "border-white/12 bg-black/40 text-white hover:border-white/25 hover:bg-black/50"
      : "border-[#D7DEF8] bg-white/85 text-[#0C1024] hover:border-[#B7C4FF] hover:bg-white"
  );

  return (
    <div className={rootBackground}>
      {isScreenLoading && <AuthLoader />}

      <div className="pointer-events-none absolute inset-0">
        <div className={radialOverlayClass} />
        <div className={gridOverlayClass} />
      </div>

      {showAlert && (
        <ProfessionalAlert
          open
          variant={showAlert.type}
          title={showAlert.title}
          message={showAlert.message}
          autoClose={showAlert.autoClose}
          position="center"
          disableBackdropClose
          onClose={() => setShowAlert(null)}
        />
      )}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full max-w-md"
        >
          <div className={cardShellClass} />
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[28px]">
            <div
              className={cn(
                "absolute inset-0",
                isDark
                  ? "bg-[radial-gradient(circle_at_top,rgba(124,68,255,0.22),transparent_70%)]"
                  : "bg-[radial-gradient(circle_at_top,rgba(104,120,255,0.18),transparent_72%)]"
              )}
            />
            <div
              className={cn(
                "absolute inset-0 mix-blend-screen",
                isDark
                  ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:40px_40px]"
                  : "bg-[linear-gradient(to_right,rgba(14,20,48,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,20,48,0.08)_1px,transparent_1px)] bg-[length:40px_40px]"
              )}
            />
          </div>

          <div className="relative z-10 space-y-8 px-8 py-10 sm:px-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8C89FF] via-[#A3A0FF] to-white shadow-[0_14px_32px_rgba(124,111,255,0.42)]">
                  <Image src="/colored-logo (2).png" alt="Bothive" width={24} height={24} className="h-6 w-6" />
                </div>
                <div>
                  <p className={cn("text-xs font-semibold uppercase tracking-[0.28em]", subduedText)}>Bothive</p>
                  <p className={cn("text-lg font-semibold", strongText)}>Create your hive login</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={cn(
                  "group relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
                  isDark
                    ? "border-white/12 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10"
                    : "border-[#D7DEF8] bg-white/80 text-[#0C1024]/70 hover:border-[#B3C2FF] hover:bg-white"
                )}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
                <span className="sr-only">Toggle theme</span>
              </button>
            </div>

            <div className="space-y-2 text-center">
              <p className={cn("text-sm", subduedText)}>Start your 30-day trial. Cancel anytime.</p>
            </div>

            <div className={tabWrapperClass}>
              <button type="button" className={primaryTabClass}>
                Sign up
              </button>
              <Link href="/signin" className={secondaryButtonClass}>
                Log in
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2 text-left">
                <label
                  htmlFor="name"
                  className={cn("text-xs font-medium uppercase tracking-[0.2em]", subduedText)}
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Enter your name"
                  className={inputClass}
                />
              </div>

              <div className="space-y-2 text-left">
                <label
                  htmlFor="email"
                  className={cn("text-xs font-medium uppercase tracking-[0.2em]", subduedText)}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className={cn("pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", subtleText)} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    className={cn("pl-12", inputClass)}
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <label
                  htmlFor="password"
                  className={cn("text-xs font-medium uppercase tracking-[0.2em]", subduedText)}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className={cn("pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2", subtleText)} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    minLength={8}
                    required
                    placeholder="Create a password"
                    className={cn("pl-12", inputClass)}
                  />
                </div>
              </div>

              <ul className={cn("space-y-2 text-sm", subduedText)}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#9E7BFF]" />
                  Must be at least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#9E7BFF]" />
                  Include one number or symbol
                </li>
              </ul>

              <button
                type="submit"
                disabled={isLoading}
                className={submitButtonClass}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Get started"}
              </button>
            </form>

            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => void handleOAuthSignUp("google")}
                  disabled={oauthLoading === "google" || oauthLoading === "github"}
                  className={oauthButtonClass}
                >
                  {oauthLoading === "google" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                      <path d="M533.5 278.4c0-17.4-1.4-34.1-4.1-50.4H272v95.4h147.5c-6.4 35-25.6 64.7-54.5 84.7v70h88c51.4-47.4 80.5-117.3 80.5-199.7Z" fill="#4285F4" />
                      <path d="M272 544.3c73.8 0 135.8-24.5 181-66.2l-88-70c-24.4 16.4-55.9 25.9-93 25.9-71.5 0-132.1-48.2-153.9-113.1h-90v71.2c45.1 89.9 138.7 152.2 243.9 152.2Z" fill="#34A853" />
                      <path d="M118.1 320.9c-11.3-33.8-11.3-70.2 0-104l-.1-71.3H28c-38.3 76.2-38.3 165.9 0 242.1l90.1-66.8Z" fill="#FBBC05" />
                      <path d="M272 107.7c38.8-.6 76.1 14.2 104.3 41.6l77.9-77.9C407.3 24.5 345.8 0 272 0 166.7 0 73.1 62.3 28 152.3l90 71.2c21.8-64.8 82.4-115.8 154-115.8Z" fill="#EA4335" />
                    </svg>
                  )}
                  <span>Sign up with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleOAuthSignUp("github")}
                  disabled={oauthLoading === "google" || oauthLoading === "github"}
                  className={oauthButtonClass}
                >
                  {oauthLoading === "github" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Github className="h-5 w-5" />}
                  <span>Sign up with GitHub</span>
                </button>
              </div>
              <p className={cn("text-center text-sm", subduedText)}>
                Already have an account?
                <Link
                  href="/signin"
                  className={cn("ml-1 font-semibold hover:underline", isDark ? "text-white" : "text-[#3140A5]")}
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
