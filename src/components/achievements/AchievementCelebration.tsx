"use client";

import React, { useEffect, useState } from "react";
import { Trophy, Sparkles, X } from "lucide-react";
import { getAchievementDefinition } from "@/lib/achievements/definitions";
import { AchievementKey } from "@/lib/achievements/types";

interface AchievementCelebrationProps {
  achievementKey: AchievementKey | null;
  onDismiss: () => void;
}

export function AchievementCelebration({
  achievementKey,
  onDismiss,
}: AchievementCelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievementKey) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievementKey, onDismiss]);

  if (!achievementKey || !isVisible) return null;

  const def = getAchievementDefinition(achievementKey);
  if (!def) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/50 bg-[#0C0F17]/95 p-4 sm:p-5 shadow-[0_0_40px_rgba(245,158,11,0.3)] backdrop-blur-xl">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl border border-amber-500/50 bg-amber-500/20 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            <Trophy className="w-6 h-6 animate-pulse" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400 font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>FEAT CONQUERED!</span>
            </div>
            <h4 className="font-cinzel text-base font-bold text-slate-100">
              {def.title}
            </h4>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {def.description}
            </p>
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 200);
            }}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
