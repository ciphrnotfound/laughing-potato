"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, CheckCircle2, Fingerprint, Lock, ArrowRight, Loader2, Scan } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useGlassAlert } from "@/components/ui/glass-alert";
import { cn } from "@/lib/utils";

export default function VerifyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [verified, setVerified] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const { showAlert } = useGlassAlert();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/signin");
        return;
      }
      setLoading(false);
    };
    checkSession();
  }, [router]);

  const handleEnroll = async () => {
    setEnrolling(true);
    setScannerActive(true);
    try {
      // 1. Initiate Enrollment
      // NOTE: Ensure "Enable WebAuthn" is ON in Supabase Dashboard > Authentication > Providers
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'webauthn',
      });

      if (enrollError) throw enrollError;

      // 2. Browser Challenge Handling
      // We must implement the full WebAuthn flow here
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.id
      });

      if (challengeError) throw challengeError;

      const challenge = (challengeData as any).challenge || challengeData;

      const attestation = await navigator.credentials.create({
        publicKey: challenge
      });

      if (!attestation) throw new Error("WebAuthn ceremony failed");

      // 3. Verify the Attestation
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.id,
        challengeId: challengeData.id,
        assertion: attestation as any,
      } as any);

      if (verifyError) throw verifyError;

      // Upon success, visual feedback
      setTimeout(async () => {
        setScannerActive(false);
        setVerified(true);
        await showAlert("Passkey Secured", "Your identity factor has been successfully fused with this device.", "success");

        // Redirect
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }, 2000);

    } catch (error: any) {
      console.error(error);
      setScannerActive(false);
      setEnrolling(false);

      if (error.message?.includes("MFA enroll") || error.message?.includes("disabled")) {
        await showAlert("Feature Locked", "Please enable WebAuthn in your security settings to activate this core.", "warning");
      } else {
        await showAlert("Registration Error", error.message || "Failed to sync biometric data with security core.", "error");
      }
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden">

      {/* Background Gradients - Dark Purple Theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-md w-full px-6 text-center"
      >

        {/* Scanner Visual */}
        <div className="relative w-48 h-48 mx-auto mb-12">

          {/* Outer Rings - Purple/Violet */}
          <motion.div
            animate={{ rotate: scannerActive ? 360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className={cn(
              "absolute inset-0 rounded-full border border-dashed transition-colors duration-500",
              scannerActive ? "border-violet-500/50" : "border-white/10"
            )}
          />
          <motion.div
            animate={{ rotate: scannerActive ? -360 : 0 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className={cn(
              "absolute inset-4 rounded-full border border-dashed transition-colors duration-500",
              scannerActive ? "border-fuchsia-400/30" : "border-white/5"
            )}
          />

          {/* Core */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center backdrop-blur-sm border transition-all duration-500",
              verified ? "bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]" :
                scannerActive ? "bg-violet-500/10 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]" :
                  "bg-white/5 border-white/10"
            )}>
              {verified ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              ) : scannerActive ? (
                <Scan className="w-12 h-12 text-violet-400 animate-pulse" />
              ) : (
                <Fingerprint className="w-12 h-12 text-white/50" />
              )}
            </div>
          </div>

          {/* Scanning Beam */}
          {scannerActive && (
            <motion.div
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-violet-400 shadow-[0_0_15px_rgba(167,139,250,0.8)] z-20"
            />
          )}
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          {verified ? "Identity Verified" : scannerActive ? "Scanning Biometrics..." : "Secure Your Identity"}
        </h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          {verified
            ? "Your device has been successfully registered. You can now use biometric login."
            : "Register your device credentials to enable high-security biometric authentication."}
        </p>

        {/* Action Button */}
        {!verified && (
          <button
            onClick={handleEnroll}
            disabled={enrolling}
            className="group relative w-full h-14 bg-white text-black rounded-xl font-semibold overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-200 via-white to-fuchsia-200 opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
            <span className="relative flex items-center justify-center gap-2">
              {enrolling ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Fingerprint className="w-5 h-5" />
                  Initialize Biometric Setup
                </>
              )}
            </span>
          </button>
        )}

        {/* Skip Link */}
        {!verified && !enrolling && (
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-6 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Skip for now
          </button>
        )}

        {verified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <button
              onClick={() => router.push("/dashboard")}
              className="text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              Proceed to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

      </motion.div>
    </div>
  );
}
