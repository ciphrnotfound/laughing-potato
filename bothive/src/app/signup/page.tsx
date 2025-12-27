"use client";

import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { useGlassAlert } from "@/components/ui/glass-alert";

export default function SignUp() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | "auth0" | null>(null);

  const [step, setStep] = useState<"email" | "otp">("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpToken, setOtpToken] = useState(""); // Signed token from server

  const otpInputRef = useRef<HTMLInputElement>(null);
  const { showAlert } = useGlassAlert();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Autofocus OTP input when step changes
  useEffect(() => {
    if (step === "otp" && otpInputRef.current) {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send code");
      }

      setOtpToken(data.token);
      setStep("otp");
      setIsLoading(false);
      await showAlert("Code Sent", `We sent a verification code to ${email}`, "info");
    } catch (error: any) {
      await showAlert("Error", error.message, "error");
      setIsLoading(false);
    }
  };

  const verifyCode = async (code: string) => {
    setIsLoading(true);

    try {
      // 1. Verify code on server
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code, token: otpToken, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid code");
      }

      // 2. Sign in with the returned token hash (Magic Link flow)
      // data.type is usually 'email' (mapped from magiclink)
      const { error } = await supabase.auth.verifyOtp({
        token_hash: data.tokenHash,
        type: 'email', // Use 'email' type for magic link tokens
      });

      if (error) throw error;

      await showAlert("Welcome", "Account verified successfully", "success");
      router.push("/passkey");

    } catch (error: any) {
      await showAlert("Verification Failed", error.message, "error");
      setIsLoading(false);
      setOtp(""); // Clear OTP on error
    }
  };

  const handleOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return;
    verifyCode(otp);
  };

  const handleOAuth = async (provider: "google" | "github" | "auth0") => {
    setOauthLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: { redirectTo: `${window.location.origin}/passkey` },
      });
      if (error) {
        await showAlert("OAuth Failure", `Could not establish connection with ${provider}.`, "error");
        setOauthLoading(null);
      }
    } catch {
      await showAlert("Connection Lost", "OAuth handshake failed. Peer connection reset.", "error");
      setOauthLoading(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#09090b] text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '64px 64px'
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10 md:py-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-105">
            <span className="font-bold text-white text-sm">B</span>
          </div>
          <span className="font-semibold text-lg tracking-tight hidden sm:block">bothive</span>
        </Link>
        <Link href="/signin" className="text-sm text-zinc-400 hover:text-white transition-colors">
          Sign in →
        </Link>
      </header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-160px)] px-6">
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[380px]"
        >
          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <h1 className="text-[28px] font-semibold tracking-tight mb-2">Create your account</h1>
                  <p className="text-zinc-500 text-[15px]">Start building your AI workforce today</p>
                </div>

                {/* OAuth Buttons */}
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => handleOAuth("google")}
                    disabled={!!oauthLoading}
                    className="w-full h-11 bg-white text-black rounded-lg font-medium text-sm flex items-center justify-center gap-2.5 hover:bg-zinc-100 transition-colors disabled:opacity-50"
                  >
                    {oauthLoading === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> :
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                      </>
                    }
                  </button>
                  {/* ... other oauth buttons if needed, kept concise for now or remove if redundant */}
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800" /></div>
                  <div className="relative flex justify-center"><span className="bg-[#09090b] px-4 text-xs text-zinc-600 uppercase tracking-widest">or continue with email</span></div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Full name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="John Doe"
                      className="w-full h-11 px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@company.com"
                      className="w-full h-11 px-4 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !email || !name}
                    className="w-full h-11 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 transition-all mt-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setStep("email")}
                  className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to email
                </button>

                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
                    <Loader2 className="w-6 h-6 text-violet-500" />
                  </div>
                  <h1 className="text-[28px] font-semibold tracking-tight mb-2">Enter code</h1>
                  <p className="text-zinc-500 text-[15px]">
                    We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div className="relative">
                    <input
                      ref={otpInputRef}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="\d{6}"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtp(val);
                        if (val.length === 6) {
                          verifyCode(val);
                        }
                      }}
                      className="w-full h-14 bg-zinc-900/50 border border-zinc-800 rounded-xl text-center text-3xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all placeholder:tracking-normal"
                      placeholder="000000"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full h-11 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 transition-all"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Create Account"}
                  </button>

                  <p className="text-center text-xs text-zinc-500">
                    Didn't receive code?{" "}
                    <button type="button" onClick={handleEmailSubmit} className="text-violet-400 hover:text-violet-300">Resend</button>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full overflow-hidden">
        <div className="relative">
          <div className="flex justify-center">
            <span className="font-black tracking-[-0.05em] select-none whitespace-nowrap opacity-20 text-[120px] bg-gradient-to-b from-white to-transparent bg-clip-text text-transparent">
              BOTHIVE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
