"use client";

import React from "react";
import { DailyAdventureStats } from "@/actions/dashboard";
import { Compass, Sparkles, Coins, Clock, CheckCircle2 } from "lucide-react";

interface DailyAdventureProgressProps {
  stats: DailyAdventureStats;
  className?: string;
}

export function DailyAdventureProgress({
  stats,
  className = "",
}: DailyAdventureProgressProps) {
  const {
    totalQuestsToday,
    completedQuestsToday,
    completionPercentage,
    todayXpEarned,
    todayGoldEarned,
    todayActiveMinutes,
  } = stats;

  return (
    <div
      className={`rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent bg-[#0A0D15]/90 p-5 sm:p-7 backdrop-blur-xl space-y-5 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-slate-100">
              Today&apos;s Adventure
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Live conquest metrics recorded for today
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-amber-300 font-bold">
          <span>{completionPercentage}% Conquered</span>
        </div>
      </div>

      {/* Quest Progress Bar */}
      <div className="space-y-2 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Missions Completed:</span>
          </span>
          <span className="font-bold text-amber-300">
            {completedQuestsToday} <span className="text-slate-500">/</span> {totalQuestsToday}
          </span>
        </div>

        <div
          className="w-full h-2.5 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.06]"
          role="progressbar"
          aria-valuenow={completedQuestsToday}
          aria-valuemin={0}
          aria-valuemax={Math.max(1, totalQuestsToday)}
          aria-label={`Today's quest completion: ${completedQuestsToday} out of ${totalQuestsToday}`}
        >
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Real-World Metrics Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
        {/* XP Earned Today */}
        <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400">XP TODAY</span>
          </div>
          <div className="font-cinzel text-base sm:text-lg font-black text-amber-300">
            +{todayXpEarned}
          </div>
        </div>

        {/* Gold Earned Today */}
        <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mb-1">
            <Coins className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400">GOLD TODAY</span>
          </div>
          <div className="font-cinzel text-base sm:text-lg font-black text-amber-300">
            +{todayGoldEarned}
          </div>
        </div>

        {/* Active Minutes Today */}
        <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-center gap-1 text-sky-400 text-xs mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] text-slate-400">FOCUSED</span>
          </div>
          <div className="font-cinzel text-base sm:text-lg font-black text-sky-300">
            {todayActiveMinutes}m
          </div>
        </div>
      </div>
    </div>
  );
}
