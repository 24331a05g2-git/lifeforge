import React from "react";
import { Sparkles, Compass } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center bg-[#07080B] text-slate-100 p-6"
      role="status"
      aria-label="Forging your realm..."
    >
      <div className="text-center space-y-4 max-w-sm mx-auto">
        {/* Pulsing Portal Emblem */}
        <div className="relative w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-pulse">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: "8s" }} />
          <div className="absolute -top-1 -right-1">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
        </div>

        {/* Loading Rune Header */}
        <div className="space-y-1.5 font-mono">
          <h2 className="font-cinzel text-xl font-bold text-slate-100 tracking-wider">
            FORGING YOUR REALM...
          </h2>
          <p className="text-xs text-slate-400">
            Harmonizing active quests, daily triumphs, and character progression.
          </p>
        </div>
      </div>
    </div>
  );
}
