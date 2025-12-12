"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export function PageLoadingOverlay() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <p className="text-sm font-medium text-white/70">Loading...</p>
            </div>
        </div>
    );
}
