
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Delete, CheckCircle2, ChevronRight, ScanFace, KeyRound, Fingerprint } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PasskeyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState<string[]>([]);
  const [mode, setMode] = useState<"setup" | "verify" | "confirm">("verify");
  const [confirmPin, setConfirmPin] = useState<string[]>([]);
  const [userMetadata, setUserMetadata] = useState<any>(null);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  // Animation States
  const [shake, setShake] = useState(false);

  // State for success animation
  const [isSuccess, setIsSuccess] = useState(false);
  const [iconSuccess, setIconSuccess] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/signin");
        return;
      }

      const metadata = session.user.user_metadata;
      setUserMetadata(metadata);

      // If user has a 'quick_pin', go to verify, else setup
      if (metadata?.quick_pin) {
        setMode("verify");
      } else {
        setMode("setup");
      }

      // Smart Biometric Detection
      if (window.PublicKeyCredential &&
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()) {
        setBiometricAvailable(true);
      }

      setLoading(false);
    };
    init();
  }, [router]);

  // Helper for success handling
  const handleSuccess = () => {
    setIconSuccess(true); // 1. Immediate Icon Feedback (Mini Wink)

    // 2. Wait 800ms, then show Full Screen Welcome
    setTimeout(() => {
      setIsSuccess(true);
      // 3. Wait another 2s, then Redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }, 800);
  };

  const handleNumberClick = (num: number) => {
    if (pin.length < 6) {
      setPin((prev) => [...prev, num.toString()]);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSuccess || loading) return;

      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(parseInt(e.key));
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSuccess, loading]); // Dependencies to ensure fresh state access if needed, though setPin uses functional update

  const localBiometricEnroll = async () => {
    // Fallback: Local Device Enrollment (Client-Side Only)
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "BotHive Secure", id: window.location.hostname },
        user: {
          id: new Uint8Array(16),
          name: userMetadata?.email || "user",
          displayName: "User"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }, { alg: -257, type: "public-key" }],
        authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
        timeout: 60000
      }
    });

    if (!credential) throw new Error("Local enrollment failed");

    // Save local flag
    localStorage.setItem("bothive_bio_enabled", "true");
    toast.success("Device Biometrics Linked (Local Mode)");
    handleSuccess();
  };

  const localBiometricVerify = async () => {
    // Fallback: Local Device Verification
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const credential = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: "required"
      }
    });

    if (!credential) throw new Error("Biometric verification failed");

    toast.success("Identity Verified (Local Mode)");
    handleSuccess();
  };

  const handleBiometric = async () => {
    if (!biometricAvailable) {
      toast.error("Biometrics not supported on this device.");
      return;
    }

    toast.info("Scanning Biometrics...");

    // Strategy: Try Server (Supabase) first -> Catch Error -> Try Local Fallback
    try {
      const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'webauthn',
        friendlyName: 'Device Biometrics',
      });

      if (enrollError) throw enrollError;

      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollData.id,
      });

      if (challengeError) throw challengeError;

      const challenge = (challengeData as any).challenge || challengeData;

      const attestation = await navigator.credentials.create({
        publicKey: challenge
      });

      if (!attestation) throw new Error("Biometric pairing failed");

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollData.id,
        challengeId: challengeData.id,
        assertion: attestation as any,
      } as any);

      if (verifyError) throw verifyError;

      toast.success("Identity Verified");
      handleSuccess();

    } catch (error: any) {
      console.warn("Server WebAuthn failed, attempting local fallback:", error);

      // If it's the configuration error (422), fail over to Local Mode silently (or with notice)
      if (error.status === 422 || error.message?.includes("disabled") || error.message?.includes("MFA enroll")) {
        try {
          if (mode === 'verify' && localStorage.getItem("bothive_bio_enabled")) {
            await localBiometricVerify();
          } else {
            await localBiometricEnroll();
          }
        } catch (localErr) {
          toast.error("Biometrics failed. Please use PIN.");
        }
      } else {
        toast.error("Verification failed. Use PIN.");
      }
    }
  };

  // Auto-submit when pin reaches 6 digits
  useEffect(() => {
    if (pin.length === 6) {
      processPin();
    }
  }, [pin]);

  const processPin = async () => {
    // Artificial delay for UX
    await new Promise(r => setTimeout(r, 400));

    if (mode === "setup") {
      setConfirmPin(pin);
      setPin([]);
      setMode("confirm");
      toast("Confirm your new Passcode");
    }
    else if (mode === "confirm") {
      if (pin.join("") === confirmPin.join("")) {
        // Save to Supabase
        const { error } = await supabase.auth.updateUser({
          data: { quick_pin: pin.join("") }
        });

        if (error) {
          toast.error("Failed to save Passcode");
          setPin([]);
          setMode("setup");
        } else {
          toast.success("Passcode Secured");
          handleSuccess();
        }
      } else {
        toast.error("Passcodes do not match. Try again.");
        setConfirmPin([]);
        setPin([]);
        setMode("setup");
      }
    }
    else if (mode === "verify") {
      if (userMetadata?.quick_pin === pin.join("")) {
        // Success handled by state change, which triggers icon "nod" color change
        handleSuccess();
      } else {
        toast.error("Invalid Passcode");
        triggerShake(); // Trigger the shake animation
        setPin([]);
      }
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-sans">

      {/* Background Gradients - Dark Purple Theme */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-violet-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-fuchsia-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="flex flex-col items-center justify-center z-20 text-center"
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
                {/* Left Eye */}
                <circle cx="30" cy="35" r="8" fill="currentColor" />

                {/* Right Eye (Wink Animation) */}
                <motion.ellipse
                  cx="70" cy="35" rx="8" ry="8" fill="currentColor"
                  initial={{ scaleY: 1 }}
                  animate={{ scaleY: [1, 0.1, 1] }}
                  transition={{ delay: 0.8, duration: 0.3 }}
                />

                {/* Smile (Draw Animation) */}
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
              className="text-3xl font-bold text-white mb-2"
            >
              Welcome Back
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-violet-300"
            >
              {userMetadata?.full_name || "Agent"}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="numpad"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center"
          >

            {/* Header Icon */}
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
              <motion.div
                animate={
                  iconSuccess
                    ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0], filter: "drop-shadow(0 0 10px #10b981)" }
                    : shake
                      ? { x: [0, -10, 10, -10, 10, 0], color: "#ef4444" }
                      : pin.length === 0 && configError
                        ? { x: [0, -10, 10, -10, 10, 0] }
                        : {}
                }
                transition={{ duration: 0.4 }}
                className={cn(
                  "w-16 h-16 border rounded-2xl flex items-center justify-center backdrop-blur-md relative z-10 transition-colors duration-500",
                  iconSuccess ? "bg-emerald-500/10 border-emerald-500/50" : shake ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"
                )}
              >
                {iconSuccess ? (
                  <motion.svg
                    width="32"
                    height="32"
                    viewBox="0 0 100 100"
                    className="text-emerald-400"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    <circle cx="30" cy="35" r="8" fill="currentColor" />
                    <motion.ellipse
                      cx="70" cy="35" rx="8" ry="8" fill="currentColor"
                      initial={{ scaleY: 1 }}
                      animate={{ scaleY: [1, 0.1, 1] }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    />
                    <motion.path
                      d="M 20 65 Q 50 90 80 65"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.1, duration: 0.6 }}
                    />
                  </motion.svg>
                ) : shake ? (
                  <motion.svg
                    width="32"
                    height="32"
                    viewBox="0 0 100 100"
                    className="text-red-500"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                  >
                    {/* Left Eye (X) */}
                    <path d="M 25 25 L 35 35 M 35 25 L 25 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />

                    {/* Right Eye (X) */}
                    <path d="M 65 25 L 75 35 M 75 25 L 65 35" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />

                    {/* Frown */}
                    <motion.path
                      d="M 25 75 Q 50 55 75 75"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                ) : mode === 'verify' ? (
                  <Lock className={cn("w-8 h-8 transition-colors", shake ? "text-red-400" : pin.length > 0 ? "text-violet-200" : "text-zinc-500")} />
                ) : (
                  <KeyRound className="w-8 h-8 text-fuchsia-200" />
                )}
              </motion.div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold tracking-tight mb-2">
              {mode === 'setup' ? "Create Passcode" : mode === 'confirm' ? "Confirm Passcode" : "Enter Passcode"}
            </h1>
            <p className="text-zinc-500 text-sm mb-10">
              {mode === 'verify' ? "Enter your 6-digit secure PIN" : "Set up a PIN for quick access"}
            </p>

            {/* Config Error Alert */}
            {configError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-4 w-full bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-200 text-left"
              >
                <p className="font-semibold mb-1 flex items-center gap-2">
                  <Delete className="w-4 h-4" /> Setup Required
                </p>
                <p className="opacity-80">{configError}</p>
              </motion.div>
            )}

            {/* PIN Display */}
            <div className="flex gap-4 mb-12">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    scale: i < pin.length ? 1.2 : 1,
                    backgroundColor: i < pin.length ? (mode === 'verify' ? "#8b5cf6" : "#e879f9") : "rgba(255,255,255,0.1)"
                  }}
                  className="w-4 h-4 rounded-full transition-colors duration-200"
                />
              ))}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-[280px] mb-12">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num)}
                  className="w-20 h-20 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 transition-all border border-white/5 flex items-center justify-center text-2xl font-light focus:outline-none backdrop-blur-sm"
                >
                  {num}
                </button>
              ))}

              {/* Bottom Row - Smart Biometrics */}
              <div className="flex items-center justify-center relative">
                {biometricAvailable ? (
                  <button
                    onClick={handleBiometric}
                    title="Use FaceID / TouchID"
                    className="w-16 h-16 rounded-full flex items-center justify-center text-violet-400 hover:text-white transition-colors bg-violet-500/5 hover:bg-violet-500/20 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ScanFace className="w-6 h-6 absolute transition-all duration-500 group-hover:opacity-0 group-hover:scale-50" />
                    <Fingerprint className="w-6 h-6 absolute transition-all duration-500 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100" />
                  </button>
                ) : (
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-zinc-800 bg-white/5 border border-white/5 cursor-not-allowed">
                    <Lock className="w-5 h-5 text-zinc-700" />
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNumberClick(0)}
                className="w-20 h-20 rounded-full bg-white/5 hover:bg-white/10 active:bg-white/20 transition-all border border-white/5 flex items-center justify-center text-2xl font-light focus:outline-none backdrop-blur-sm"
              >
                0
              </button>

              <div className="flex items-center justify-center">
                <button
                  onClick={handleDelete}
                  className="w-16 h-16 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors focus:outline-none"
                >
                  <Delete className="w-7 h-7" />
                </button>
              </div>
            </div>

            <button onClick={() => router.push('/dashboard')} className="text-zinc-600 hover:text-white text-xs tracking-widest uppercase transition-colors">
              Cancel
            </button>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
