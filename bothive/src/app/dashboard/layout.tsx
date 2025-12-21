"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import HiveMind from "@/components/HiveMind";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { DeadlineProvider } from "@/lib/deadline-context";
import DeadlineTicker from "@/components/DeadlineTicker";
import { toast } from "sonner";

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

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/signin");
          return;
        }

        // TEMPORARY: Allow access if role override is present (for testing)
        const roleOverride = localStorage.getItem("bothive_role_override");
        const hasInviteToken = localStorage.getItem("bothive_invite_token");
        const isAdmin = user.email === "akinlorinjeremiah@gmail.com";

        if (!isAdmin && !roleOverride && !hasInviteToken && process.env.NODE_ENV === "production") {
          // Access Denied -> Waitlist (Only in production if not admin/overridden/invited)
          if (!pathname?.includes("/waitlist")) {
            router.push("/waitlist");
          }
          setChecking(false);
          return;
        }

        // If Admin, proceed to standard checks (like onboarding, though Admin likely stays)
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("onboarding_completed")
          .eq("user_id", user.id)
          .single();

        if (!profile || !profile.onboarding_completed) {
          if (!pathname?.includes("/onboarding")) {
            toast("Please complete your setup first.");
            router.push("/onboarding");
          }
        }
      } catch (error) {
        console.error("Error checking access:", error);
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [router, pathname]);

  if (checking) {
    return null; // Or a loading spinner
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
