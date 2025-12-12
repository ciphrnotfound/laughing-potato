"use client";

import DashboardSidebar from "@/components/DashboardSidebar";
import HiveMind from "@/components/HiveMind";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

import { DeadlineProvider } from "@/lib/deadline-context";
import DeadlineTicker from "@/components/DeadlineTicker";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
