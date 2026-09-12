"use client";

import React, { useState } from "react";
import { AchievementProgressItem } from "@/lib/achievements/types";
import { AchievementBadge } from "./AchievementBadge";
import { Trophy, Sparkles, Filter } from "lucide-react";

interface AchievementListProps {
  initialAchievements: AchievementProgressItem[];
  unlockedCount: number;
  totalCount: number;
}

export function AchievementList({
  initialAchievements,
  unlockedCount,
  totalCount,
}: AchievementListProps) {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");

  const overallPercent =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  const filteredAchievements = initialAchievements.filter((a) => {
    if (filter === "unlocked") return a.isUnlocked;
    if (filter === "locked") return !a.isUnlocked;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Overall Mastery Strip */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-300">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-slate-100">
                Feats of the Realm
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {unlockedCount} of {totalCount} Conquered ({overallPercent}% Complete)
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/5 self-start sm:self-auto font-mono text-xs">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "all"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilter("unlocked")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "unlocked"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Unlocked ({unlockedCount})
            </button>
            <button
              onClick={() => setFilter("locked")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === "locked"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Locked ({totalCount - unlockedCount})
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 w-full rounded-full bg-slate-900 border border-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all duration-700"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Achievement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementBadge key={achievement.key} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
