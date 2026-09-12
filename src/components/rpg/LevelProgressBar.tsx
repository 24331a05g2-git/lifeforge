"use client";

import React from "react";
import { getProgressWithinLevel } from "@/lib/rpg/progression";
import { Shield, Sparkles } from "lucide-react";

interface LevelProgressBarProps {
  totalXp: number;
  showLevelBadge?: boolean;
  showDetails?: boolean;
  className?: string;
}

export function LevelProgressBar({
  totalXp,
  showLevelBadge = true,
  showDetails = true,
  className = "",
}: LevelProgressBarProps) {
  const progress = getProgressWithinLevel(totalXp);

  return (
    <div className={`space-y-2.5 font-mono ${className}`}>
      {/* Header Row: Level + XP Progress */}
      <div className="flex items-center justify-between text-xs">
        {showLevelBadge && (
          <div className="flex items-center gap-1.5 font-cinzel font-bold text-amber-300">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>LEVEL {progress.currentLevel}</span>
          </div>
        )}

        <div className="flex items-center gap-1 text-slate-300">
          <span className="font-bold text-amber-300">
            {progress.xpIntoCurrentLevel}
          </span>
          <span className="text-slate-500">/</span>
          <span>{progress.xpRequiredForNextLevel} XP</span>
        </div>
      </div>

      {/* Visual Bar Container */}
      <div
        className="relative w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.08]"
        role="progressbar"
        aria-valuenow={progress.xpIntoCurrentLevel}
        aria-valuemin={0}
        aria-valuemax={progress.xpRequiredForNextLevel}
        aria-label={`Level ${progress.currentLevel} progression: ${progress.progressPercentage}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(245,158,11,0.5)]"
          style={{ width: `${progress.progressPercentage}%` }}
        />
      </div>

      {/* Subtitle Details */}
      {showDetails && (
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-amber-400/80">
            <Sparkles className="w-3 h-3" />
            <span>{progress.xpRemaining} XP to Level {progress.currentLevel + 1}</span>
          </span>
          <span className="text-slate-500">
            {progress.totalCumulativeXp} Total XP
          </span>
        </div>
      )}
    </div>
  );
}
