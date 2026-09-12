"use client";

import React from "react";
import { Quest } from "@/lib/quests/types";
import { TodayReviewData } from "@/lib/camp/types";
import {
  CheckCircle2,
  Clock,
  Coins,
  Sparkles,
  Flame,
  ArrowRight,
  Edit2,
  Trash2,
  AlertCircle,
  Shield,
  Layers,
} from "lucide-react";

interface TodayReviewSectionProps {
  stats: TodayReviewData;
  completedQuests: Quest[];
  unfinishedQuests: Quest[];
  onMoveToTomorrow: (questId: string) => Promise<void>;
  onEditQuest: (quest: Quest) => void;
  onRemoveQuest: (questId: string) => Promise<void>;
  isMovingId: string | null;
  isRemovingId: string | null;
}

export function TodayReviewSection({
  stats,
  completedQuests,
  unfinishedQuests,
  onMoveToTomorrow,
  onEditQuest,
  onRemoveQuest,
  isMovingId,
  isRemovingId,
}: TodayReviewSectionProps) {
  return (
    <section className="space-y-6" aria-labelledby="today-review-heading">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Step 1 • Review & Reflect</span>
          </div>
          <h2
            id="today-review-heading"
            className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100"
          >
            Today&apos;s Adventure
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            A chronicle of your deeds, victories, and trials today
          </p>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-xs font-mono text-orange-400 self-start sm:self-center">
          <Flame className="w-4 h-4" />
          <span className="font-bold">{stats.currentStreak} DAY STREAK</span>
        </div>
      </div>

      {/* Metrics Row (Real Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Quests Conquered */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Trials Conquered
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-cinzel text-2xl font-bold text-emerald-400">
              {stats.completedQuestsCount}
            </span>
            <span className="text-xs font-mono text-slate-500">
              / {stats.totalQuestsToday}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block">
            {stats.remainingQuestsCount} remaining
          </span>
        </div>

        {/* XP Earned Today */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            XP Earned
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-cinzel text-2xl font-bold text-amber-400">
              +{stats.xpEarnedToday}
            </span>
            <span className="text-xs font-mono text-amber-500/70">XP</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block">
            Lvl {stats.level} Hero
          </span>
        </div>

        {/* Gold Earned Today */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Treasury Gains
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-cinzel text-2xl font-bold text-yellow-400">
              +{stats.goldEarnedToday}
            </span>
            <span className="text-xs font-mono text-yellow-500/70">G</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block">
            Today&apos;s Loot
          </span>
        </div>

        {/* Active Minutes */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
            Active Focus
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-cinzel text-2xl font-bold text-cyan-400">
              {stats.activeMinutesToday}
            </span>
            <span className="text-xs font-mono text-cyan-500/70">MIN</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 block">
            Arena Sessions
          </span>
        </div>
      </div>

      {/* Two Columns: Conquered vs Unfinished */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Conquered Quests List */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0E17]/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Conquered Trials ({completedQuests.length})</span>
            </h3>
          </div>

          {completedQuests.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-1 text-xs text-slate-400 font-sans">
              <p className="font-medium text-slate-300">No completed trials yet today.</p>
              <p>Every journey has quiet days. Focus on resting for tomorrow.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {completedQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="truncate">
                      <p className="font-medium text-slate-100 truncate line-through opacity-80">
                        {quest.title}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {quest.category} • {quest.difficulty}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-amber-400 font-bold flex-shrink-0">
                    +{quest.xp_reward} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unfinished Quests List (With supportive actions) */}
        <div className="rounded-2xl border border-amber-500/20 bg-[#0B0E17]/80 p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="font-cinzel text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Unfinished Trials ({unfinishedQuests.length})</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Not every quest needs to be conquered today. Choose what deserves another attempt tomorrow.
            </p>
          </div>

          {unfinishedQuests.length === 0 ? (
            <div className="py-8 px-4 text-center space-y-1 text-xs text-slate-400 font-sans">
              <p className="font-medium text-emerald-400 font-cinzel">
                Clear Horizon
              </p>
              <p>All scheduled quests for today have been conquered!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {unfinishedQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-amber-500/30 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">
                        {quest.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                        <span className="capitalize">{quest.category}</span>
                        <span>•</span>
                        <span className="capitalize">{quest.difficulty}</span>
                        <span>•</span>
                        <span>{quest.estimated_duration}m</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-amber-300 font-bold flex-shrink-0">
                      +{quest.xp_reward} XP
                    </span>
                  </div>

                  {/* Supportive Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                    <button
                      onClick={() => onMoveToTomorrow(quest.id)}
                      disabled={isMovingId === quest.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <ArrowRight className="w-3 h-3" />
                      <span>{isMovingId === quest.id ? "Moving..." : "Move to Tomorrow"}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditQuest(quest)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] transition-colors"
                        title="Edit quest"
                        aria-label={`Edit ${quest.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveQuest(quest.id)}
                        disabled={isRemovingId === quest.id}
                        className="p-1.5 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        title="Remove quest"
                        aria-label={`Remove ${quest.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
