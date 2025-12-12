"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Sparkles, Bot, Zap, Globe2, Building2, User, Rocket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/lib/app-session-context";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type OnboardingStep = "welcome" | "identity" | "role" | "intelligence" | "complete";

interface OnboardingData {
  teamName: string;
  firstName: string;
  lastName: string;
  role: string;
  agentStyle: "technical" | "playful" | "balanced";
  useCase: string;
}

const steps = [
  { id: "welcome", title: "Welcome", description: "Let's get started" },
  { id: "identity", title: "Identity", description: "Name your workspace" },
  { id: "role", title: "Role", description: "How will you use Bothive?" },
  { id: "intelligence", title: "Intelligence", description: "Customize your AI" },
  { id: "complete", title: "Ready", description: "Launch your dashboard" }
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
    role: "developer",
    agentStyle: "balanced",
    useCase: ""
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
        toast.error("Please provide a team name or your name");
        return;
      }
      setCurrentStep("role");
    }
    else if (currentStep === "role") setCurrentStep("intelligence");
    else if (currentStep === "intelligence") setCurrentStep("complete");
    else if (currentStep === "complete") completeOnboarding();
  };

  const handleBack = () => {
    if (currentStep === "identity") setCurrentStep("welcome");
    else if (currentStep === "role") setCurrentStep("identity");
    else if (currentStep === "intelligence") setCurrentStep("role");
    else if (currentStep === "complete") setCurrentStep("intelligence");
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      if (!profile?.id) return;

      const { error } = await supabase.from("user_profiles").upsert({
        user_id: profile.id,
        first_name: data.firstName,
        last_name: data.lastName,
        team_name: data.teamName, // This is the key field for the dashboard greeting
        preferred_name: data.teamName || data.firstName, // Fallback logic
        role: data.role,
        use_case: data.useCase,
        agent_style: data.agentStyle,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Workspace created!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white flex overflow-hidden relative font-sans selection:bg-violet-500/30">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Sidebar Progress */}
      <div className="w-80 border-r border-white/5 bg-black/20 backdrop-blur-xl p-8 hidden lg:flex flex-col z-10">
        <div className="mb-12 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Bothive</span>
        </div>

        <div className="space-y-6 flex-1">
          {steps.map((step, idx) => {
            const isActive = idx === stepIndex;
            const isCompleted = idx < stepIndex;

            return (
              <div key={step.id} className={cn("relative pl-4 border-l-2 transition-all duration-300", isActive ? "border-violet-500" : isCompleted ? "border-green-500/50" : "border-white/10")}>
                <h4 className={cn("font-medium text-sm mb-0.5", isActive ? "text-white" : "text-white/50")}>{step.title}</h4>
                <p className="text-xs text-white/30">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div>
          <div className="flex justify-between text-xs text-white/40 mb-2">
            <span>Setup Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-violet-500"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10">
        <header className="p-6 flex justify-end lg:hidden">
          <Link href="/" className="text-sm text-white/40 hover:text-white">Exit Setup</Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-2xl">
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
              {currentStep === "intelligence" && (
                <IntelligenceStep key="intelligence" data={data} setData={setData} onNext={handleNext} onBack={handleBack} />
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

// --- Step Components ---

const stepVariants = {
  initial: { opacity: 0, x: 20, scale: 0.98 },
  animate: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.98 }
};

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="text-center"
    >
      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-violet-500/20 to-indigo-500/20 rounded-full flex items-center justify-center mb-8 ring-1 ring-white/10 relative">
        <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20" />
        <Rocket className="w-10 h-10 text-violet-400" />
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 mb-6">
        Welcome to Bothive
      </h1>
      <p className="text-lg text-white/50 max-w-lg mx-auto mb-10 leading-relaxed">
        You're minutes away from deploying your first autonomous workforce. Let's configure your command center.
      </p>

      <button
        onClick={onNext}
        className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-white/90 transition-all hover:scale-105"
      >
        Start Setup
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );
}

function IdentityStep({ data, setData, onNext, onBack }: any) {
  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit">
      <h2 className="text-3xl font-bold mb-2">Establish Identity</h2>
      <p className="text-white/50 mb-8">How should your digital workforce address you?</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">Team or Company Name</label>
          <div className="relative">
            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input
              value={data.teamName}
              onChange={(e) => setData({ ...data, teamName: e.target.value })}
              placeholder="e.g. Stark Industries, Acme Corp"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium"
              autoFocus
            />
          </div>
          <p className="text-xs text-white/30 mt-2 ml-1">This will be displayed on your dashboard header.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">First Name</label>
            <input
              value={data.firstName}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
              placeholder="Tony"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Last Name</label>
            <input
              value={data.lastName}
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
              placeholder="Stark"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-12">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors px-4 py-2">Back</button>
        <button onClick={onNext} className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-violet-600/20">Next Step</button>
      </div>
    </motion.div>
  );
}

function RoleStep({ data, setData, onNext, onBack }: any) {
  const roles = [
    { id: 'business', label: 'Business Owner', icon: Building2, desc: 'Automating operations & sales' },
    { id: 'developer', label: 'Developer', icon: Code, desc: 'Building custom bots & tools' },
    { id: 'student', label: 'Student', icon: User, desc: 'Learning & research assistance' },
  ];

  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit">
      <h2 className="text-3xl font-bold mb-2">Your Role</h2>
      <p className="text-white/50 mb-8">This helps us tailor the available tools.</p>

      <div className="grid gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = data.role === role.id;
          return (
            <div
              key={role.id}
              onClick={() => setData({ ...data, role: role.id })}
              className={cn(
                "flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-200",
                isSelected ? "bg-violet-500/10 border-violet-500 ring-1 ring-violet-500/50" : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
              )}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", isSelected ? "bg-violet-500 text-white" : "bg-white/10 text-white/50")}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className={cn("font-medium text-lg", isSelected ? "text-white" : "text-white/80")}>{role.label}</h3>
                <p className="text-sm text-white/40">{role.desc}</p>
              </div>
              {isSelected && <Check className="ml-auto w-5 h-5 text-violet-400" />}
            </div>
          );
        })}
      </div>

      <div className="flex justify-between mt-12">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors px-4 py-2">Back</button>
        <button onClick={onNext} className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-violet-600/20">Next Step</button>
      </div>
    </motion.div>
  );
}

function IntelligenceStep({ data, setData, onNext, onBack }: any) {
  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit">
      <h2 className="text-3xl font-bold mb-2">Agent Personality</h2>
      <p className="text-white/50 mb-8">Set the default tone for your workforce.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { id: 'technical', label: 'Precise', emoji: '🤖', desc: 'Strict, data-driven, concise.' },
          { id: 'balanced', label: 'Balanced', emoji: '⚖️', desc: 'Professional but conversational.' },
          { id: 'playful', label: 'Creative', emoji: '🎨', desc: 'Warm, engaging, imaginative.' },
        ].map((style) => (
          <div
            key={style.id}
            onClick={() => setData({ ...data, agentStyle: style.id })}
            className={cn(
              "p-6 rounded-2xl border cursor-pointer transition-all h-full flex flex-col items-center text-center hover:scale-105",
              data.agentStyle === style.id ? "bg-white text-black border-transparent shadow-xl" : "bg-white/5 border-white/5 hover:bg-white/10 text-white"
            )}
          >
            <div className="text-4xl mb-4">{style.emoji}</div>
            <h3 className="font-bold text-lg mb-2">{style.label}</h3>
            <p className={cn("text-xs leading-relaxed", data.agentStyle === style.id ? "text-black/60" : "text-white/40")}>{style.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-12">
        <button onClick={onBack} className="text-white/40 hover:text-white transition-colors px-4 py-2">Back</button>
        <button onClick={onNext} className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-violet-600/20">Finalize</button>
      </div>
    </motion.div>
  );
}

function CompleteStep({ data, onNext, isLoading }: any) {
  return (
    <motion.div variants={stepVariants} initial="initial" animate="animate" exit="exit" className="text-center">
      <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/30">
        <Sparkles className="w-10 h-10 text-green-400" />
      </div>

      <h2 className="text-3xl font-bold mb-4">All Systems Go!</h2>
      <p className="text-lg text-white/50 mb-8">
        Your command center at <strong className="text-white">{data.teamName || 'Bothive'}</strong> is ready for deployment.
      </p>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left max-w-sm mx-auto mb-10">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
            {data.teamName ? data.teamName.charAt(0) : "B"}
          </div>
          <div>
            <div className="font-medium text-white">{data.teamName || "My Workspace"}</div>
            <div className="text-xs text-white/40 text-transform capitalize">{data.role} Plan</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Check className="w-4 h-4 text-green-500" /> <span>Dashboard configured</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Check className="w-4 h-4 text-green-500" /> <span>{data.agentStyle} agents active</span>
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={isLoading}
        className="w-full sm:w-auto px-10 py-4 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-wait"
      >
        {isLoading ? "Provisioning..." : "Enter Dashboard"}
      </button>
    </motion.div>
  );
}

// Helper icon
function Code(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}
