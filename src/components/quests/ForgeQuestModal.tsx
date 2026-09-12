"use client";

import React, { useState, useEffect } from "react";
import { CreateQuestInput, Quest, QuestCategory, QuestDifficulty, QuestPriority } from "@/lib/quests/types";
import {
  CATEGORY_META,
  DIFFICULTY_REWARDS,
  GAME_TYPE_META,
  resolveQuestMetadata,
} from "@/lib/quests/config";
import { ATTRIBUTE_META } from "@/lib/assessment/scoring";
import { X, Sword, Sparkles, Coins, Clock, Calendar, AlertCircle } from "lucide-react";

interface ForgeQuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateQuestInput, editId?: string) => Promise<{ success: boolean; error?: string }>;
  initialQuest?: Quest | null;
  defaultDate?: string;
}

export function ForgeQuestModal({
  isOpen,
  onClose,
  onSubmit,
  initialQuest,
  defaultDate,
}: ForgeQuestModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<QuestCategory>("learning");
  const [priority, setPriority] = useState<QuestPriority>("medium");
  const [difficulty, setDifficulty] = useState<QuestDifficulty>("normal");
  const [scheduledDate, setScheduledDate] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState(30);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize or reset form state on open / initialQuest change
  useEffect(() => {
    if (initialQuest) {
      setTitle(initialQuest.title);
      setDescription(initialQuest.description || "");
      setCategory(initialQuest.category);
      setPriority(initialQuest.priority);
      setDifficulty(initialQuest.difficulty);
      setScheduledDate(initialQuest.scheduled_date);
      setEstimatedDuration(initialQuest.estimated_duration);
    } else {
      setTitle("");
      setDescription("");
      setCategory("learning");
      setPriority("medium");
      setDifficulty("normal");
      setScheduledDate(defaultDate || new Date().toISOString().split("T")[0]);
      setEstimatedDuration(30);
    }
    setErrorMessage(null);
  }, [initialQuest, isOpen, defaultDate]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Live dynamic resolution of game mechanics & reward preview
  const liveMeta = resolveQuestMetadata(category, difficulty);
  const liveAttrMeta = ATTRIBUTE_META[liveMeta.attribute] || ATTRIBUTE_META.discipline;
  const liveGameMeta = GAME_TYPE_META[liveMeta.game_type] || GAME_TYPE_META.habit_garden;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage("Please name your mission.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload: CreateQuestInput = {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        difficulty,
        scheduled_date: scheduledDate,
        estimated_duration: Number(estimatedDuration) || 30,
      };

      const result = await onSubmit(payload, initialQuest?.id);

      if (!result.success && result.error) {
        setErrorMessage(result.error);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        onClose();
      }
    } catch (err: unknown) {
      console.error("Quest submission error:", err);
      setErrorMessage("The Forge lost connection. Your quest could not be saved.");
      setIsSubmitting(false);
    }
  };

  const categories: QuestCategory[] = [
    "learning",
    "fitness",
    "productivity",
    "personal",
    "creative",
    "social",
    "other",
  ];

  const difficulties: QuestDifficulty[] = ["easy", "normal", "hard", "epic"];
  const priorities: QuestPriority[] = ["low", "medium", "high"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgeQuestTitle"
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-amber-500/40 bg-[#0A0D15]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_0_70px_rgba(245,158,11,0.25)] my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Forge Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.9)]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sword className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="forgeQuestTitle"
                className="font-cinzel text-xl sm:text-2xl font-bold text-slate-100"
              >
                {initialQuest ? "Modify Mission" : "Forge a New Quest"}
              </h2>
              <p className="text-xs text-slate-400">
                Transform your real-life activity into an RPG mission.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold font-cinzel text-red-200">The Forge was interrupted</p>
              <p className="text-red-300/90 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Quest Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quest Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="questTitle"
              className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
            >
              Quest Name / What will you conquer? *
            </label>
            <input
              id="questTitle"
              type="text"
              required
              minLength={2}
              maxLength={120}
              placeholder="e.g. Study React Server Components for 45 minutes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-medium transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="questDesc"
              className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
            >
              Description / Mission Briefing (Optional)
            </label>
            <textarea
              id="questDesc"
              rows={2}
              maxLength={1000}
              placeholder="Provide context, notes, or criteria for victory..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm transition-all resize-none"
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
              Challenge Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat;
                const cMeta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/15 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-300"
                    }`}
                  >
                    <span className="text-base">{cMeta.icon}</span>
                    <span className="text-xs font-mono font-medium">{cMeta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                Difficulty Tier
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {difficulties.map((diff) => {
                  const isSelected = difficulty === diff;
                  const dMeta = DIFFICULTY_REWARDS[diff];
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 px-1 rounded-lg border text-center text-xs font-mono capitalize transition-all cursor-pointer ${
                        isSelected
                          ? `${dMeta.badgeColor} border-amber-400 font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]`
                          : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-300"
                      }`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {priorities.map((pri) => {
                  const isSelected = priority === pri;
                  return (
                    <button
                      key={pri}
                      type="button"
                      onClick={() => setPriority(pri)}
                      className={`py-2 px-1 rounded-lg border text-center text-xs font-mono capitalize transition-all cursor-pointer ${
                        isSelected
                          ? "border-amber-400 bg-amber-500/15 text-amber-200 font-bold"
                          : "border-white/5 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-300"
                      }`}
                    >
                      {pri}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Date & Duration Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scheduled Date */}
            <div className="space-y-1.5">
              <label
                htmlFor="questDate"
                className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
              >
                Scheduled Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="questDate"
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label
                htmlFor="questDuration"
                className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
              >
                Estimated Duration (Minutes)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  id="questDuration"
                  type="number"
                  min={1}
                  max={1440}
                  required
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Live RPG Engine & Arena Preview Card */}
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] space-y-2 text-xs font-mono">
            <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider">
              ✦ QUEST MECHANICS PREVIEW
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300 pt-1">
              <div>
                <span className="text-slate-500 block text-[10px]">ATTRIBUTE:</span>
                <span className="font-bold text-amber-300 flex items-center gap-1 mt-0.5">
                  <span>{liveAttrMeta.icon}</span>
                  <span>{liveAttrMeta.label}</span>
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">MINI-GAME ARENA:</span>
                <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                  <span>{liveGameMeta.icon}</span>
                  <span>{liveGameMeta.label}</span>
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 block text-[10px]">REWARD PREVIEW:</span>
                <span className="font-bold text-amber-300 flex items-center gap-2 mt-0.5">
                  <span>+{liveMeta.xp_reward} XP</span>
                  <span className="text-slate-500">•</span>
                  <span>+{liveMeta.gold_reward} G</span>
                </span>
              </div>
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.04] text-slate-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-cinzel font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Forging...</span>
              ) : (
                <>
                  <Sword className="w-4 h-4" />
                  <span>{initialQuest ? "Save Changes" : "Forge Mission"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
