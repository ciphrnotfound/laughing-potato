"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/lib/app-session-context";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
        toast.error("Please provide a name");
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
      });

      if (error) throw error;

      toast.success("You're all set!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex font-sans antialiased overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[100px]" />
      </div>

      {/* Left Panel - Progress */}
      <div className="hidden lg:flex w-[380px] flex-col border-r border-neutral-800/50 bg-black/50 backdrop-blur-xl p-10 relative z-10">
        {/* Logo */}
        <div className="mb-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <IconBrain className="w-6 h-6 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight">Bothive</span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1">
          <div className="space-y-0">
            {steps.map((step, idx) => {
              const isActive = idx === stepIndex;
              const isCompleted = idx < stepIndex;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center gap-4 py-4 border-l-2 pl-6 -ml-px transition-all duration-300",
                    isActive ? "border-violet-500" : isCompleted ? "border-violet-600/50" : "border-neutral-800"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                    isCompleted
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30"
                      : isActive
                      ? "bg-violet-600/20 text-violet-400 border border-violet-500/50"
                      : "bg-neutral-900 text-neutral-600 border border-neutral-800"
                  )}>
                    {isCompleted ? (
                      <IconCheck className="w-4 h-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-colors",
                    isActive ? "text-white" : isCompleted ? "text-violet-400" : "text-neutral-600"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress */}
        <div className="pt-8 border-t border-neutral-800/50">
          <div className="flex justify-between text-xs text-neutral-500 mb-3">
            <span>Setup Progress</span>
            <span className="text-violet-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-violet-600 to-purple-500 shadow-lg shadow-violet-500/50"
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-neutral-800/50 flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <IconBrain className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold">Bothive</span>
          </div>
          <span className="text-sm text-violet-400 font-medium">{stepIndex + 1}/{steps.length}</span>
        </div>

        {/* Content */}
        <main className="flex-1 flex items-center justify-center p-8 lg:p-20">
          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait">
              {currentStep === "welcome" && (
                <WelcomeStep key="welcome" onNext={handleNext} />
              )}
              {currentStep === "identity" && (
                <IdentityStep key="identity" data={data} setData={setData} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === "role" && (
                <RoleStep key="role" data={data} setData={setData} onNext={handleNext} onBack={handleBack} />
              )}
              {currentStep === "complete" && (
                <CompleteStep key="complete" data={data} onNext={handleNext} isLoading={isLoading} />
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

const stepVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative w-20 h-20 mb-8"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 blur-xl opacity-50" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-500/30">
            <IconRocket className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold tracking-tight mb-4"
        >
          Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">Bothive</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-neutral-400 leading-relaxed"
        >
          Configure your workspace and deploy autonomous AI agents to handle your work.
        </motion.p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={onNext}
        className="group inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
      >
        Get Started
        <IconArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </motion.button>
    </motion.div>
  );
}

function IdentityStep({ data, setData, onNext, onBack }: any) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
            <IconBuilding className="w-5 h-5 text-violet-400" />
          </div>
          <span className="text-xs text-violet-400 font-medium uppercase tracking-wider">Step 02</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Your Identity</h2>
        <p className="text-neutral-400">How should we address you?</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm text-neutral-400 mb-2">Organization</label>
          <input
            value={data.teamName}
            onChange={(e) => setData({ ...data, teamName: e.target.value })}
            placeholder="Acme Inc."
            className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3.5 px-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-400 mb-2">First Name</label>
            <input
              value={data.firstName}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
              placeholder="John"
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3.5 px-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-400 mb-2">Last Name</label>
            <input
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
              placeholder="Doe"
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3.5 px-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
        >
          Continue
          <IconArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function RoleStep({ data, setData, onNext, onBack }: any) {
  const roles = [
    { id: 'business', label: 'Business', icon: IconBuilding, desc: 'Operations & sales automation' },
    { id: 'developer', label: 'Developer', icon: IconCode, desc: 'Custom agents & integrations' },
    { id: 'student', label: 'Student', icon: IconUser, desc: 'Research & learning' },
  ];

  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center border border-violet-500/30">
            <IconUser className="w-5 h-5 text-violet-400" />
          </div>
          <span className="text-xs text-violet-400 font-medium uppercase tracking-wider">Step 03</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Select Role</h2>
        <p className="text-neutral-400">We'll personalize your experience.</p>
      </div>

      <div className="space-y-3">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = data.role === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setData({ ...data, role: role.id })}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200",
                isSelected
                  ? "bg-violet-600/10 border-violet-500 shadow-lg shadow-violet-500/10"
                  : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                isSelected
                  ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/30"
                  : "bg-neutral-800 text-neutral-400"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className={cn("font-semibold", isSelected ? "text-white" : "text-neutral-200")}>
                  {role.label}
                </h3>
                <p className="text-sm text-neutral-500">{role.desc}</p>
              </div>
              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                  <IconCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25"
        >
          Continue
          <IconArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

function CompleteStep({ data, onNext, isLoading }: any) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative w-20 h-20 mb-8"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 blur-xl opacity-50" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30">
            <IconSparkles className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold tracking-tight mb-2">Ready to Launch</h2>
        <p className="text-neutral-400">
          <span className="text-white font-medium">{data.teamName || 'Your workspace'}</span> is configured.
        </p>
      </div>

      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-neutral-800">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30">
            {data.teamName ? data.teamName.charAt(0).toUpperCase() : "B"}
          </div>
          <div>
            <div className="font-semibold text-white">{data.teamName || "Workspace"}</div>
            <div className="text-sm text-neutral-500 capitalize">{data.role} Plan</div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-neutral-400">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <IconCheck className="w-3 h-3 text-green-400" />
            </div>
            <span className="text-sm">Dashboard configured</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <IconCheck className="w-3 h-3 text-green-400" />
            </div>
            <span className="text-sm">AI agents ready</span>
          </div>
          <div className="flex items-center gap-3 text-neutral-400">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <IconCheck className="w-3 h-3 text-green-400" />
            </div>
            <span className="text-sm">Integrations available</span>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <IconLoader2 className="w-5 h-5 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            Enter Dashboard
            <IconArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </motion.div>
  );
}
