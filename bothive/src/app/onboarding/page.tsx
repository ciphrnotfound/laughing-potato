"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/lib/app-session-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useGlassAlert } from "@/components/ui/glass-alert";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, Brain, Loader2, Rocket,
  Building2, User, Code2, ChevronRight
} from "lucide-react";

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
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/signin");
      } else if (profile?.onboarding_completed) {
        router.push("/dashboard");
      }
    }
  }, [loading, isAuthenticated, profile, router]);

  const handleNext = () => {
    if (currentStep === "welcome") setCurrentStep("identity");
    else if (currentStep === "identity") {
      if (!data.teamName && !data.firstName) {
        showAlert("Input Required", "Please provide a name or organization to continue your sequence.", "error");
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

  const { showAlert } = useGlassAlert();

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      if (!profile?.id) return;

      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile.id,
          firstName: data.firstName,
          lastName: data.lastName,
          teamName: data.teamName,
          role: data.role
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to finalize onboarding");
      }

      // Glass Alert Success
      if (result.promoGranted) {
        await showAlert("Early Bird Unlocked!", "You've successfully claimed the Early Bird promotion.", "success");
      } else {
        await showAlert("Welcome to Bothive", "Your workspace is ready for action.", "success");
      }

      window.location.href = "/dashboard/getting-started";
    } catch (error: any) {
      console.error("Onboarding error:", error);
      // Use Glass Alert for critical errors too
      showAlert("Setup Failed", error.message || "Failed to save profile.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0E] text-[#EEEEEE] flex font-sans antialiased overflow-hidden selection:bg-violet-500/30">

      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-violet-900/10 via-[#0B0C0E] to-[#0B0C0E] opacity-50 pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex h-screen items-center justify-center p-4 lg:p-8">

        <div className="flex w-full max-w-5xl h-[600px] border border-white/5 bg-[#141517]/50 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl shadow-black/50">

          {/* Left Panel: Progress Sideline */}
          <div className="hidden md:flex w-[300px] bg-[#0B0C0E]/50 border-r border-white/5 flex-col p-8 justify-between relative">
            <div>
              <div className="flex items-center gap-2 mb-10">
                <div className="h-6 w-6 bg-gradient-to-tr from-violet-600 to-fuchsia-500 rounded-md flex items-center justify-center shadow-lg shadow-violet-500/20">
                  <span className="font-bold text-[10px] text-white">B</span>
                </div>
                <span className="font-semibold text-[15px] tracking-tight text-white">Bothive</span>
              </div>

              <div className="space-y-1 relative pl-4 border-l border-white/5">
                {/* Active Line Marker */}
                <motion.div
                  className="absolute left-[-1px] w-[1px] bg-violet-500 top-0 h-8"
                  animate={{ top: stepIndex * 44 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                {steps.map((step, idx) => {
                  const isActive = idx === stepIndex;
                  const isCompleted = idx < stepIndex;

                  return (
                    <div key={step.id} className="h-11 flex items-center gap-3">
                      <span className={cn(
                        "text-[13px] font-medium transition-colors duration-200",
                        isActive ? "text-white" : isCompleted ? "text-white/60" : "text-white/20"
                      )}>
                        {step.title}
                      </span>
                      {isCompleted && <Check size={12} className="text-violet-500 ml-auto" />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="text-[11px] text-white/20">
              Step {stepIndex + 1} of {steps.length}
            </div>
          </div>

          {/* Right Panel: Content Form */}
          <div className="flex-1 flex flex-col relative bg-[#141517]/30">
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 max-w-2xl mx-auto w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full"
                >
                  {currentStep === "welcome" && <WelcomeStep onNext={handleNext} />}
                  {currentStep === "identity" && <IdentityStep data={data} setData={setData} onNext={handleNext} onBack={handleBack} />}
                  {currentStep === "role" && <RoleStep data={data} setData={setData} onNext={handleNext} onBack={handleBack} />}
                  {currentStep === "complete" && <CompleteStep data={data} onNext={handleNext} isLoading={isLoading} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Progress Bar (Mobile) */}
            <div className="md:hidden h-1 w-full bg-white/5">
              <div className="h-full bg-violet-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-start text-left">
      <div className="h-12 w-12 bg-[#1F2023] border border-white/5 rounded-xl flex items-center justify-center mb-6">
        <Rocket className="w-6 h-6 text-violet-500" />
      </div>

      <h1 className="text-2xl font-medium text-white mb-2">
        Welcome to Bothive
      </h1>
      <p className="text-[15px] text-[#8A8F98] mb-8 leading-relaxed max-w-sm">
        Let's set up your workspace. It only takes a few moments to configure your autonomous swarm environment.
      </p>

      <button
        onClick={onNext}
        className="group flex items-center gap-2 px-5 py-2.5 rounded-md bg-white text-black text-[13px] font-medium hover:bg-neutral-200 transition-colors"
      >
        Get Started <ArrowRight size={14} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  )
}

function IdentityStep({ data, setData, onNext, onBack }: any) {
  return (
    <div className="w-full">
      <h2 className="text-xl font-medium text-white mb-2">Profile Details</h2>
      <p className="text-[14px] text-[#8A8F98] mb-8">How should your agents address you?</p>

      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-medium text-[#8A8F98] uppercase tracking-wider mb-2">Workspace Name</label>
          <input
            value={data.teamName}
            onChange={(e) => setData({ ...data, teamName: e.target.value })}
            placeholder="Acme Inc."
            className="w-full bg-[#0B0C0E] border border-white/10 rounded-lg px-3 py-2.5 text-[14px] text-white placeholder:text-[#3E4044] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-[#8A8F98] uppercase tracking-wider mb-2">First Name</label>
            <input
              value={data.firstName}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
              placeholder="Jane"
              className="w-full bg-[#0B0C0E] border border-white/10 rounded-lg px-3 py-2.5 text-[14px] text-white placeholder:text-[#3E4044] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#8A8F98] uppercase tracking-wider mb-2">Last Name</label>
            <input
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
              placeholder="Doe"
              className="w-full bg-[#0B0C0E] border border-white/10 rounded-lg px-3 py-2.5 text-[14px] text-white placeholder:text-[#3E4044] focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-10">
        <button onClick={onBack} className="px-4 py-2.5 rounded-md border border-white/10 text-white/60 hover:text-white text-[13px] font-medium transition-colors hover:bg-white/5">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-2.5 rounded-md bg-white text-black font-medium text-[13px] hover:bg-neutral-200 transition-colors">
          Continue
        </button>
      </div>
    </div>
  )
}

function RoleStep({ data, setData, onNext, onBack }: any) {
  const roles = [
    { id: 'business', label: 'Business Owner', icon: Building2, desc: 'Automate operations & sales' },
    { id: 'developer', label: 'Developer', icon: Code2, desc: 'Build custom agents & tools' },
    { id: 'student', label: 'Researcher', icon: Brain, desc: 'Academic research & learning' },
  ];

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium text-white mb-2">Select Role</h2>
      <p className="text-[14px] text-[#8A8F98] mb-8">We'll optimize your agent defaults.</p>

      <div className="space-y-2">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = data.role === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setData({ ...data, role: role.id })}
              className={cn(
                "w-full flex items-center gap-4 p-3 rounded-lg border text-left transition-all duration-200",
                isSelected
                  ? "bg-violet-500/10 border-violet-500/50 shadow-[0_0_15px_-3px_rgba(139,92,246,0.2)]"
                  : "bg-[#0B0C0E] border-white/5 hover:bg-white/5 hover:border-white/10"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded flex items-center justify-center transition-colors",
                isSelected ? "bg-violet-500 text-white" : "bg-[#1F2023] text-white/40"
              )}>
                <Icon size={16} />
              </div>
              <div>
                <h3 className={cn("font-medium text-[13px]", isSelected ? "text-white" : "text-white/80")}>{role.label}</h3>
                <p className="text-[12px] text-[#8A8F98]">{role.desc}</p>
              </div>
              {isSelected && <Check size={16} className="ml-auto text-violet-400" />}
            </button>
          )
        })}
      </div>

      <div className="flex gap-3 mt-10">
        <button onClick={onBack} className="px-4 py-2.5 rounded-md border border-white/10 text-white/60 hover:text-white text-[13px] font-medium transition-colors hover:bg-white/5">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-2.5 rounded-md bg-white text-black font-medium text-[13px] hover:bg-neutral-200 transition-colors">
          Continue
        </button>
      </div>
    </div>
  )
}

function CompleteStep({ data, onNext, isLoading }: any) {
  return (
    <div className="flex flex-col items-center text-center w-full">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="h-16 w-16 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6"
      >
        <Check className="w-8 h-8 text-emerald-400" strokeWidth={3} />
      </motion.div>

      <h2 className="text-2xl font-medium tracking-tight text-white mb-2">You're All Set</h2>
      <p className="text-[#8A8F98] mb-8 text-[15px]">
        Workspace <span className="text-white font-medium">{data.teamName}</span> is ready.
      </p>

      <div className="w-full bg-[#0B0C0E] rounded-xl p-4 mb-8 text-left border border-white/5 space-y-3">
        {[
          "Free credits activated",
          "Bot builder unlocked",
          "API keys generated"
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check size={10} className="text-emerald-500" />
            </div>
            <span className="text-[13px] text-white/80">{item}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full py-3 text-[13px] font-semibold rounded-md bg-white text-black hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Finalizing...
          </>
        ) : (
          <>
            Launch Dashboard <ArrowRight size={16} />
          </>
        )}
      </button>
    </div>
  )
}
