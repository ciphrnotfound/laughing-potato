"use client";

import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useGlassAlert } from "@/components/ui/glass-alert";
import Image from "next/image";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/passkey';

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | "auth0" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { showAlert } = useGlassAlert();

  // Welcome Animation State
  const [userMetadata, setUserMetadata] = useState<any>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is already logged in: Show Welcome Animation then redirect
        setUserMetadata(session.user.user_metadata);
        setIsSuccess(true);
        router.push("/passkey");
      } else {
        setMounted(true);
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        await showAlert("Access Denied", error.message || "Invalid credentials provided.", "error");
        setIsLoading(false);
        return;
      }
      // toast.success("Welcome back!"); // Success is handled by custom screen
      router.push(nextUrl);
    } catch (error) {
      await showAlert("System Error", "An error occurred during authentication.", "error");
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github" | "auth0") => {
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: { redirectTo: `${window.location.origin}${nextUrl}` },
      });
      if (error) {
        await showAlert("OAuth Failed", `Could not sign in with ${provider}`, "error");
        setOauthLoading(null);
      }
    } catch {
      await showAlert("Connection Error", "OAuth handshake failed.", "error");
      setOauthLoading(null);
    }
  };

  if (!mounted && !isSuccess) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#0a0a0f] dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }}
      />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fafafa] dark:bg-[#09090b] transition-colors"
          >
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <motion.svg
                width="50"
                height="50"
                viewBox="0 0 100 100"
                className="text-emerald-400"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <circle cx="30" cy="35" r="8" fill="currentColor" />
                <motion.ellipse
                  cx="70" cy="35" rx="8" ry="8" fill="currentColor"
                  initial={{ scaleY: 1 }}
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                />
                <motion.path
                  d="M 20 65 Q 50 90 80 65"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                />
              </motion.svg>
            </div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-[#0a0a0f] dark:text-white mb-2"
            >
              Welcome Back
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-violet-600 dark:text-violet-300"
            >
              {userMetadata?.full_name || "Agent"}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div className="contents">
            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10 md:py-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-105">
                  <Image src="/bothive-ai-logo.svg" width={40} height={40} alt="Logo" />
                </div>
                <span className="font-semibold uppercase text-lg tracking-tight hidden sm:block">Bothive</span>
              </Link>

              <Link
                href="/signup"
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Create account →
              </Link>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-160px)] px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-[360px]"
              >
                {/* Title */}
                <div className="text-center mb-8">
                  <h1 className="text-[28px] font-semibold tracking-tight mb-2">
                    Welcome back
                  </h1>
                  <p className="text-zinc-500 text-[15px]">
                    Sign in to your account to continue
                  </p>
                </div>

                {/* OAuth buttons */}
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => handleOAuth("google")}
                    disabled={!!oauthLoading}
                    className="w-full h-11 bg-white text-black rounded-lg font-medium text-sm flex items-center justify-center gap-2.5 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  >
                    {oauthLoading === "google" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOAuth("github")}
                    disabled={!!oauthLoading}
                    className="w-full h-11 bg-zinc-900 border border-zinc-800 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2.5 hover:bg-zinc-800 hover:border-zinc-700 transition-colors disabled:opacity-50"
                  >
                    {oauthLoading === "github" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        Continue with GitHub
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleOAuth("auth0" as any)}
                    disabled={!!oauthLoading}
                    className="w-full h-11 bg-[#eb5424] text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2.5 hover:bg-[#d94213] transition-colors disabled:opacity-50"
                  >
                    {oauthLoading === "auth0" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21.98 12c0 2.2-1.39 4.09-3.39 4.88-.19.08-.39.14-.59.2-.07.02-.13.04-.2.05-.12.04-.25.07-.37.1-.06.01-.12.03-.18.04-.23.05-.46.08-.7.1-.07.01-.15.01-.22.01h-.04l-.2.01H7.91l-.2-.01h-.04l-.22-.01c-.24-.02-.47-.05-.7-.1-.06-.01-.12-.03-.18-.04-.12-.03-.25-.06-.37-.1-.07-.01-.13-.03-.2-.05-.2-.06-.4-.12-.59-.2C3.39 16.09 2 14.2 2 12s1.39-4.09 3.39-4.88c.19-.08.39-.14.59-.2.07-.02.13-.04.2-.05.12-.04.25-.07.37-.1.06-.01.12-.03.18-.04.23-.05.46-.08.7-.1.07-.01.15-.01.22-.01h.04l.2-.01h8.18l.2.01h.04l.22.01c.24.02.47.05.7.1.06.01.12.03.18.04.12.03.25.06.37.1.07.01.13.03.2.05.2.06.4.12.59.2 2 1.3 3.39 3.19 3.39 5.39zM12 7.7a4.3 4.3 0 1 0 0 8.6 4.3 4.3 0 0 0 0-8.6z" />
                        </svg>
                        Continue with Auth0
                      </>
                    )}
                  </button>

                  {/* Passkey Button */}
                  <button
                    onClick={async () => {
                      try {
                        setIsLoading(true);
                        const { data, error } = await (supabase.auth as any).signInWithWebAuthn();
                        if (error) throw error;
                        if (data) {
                          // showAlert("Bio-Verification", "Biometric verification successful", "success");
                          router.push(nextUrl);
                        }
                      } catch (err: any) {
                        console.error(err);
                        await showAlert("Bio-Link Failed", err.message || "Passkey login failed", "error");
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                    disabled={isLoading || !!oauthLoading}
                    className="relative w-full h-12 mt-2 group overflow-hidden rounded-lg font-medium text-sm flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-600/20 group-hover:from-violet-500/30 group-hover:to-fuchsia-600/30 transition-all duration-500" />
                    <div className="absolute inset-0 border border-violet-500/30 rounded-lg group-hover:border-violet-500/60 transition-colors" />

                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
                    </div>

                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
                    ) : (
                      <>
                        <svg className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.858.571-4.182m1.566-2.564c1.61-2.91 4.79-4.918 8.448-4.918a9.458 9.458 0 018.672 5.926" />
                        </svg>
                        <span className="text-violet-100 group-hover:text-white transition-colors tracking-wide">
                          BIOMETRIC ACCESS
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#fafafa] dark:bg-[#09090b] px-4 text-xs text-zinc-500 dark:text-zinc-600 uppercase tracking-widest transition-colors">
                      or continue with email
                    </span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-2" htmlFor="email">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      className="w-full h-11 px-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-[#0a0a0f] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-zinc-600 dark:text-zinc-400" htmlFor="password">
                        Password
                      </label>
                      <Link href="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        className="w-full h-11 px-4 pr-11 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-[#0a0a0f] dark:text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email || !password}
                    className="w-full h-11 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer link */}
                <p className="text-center text-sm text-zinc-500 mt-8">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
                    Sign up for free
                  </Link>
                </p>
              </motion.div>
            </main>

            {/* Footer with large brand text */}
            <footer className="relative z-10 w-full overflow-hidden">
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="flex justify-center"
                >
                  <span
                    className="font-black tracking-[-0.05em] select-none whitespace-nowrap"
                    style={{
                      fontSize: 'clamp(100px, 25vw, 320px)',
                      lineHeight: 0.8,
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 80%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    BOTHIVE
                  </span>
                </motion.div>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
