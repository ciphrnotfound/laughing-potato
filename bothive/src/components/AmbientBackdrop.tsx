import React from "react";
import { Spotlight } from "@/components/ui/Spotlight";
import { cn } from "@/lib/utils";

interface AmbientBackdropProps {
  className?: string;
  maskClassName?: string;
}

/**
 * Reusable background that mirrors the hero's violet spotlight + grid aesthetic.
 * Place this inside a relatively positioned container; it renders absolutely positioned layers.
 */
const AmbientBackdrop: React.FC<AmbientBackdropProps> = ({ className, maskClassName }) => {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {/* Spotlights */}
      <Spotlight className="-top-20 left-4 h-[90vh] opacity-80" fill="#7C3AED" />
      <Spotlight className="-top-32 left-full h-[80vh] opacity-60 md:right-12" fill="#6A00FF" />
      <Spotlight className="-top-24 left-[12vw] h-[70vh] w-[55vw] opacity-55" fill="#6366F1" />

      {/* Grid + masks */}
      <div className="absolute inset-0">
        <div
          className={cn(
            "absolute inset-0",
            "[background-size:36px_36px]",
            "[background-image:linear-gradient(to_right,rgba(109,40,217,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(109,40,217,0.18)_1px,transparent_1px)]"
          )}
        />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            "[mask-image:radial-gradient(ellipse_at_center,transparent_14%,black)]",
            maskClassName
          )}
        />
        <div className="absolute inset-0 opacity-55 mix-blend-soft-light">
          <div
            className="absolute left-1/2 top-1/2 h-[58vmin] w-[58vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{
              background:
                "conic-gradient(from 180deg at 50% 50%, rgba(124,58,237,0.16), rgba(106,0,255,0.12), rgba(99,102,241,0.14), rgba(124,58,237,0.16))",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AmbientBackdrop;
