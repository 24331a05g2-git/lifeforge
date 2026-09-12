"use client";

import React from "react";
import { ATTRIBUTE_META } from "@/lib/assessment/scoring";
import { AttributeType } from "@/lib/assessment/types";
import { Target, Shield } from "lucide-react";

interface CharacterStatsPanelProps {
  stats: Record<AttributeType, number>;
  compact?: boolean;
  className?: string;
}

const ATTRIBUTE_ORDER: AttributeType[] = [
  "strength",
  "intellect",
  "focus",
  "discipline",
  "energy",
];

const ATTRIBUTE_TRAINING_HINTS: Record<AttributeType, string> = {
  strength: "Trained in the Training Arena through physical vigor & fitness",
  intellect: "Trained in the Knowledge Dungeon through reading & skill study",
  focus: "Trained in Focus Missions through deep uninterrupted work",
  discipline: "Trained in the Habit Garden through consistent daily routines",
  energy: "Trained through social collaboration & vital recovery habits",
};

export function CharacterStatsPanel({
  stats,
  compact = false,
  className = "",
}: CharacterStatsPanelProps) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-5 sm:p-7 backdrop-blur-xl space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-slate-100">
              Character Attributes
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Core RPG stats forged through real-world quests
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
          <Shield className="w-3 h-3" />
          <span>Server Verified</span>
        </div>
      </div>

      {/* Attributes List */}
      <div className="space-y-3.5">
        {ATTRIBUTE_ORDER.map((attr) => {
          const meta = ATTRIBUTE_META[attr];
          const score = stats[attr] || 50;
          const hint = ATTRIBUTE_TRAINING_HINTS[attr];

          return (
            <div
              key={attr}
              className="p-3 sm:p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all space-y-2"
            >
              {/* Stat Name & Score */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-base">{meta.icon}</span>
                  <span className="font-cinzel font-bold text-sm text-slate-200">
                    {meta.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-amber-300 text-sm">{score}</span>
                  <span className="text-[10px] text-slate-500">/ 100</span>
                </div>
              </div>

              {/* Stat Progress Bar */}
              <div
                className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.04]"
                role="progressbar"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${meta.label}: ${score} out of 100`}
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                />
              </div>

              {/* Motivational Description */}
              {!compact && (
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span className="line-clamp-1">{meta.description}</span>
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline text-right max-w-[200px] truncate">
                    {hint}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
