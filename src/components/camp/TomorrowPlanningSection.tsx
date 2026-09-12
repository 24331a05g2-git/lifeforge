"use client";

import React from "react";
import { Quest, QuestDifficulty, QuestPriority } from "@/lib/quests/types";
import {
  DIFFICULTY_DESCRIPTIONS,
  NightlyPlanDifficulty,
  TomorrowSummary,
} from "@/lib/camp/types";
import {
  Sword,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Sparkles,
  Calendar,
  Check,
  Shield,
  Layers,
  Flame,
  Info,
} from "lucide-react";

interface TomorrowPlanningSectionProps {
  tomorrowQuests: Quest[];
  tomorrowDateStr: string;
  summary: TomorrowSummary;
  selectedDifficulty: NightlyPlanDifficulty;
  onChangeDifficulty: (difficulty: NightlyPlanDifficulty) => void;
  reflection: string;
  onChangeReflection: (reflection: string) => void;
  onAddQuest: () => void;
  onEditQuest: (quest: Quest) => void;
  onRemoveQuest: (questId: string) => Promise<void>;
  onSavePlan: () => Promise<void>;
  isSaving: boolean;
  saveSuccess: boolean;
}

export function TomorrowPlanningSection({
  tomorrowQuests,
  tomorrowDateStr,
  summary,
  selectedDifficulty,
  onChangeDifficulty,
  reflection,
  onChangeReflection,
  onAddQuest,
  onEditQuest,
  onRemoveQuest,
  onSavePlan,
  isSaving,
  saveSuccess,
}: TomorrowPlanningSectionProps) {
  // Format total estimated minutes into "Xh Ym"
  const formatEstimatedTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <section className="space-y-6" aria-labelledby="tomorrow-plan-heading">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Step 2 • Prepare & Forge</span>
          </div>
          <h2
            id="tomorrow-plan-heading"
            className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100"
          >
            Tomorrow&apos;s Quest Board
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Plan your objectives for {tomorrowDateStr}. Tomorrow&apos;s adventure begins tonight.
          </p>
        </div>

        <button
          onClick={onAddQuest}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-cinzel text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-center shadow-lg shadow-amber-950/40 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Quest</span>
        </button>
      </div>

      {/* Tomorrow Quests Board */}
      <div className="rounded-2xl border border-white/10 bg-[#0B0E17]/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sword className="w-4 h-4 text-amber-400" />
            <span>Scheduled Quests ({tomorrowQuests.length})</span>
          </h3>
        </div>

        {tomorrowQuests.length === 0 ? (
          <div className="py-10 px-6 text-center space-y-2 border border-dashed border-white/10 rounded-xl">
            <p className="font-cinzel text-slate-200 font-bold text-sm">
              The Board is Quiet for Tomorrow
            </p>
            <p className="text-xs text-slate-400 font-sans max-w-md mx-auto leading-relaxed">
              No quests scheduled yet. Post a trial, move an unfinished quest from today, or set your focus intentions.
            </p>
            <button
              onClick={onAddQuest}
              className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-amber-500/40 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/10 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Forge First Quest</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tomorrowQuests.map((quest) => (
              <div
                key={quest.id}
                className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                    {quest.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span className="capitalize px-2 py-0.5 rounded bg-white/[0.05] text-slate-300">
                      {quest.category}
                    </span>
                    <span>•</span>
                    <span className="capitalize text-amber-300 font-semibold">
                      {quest.difficulty}
                    </span>
                    <span>•</span>
                    <span className="capitalize text-slate-400">
                      {quest.priority} priority
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{quest.estimated_duration}m</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                  <span className="text-xs font-mono text-amber-400 font-bold">
                    +{quest.xp_reward} XP
                  </span>

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
                      className="p-1.5 rounded-lg text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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

      {/* Tomorrow Overall Difficulty Selector */}
      <div className="space-y-3">
        <div>
          <h3 className="font-cinzel text-sm font-bold text-slate-200 uppercase tracking-wider">
            Choose Tomorrow&apos;s Intensity
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Set the overarching ambition of tomorrow&apos;s adventure
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {(["easy", "normal", "challenge"] as NightlyPlanDifficulty[]).map((diff) => {
            const info = DIFFICULTY_DESCRIPTIONS[diff];
            const isSelected = selectedDifficulty === diff;

            return (
              <button
                key={diff}
                type="button"
                onClick={() => onChangeDifficulty(diff)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-amber-500/60 bg-gradient-to-b from-amber-500/15 to-transparent shadow-[0_0_25px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/40"
                    : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04] opacity-75 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${info.badgeColor}`}
                  >
                    {info.label}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {info.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expected Load Summary Card */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-[#0C0F17] via-[#0D121F] to-[#0C0F17] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-cinzel text-xs uppercase tracking-widest text-amber-400 font-bold">
            Projected Adventure Load
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {tomorrowDateStr}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Quests
            </span>
            <span className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100">
              {summary.questCount}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Estimated Time
            </span>
            <span className="font-cinzel text-xl sm:text-2xl font-bold text-cyan-400">
              {formatEstimatedTime(summary.estimatedMinutes)}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">
              Expected XP
            </span>
            <span className="font-cinzel text-xl sm:text-2xl font-bold text-amber-400">
              +{summary.expectedXp}
            </span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 text-[11px] text-slate-400 font-sans pt-1">
          <Info className="w-3.5 h-3.5 text-amber-400/80 flex-shrink-0 mt-0.5" />
          <p>
            Values are projected expectations. Planning awards 0 XP; actual rewards are earned tomorrow upon completing activities in the game arenas.
          </p>
        </div>
      </div>

      {/* Evening Reflection Notes */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase tracking-wider text-slate-300 block">
          Campfire Reflection & Notes (Optional)
        </label>
        <textarea
          rows={2}
          value={reflection}
          onChange={(e) => onChangeReflection(e.target.value)}
          placeholder="Jot down a brief intention or key focus for tomorrow's dawn..."
          className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-sans text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* Save CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        {saveSuccess ? (
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
            <Check className="w-4 h-4" />
            <span>Tomorrow&apos;s plan forged and archived in citadel!</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-sans">
            You can reopen Nightly Camp anytime to update tomorrow&apos;s plan.
          </span>
        )}

        <button
          onClick={onSavePlan}
          disabled={isSaving}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-cinzel text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-amber-950/40 cursor-pointer"
        >
          <Flame className="w-4 h-4 text-slate-950" />
          <span>{isSaving ? "Archiving Plan..." : "Forge Tomorrow"}</span>
        </button>
      </div>
    </section>
  );
}
