"use client";

import React from "react";
import { AchievementProgressItem } from "@/lib/achievements/types";
import {
  Sword,
  Target,
  Flame,
  Shield,
  Sparkles,
  Moon,
  Compass,
  Trophy,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface AchievementBadgeProps {
  achievement: AchievementProgressItem;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sword,
  Target,
  Flame,
  Shield,
  Sparkles,
  Moon,
  Compass,
  Trophy,
};

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const IconComponent = ICON_MAP[achievement.iconName] || Trophy;
  const { isUnlocked, title, description, requirementText, currentValue, targetValue, progressPercent, unlockedAt } = achievement;

  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${
        isUnlocked
          ? "border-amber-500/40 bg-gradient-to-b from-amber-500/[0.08] via-white/[0.02] to-transparent shadow-[0_0_25px_rgba(245,158,11,0.08)]"
          : "border-white/[0.06] bg-white/[0.01] opacity-75 hover:opacity-90"
      }`}
    >
      <div>
        {/* Top: Icon & Status */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
              isUnlocked
                ? "border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                : "border-white/10 bg-slate-900/60 text-slate-500"
            }`}
          >
            {isUnlocked ? (
              <IconComponent className="w-6 h-6" />
            ) : (
              <Lock className="w-5 h-5 text-slate-500" />
            )}
          </div>

          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Conquered</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono text-slate-500">
              {currentValue} / {targetValue}
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h4
          className={`font-cinzel text-base font-bold tracking-wide ${
            isUnlocked ? "text-slate-100" : "text-slate-400"
          }`}
        >
          {title}
        </h4>
        <p className="mt-1 text-xs text-slate-400 leading-relaxed font-sans">
          {description}
        </p>
      </div>

      {/* Bottom: Progress or Unlock Date */}
      <div className="mt-4 pt-3 border-t border-white/[0.06]">
        {isUnlocked ? (
          <span className="text-[11px] font-mono text-amber-400/80">
            Unlocked {formattedDate}
          </span>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{requirementText}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-900 border border-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500/60 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
