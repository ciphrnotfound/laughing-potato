"use client";

import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface DashboardBackgroundProps {
  children: React.ReactNode;
}

export default function DashboardBackground({ children }: DashboardBackgroundProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const rootBackground = cn(
    "relative min-h-screen overflow-hidden transition-colors duration-500",
    isDark
      ? "bg-[#070910]"
      : "bg-gradient-to-br from-[#F5F7FF] via-white to-[#E9EEFF]"
  );

  const gridOverlayClass = cn(
    "absolute inset-0 bg-[size:64px_64px]",
    isDark
      ? "bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] opacity-40"
      : "bg-[linear-gradient(to_right,rgba(12,16,36,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(12,16,36,0.08)_1px,transparent_1px)] opacity-70"
  );

  const radialOverlayClass = cn(
    "absolute inset-x-0 top-[-240px] h-[520px] rounded-full",
    isDark
      ? "bg-[radial-gradient(circle_at_center,rgba(108,67,255,0.28),transparent_70%)]"
      : "bg-[radial-gradient(circle_at_center,rgba(99,109,255,0.22),transparent_70%)]"
  );

  return (
    <div className={rootBackground} style={{
      '--text-primary': isDark ? '#ffffff' : '#0C1024',
      '--text-secondary': isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(12, 16, 36, 0.6)',
      '--text-muted': isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(12, 16, 36, 0.4)',
      minHeight: '100vh'
    } as React.CSSProperties}>
      <div className="absolute inset-0 h-full">
        <div className={radialOverlayClass} />
        <div className={gridOverlayClass} />
      </div>
      <div className="relative z-10" style={{
        color: 'var(--text-primary)'
      }}>
        {children}
      </div>
    </div>
  );
}
