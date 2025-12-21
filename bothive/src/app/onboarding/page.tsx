"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/lib/app-session-context";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Spotlight } from "@/components/ui/Spotlight";
import {
  IconArrowRight,
  IconArrowLeft,
  IconCheck,
  IconSparkles,
  IconBrain,
  IconLoader2,
  IconRocket,
  IconBuilding,
  IconUser,
  IconCode
} from "@tabler/icons-react";

type OnboardingStep = "welcome" | "identity" | "role" | "complete";

interface OnboardingData {
  teamName: string;
  firstName: string;
  lastName: string;
  role: string;
}

const steps = [
  { id: "welcome", title: "Welcome" },
  { id: "identity", title: "Identity" },
  { id: "role", title: "Role" },
  { id: "complete", title: "Launch" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, loading, isAuthenticated } = useAppSession();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    teamName: "",
    firstName: "",
    lastName: "",
    role: "business"
  });

  const stepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/signin");
  }, [loading, isAuthenticated, router]);

  const handleNext = () => {
    if (currentStep === "welcome") setCurrentStep("identity");
    else if (currentStep === "identity") {
      if (!data.teamName && !data.firstName) {
        toast.error("Please provide a name or organization");
        return;
      }
      setCurrentStep("role");
    }
    else if (currentStep === "role") setCurrentStep("complete");
    else if (currentStep === "complete") completeOnboarding();
  };

  const handleBack = () => {
    if (currentStep === "identity") setCurrentStep("welcome");
    else if (currentStep === "role") setCurrentStep("identity");
    else if (currentStep === "complete") setCurrentStep("role");
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      if (!profile?.id) return;

      const { error } = await supabase.from("user_profiles").upsert({
        user_id: profile.id,
        first_name: data.firstName,
        last_name: data.lastName,
        team_name: data.teamName,
        preferred_name: data.teamName || data.firstName,
        role: data.role,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success("Welcome to Bothive!");
      // Force reload to update session context
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error.message || "Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020204] text-white flex font-sans antialiased overflow-hidden selection:bg-violet-500/30">
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20 z-10 opacity-70" fill="white" />

      {/* Background Grid */}
      <div className="absolute inset-0 bg-[grid-template-columns:linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row h-screen p-4 lg:p-12 gap-8 lg:gap-20 items-center justify-center">

        {/* Left Panel - Visuals & Progress */}
        <div className="hidden lg:flex flex-col justify-between h-full max-h-[600px] w-[320px]">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <IconBrain className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">Bothive</span>
            </div>

            <div className="space-y-6">
              {steps.map((step, idx) => {
                const isActive = idx === stepIndex;
                const isCompleted = idx < stepIndex;
                return (
                  <div key={step.id} className="flex items-center gap-4 group">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                      isActive ? "bg-white text-black scale-110" : isCompleted ? "bg-violet-600 text-white" : "bg-white/5 text-white/40 border border-white/10"
                    )}>
                      {isCompleted ? <IconCheck className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      isActive ? "text-white" : "text-white/40"
                    )}>
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 blur-2xl rounded-full" />
            <div className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
              <div className="flex items-center gap-3 text-sm text-white/80">
                <IconSparkles className="w-4 h-4 text-violet-400" />
                <span>Setup is {Math.round(progress)}% complete</span>
              </div>
              <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-violet-500"
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative rounded-[2rem] bg-[#0c0c12] border border-white/10 shadow-2xl overflow-hidden">
                <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
                <div className="relative p-8 md:p-12 z-10 bg-[#0c0c12]/90 backdrop-blur-xl rounded-[2rem]">

                  {currentStep === "welcome" && <WelcomeStep onNext={handleNext} />}
                  {currentStep === "identity" && <IdentityStep data={data} setData={setData} onNext={handleNext} onBack={handleBack} />}
                  {currentStep === "role" && <RoleStep data={data} setData={setData} onNext={handleNext} onBack={handleBack} />}
                  {currentStep === "complete" && <CompleteStep data={data} onNext={handleNext} isLoading={isLoading} />}

                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="text-center">
      <div className="inline-flex p-4 rounded-3xl bg-violet-500/10 border border-violet-500/20 mb-8 mt-4">
        <IconRocket className="w-10 h-10 text-violet-400" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
        Welcome to Bothive
      </h1>
      <p className="text-lg text-white/50 mb-10 leading-relaxed">
        Let's configure your digital workspace. You're just a few steps away from deploying your first autonomous swarm.
      </p>
      <button
        onClick={onNext}
        className="w-full py-4 text-sm font-bold uppercase tracking-widest rounded-xl bg-white text-black hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Get Started
      </button>
    </div>
  )
}

function IdentityStep({ data, setData, onNext, onBack }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Create your Profile</h2>
      <p className="text-white/50 mb-8 text-sm">How should your agents address you?</p>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Organization / Team</label>
          <input
            value={data.teamName}
            onChange={(e) => setData({ ...data, teamName: e.target.value })}
            placeholder="Acme Corp"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">First Name</label>
            <input
              value={data.firstName}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
              placeholder="John"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Last Name</label>
            <input
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
              placeholder="Doe"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-10">
        <button onClick={onBack} className="px-6 py-4 rounded-xl border border-white/10 text-white/60 hover:text-white font-medium text-sm transition-colors">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-4 rounded-xl bg-white text-black font-bold text-sm tracking-wide hover:opacity-90 transition-all">
          Continue
        </button>
      </div>
    </div>
  )
}

function RoleStep({ data, setData, onNext, onBack }: any) {
  const roles = [
    { id: 'business', label: 'Business Owner', icon: IconBuilding, desc: 'Automate ops & sales' },
    { id: 'developer', label: 'Developer', icon: IconCode, desc: 'Build custom agents' },
    { id: 'student', label: 'Researcher', icon: IconBrain, desc: 'Academic & learning' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Select your Goal</h2>
      <p className="text-white/50 mb-8 text-sm">We'll optimize your default agents based on this.</p>

      <div className="space-y-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = data.role === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setData({ ...data, role: role.id })}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 group",
                isSelected
                  ? "bg-violet-600/20 border-violet-500/50"
                  : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                isSelected ? "bg-violet-500 text-white" : "bg-white/10 text-white/40 group-hover:bg-white/20 group-hover:text-white"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={cn("font-medium text-sm", isSelected ? "text-white" : "text-white/80")}>{role.label}</h3>
                <p className="text-xs text-white/40">{role.desc}</p>
              </div>
              {isSelected && <IconCheck className="ml-auto w-5 h-5 text-violet-400" />}
            </button>
          )
        })}
      </div>

      <div className="flex gap-4 mt-10">
        <button onClick={onBack} className="px-6 py-4 rounded-xl border border-white/10 text-white/60 hover:text-white font-medium text-sm transition-colors">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-4 rounded-xl bg-white text-black font-bold text-sm tracking-wide hover:opacity-90 transition-all">
          Continue
        </button>
      </div>
    </div>
  )
}

function CompleteStep({ data, onNext, isLoading }: any) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 mt-2"
      >
        <IconCheck className="w-8 h-8 text-emerald-400" />
      </motion.div>

      <h2 className="text-3xl font-bold tracking-tight text-white mb-2">You're All Set</h2>
      <p className="text-white/50 mb-8 max-w-sm mx-auto">
        Your workspace <strong className="text-white font-medium">{data.teamName}</strong> has been provisioned.
      </p>

      <div className="bg-white/5 rounded-2xl p-6 mb-8 text-left border border-white/10">
        <div className="flex items-center gap-3 text-sm text-white/80 mb-3">
          <IconCheck className="w-4 h-4 text-emerald-400" />
          <span>Free credits activated</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/80 mb-3">
          <IconCheck className="w-4 h-4 text-emerald-400" />
          <span>Bot builder unlocked</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/80">
          <IconCheck className="w-4 h-4 text-emerald-400" />
          <span>API keys generated</span>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full py-4 text-sm font-bold uppercase tracking-widest rounded-xl bg-white text-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-wait"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <IconLoader2 className="w-4 h-4 animate-spin" /> Finalizing...
          </span>
        ) : (
          "Launch Dashboard"
        )}
      </button>
    </div>
  )
}
