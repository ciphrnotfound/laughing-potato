"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import HiveMind from "@/components/HiveMind";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { useAppSession } from "@/lib/app-session-context";
import { toast } from "sonner";
import FullPageLoader from "@/components/FullPageLoader";
import { DeadlineProvider } from "@/lib/deadline-context";
import DeadlineTicker from "@/components/DeadlineTicker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [forceShow, setForceShow] = useState(false);
  const { profile, loading: sessionLoading, isAuthenticated } = useAppSession();

  // Timeout fallback - don't block dashboard for more than 2 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (sessionLoading) {
        setForceShow(true);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [sessionLoading]);

  useEffect(() => {
    if (sessionLoading && !forceShow) return;

    if (!isAuthenticated && !forceShow) {
      router.push("/signin");
      return;
    }

    // Waitlist restriction removed as per user request

    // Admin bypass for onboarding
    const isAdmin = profile?.email === "akinlorinjeremiah@gmail.com";
    if (isAdmin) {
      setChecking(false);
      return;
    }

    if (!profile?.onboardingCompleted && isAuthenticated) {
      if (!pathname?.includes("/onboarding")) {
        toast("Please complete your setup first.");
        router.push("/onboarding");
      }
    }

    setChecking(false);
  }, [router, pathname, profile, sessionLoading, isAuthenticated, forceShow]);

  // Show loader only if still loading AND not timed out
  if (sessionLoading && !forceShow) {
    return <FullPageLoader />;
  }

  return (
    <DeadlineProvider>
      <div
        className={cn(
          "min-h-screen w-full flex flex-col md:flex-row flex-1 mx-auto overflow-hidden transition-colors duration-300",
          isDark ? "bg-[#0a0a0f] text-neutral-200" : "bg-[#fafafa] text-neutral-600"
        )}
      >
        <DashboardSidebar />
        <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden h-screen p-0 md:p-0 gap-0 m-0 bg-transparent relative">
          <DeadlineTicker />
          {/* Seamless Content Area */}
          {children}
          <HiveMind />
        </main>
      </div>
    </DeadlineProvider>
  );
}
