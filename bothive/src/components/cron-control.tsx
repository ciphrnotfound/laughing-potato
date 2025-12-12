"use client";

import React from "react";
import { Clock, Play, Pause, RefreshCw } from "lucide-react";

export function CronControl() {
    return (
        <div className="flex items-center gap-2 text-xs text-white/50 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <Clock className="w-3.5 h-3.5" />
            <span>Cron: Active</span>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
        </div>
    );
}
