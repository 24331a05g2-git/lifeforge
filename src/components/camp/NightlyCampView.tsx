"use client";

import React, { useState } from "react";
import { Quest, CreateQuestInput } from "@/lib/quests/types";
import {
  NightlyCampData,
  NightlyPlanDifficulty,
  TomorrowSummary,
} from "@/lib/camp/types";
import { calculateTomorrowSummary } from "@/lib/camp/rules";
import {
  saveNightlyPlanAction,
  moveQuestToTomorrowAction,
} from "@/actions/nightly-camp";
import {
  createQuestAction,
  updateQuestAction,
  deleteQuestAction,
} from "@/actions/quests";
import { CampAriaCompanion } from "./CampAriaCompanion";
import { TodayReviewSection } from "./TodayReviewSection";
import { TomorrowPlanningSection } from "./TomorrowPlanningSection";
import { BedtimeSettingsModal } from "./BedtimeSettingsModal";
import { ForgeQuestModal } from "@/components/quests/ForgeQuestModal";
import { AdaptiveGuidanceCard } from "@/components/adaptive/AdaptiveGuidanceCard";
import {
  Flame,
  Moon,
  Clock,
  Calendar,
  Sparkles,
  Settings,
  CheckCircle2,
} from "lucide-react";

interface NightlyCampViewProps {
  initialData: NightlyCampData;
}

export function NightlyCampView({ initialData }: NightlyCampViewProps) {
  const {
    profile,
    todayDateStr,
    tomorrowDateStr,
    todayStats: initialTodayStats,
    todayCompletedQuests: initialCompleted,
    todayUnfinishedQuests: initialUnfinished,
    tomorrowQuests: initialTomorrowQuests,
    nightlyPlan,
    ariaCampMessage,
    isBedtimeWindow,
  } = initialData;

  // Local state
  const [completedQuests, setCompletedQuests] = useState<Quest[]>(initialCompleted);
  const [unfinishedQuests, setUnfinishedQuests] = useState<Quest[]>(initialUnfinished);
  const [tomorrowQuests, setTomorrowQuests] = useState<Quest[]>(initialTomorrowQuests);
  const [bedtime, setBedtime] = useState(profile.bedtime || "22:30");

  const [selectedDifficulty, setSelectedDifficulty] = useState<NightlyPlanDifficulty>(
    nightlyPlan?.difficulty || "normal"
  );
  const [reflection, setReflection] = useState(nightlyPlan?.reflection || "");

  // Modal and loading states
  const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [isBedtimeModalOpen, setIsBedtimeModalOpen] = useState(false);

  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isMovingId, setIsMovingId] = useState<string | null>(null);
  const [isRemovingId, setIsRemovingId] = useState<string | null>(null);

  // Dynamic summary computation
  const currentSummary: TomorrowSummary = calculateTomorrowSummary(
    tomorrowQuests,
    selectedDifficulty
  );

  // 1. Move Unfinished Quest to Tomorrow
  const handleMoveToTomorrow = async (questId: string) => {
    setIsMovingId(questId);
    try {
      const res = await moveQuestToTomorrowAction(questId, tomorrowDateStr);
      if (res.success && res.data) {
        // Remove from unfinished, add to tomorrow
        setUnfinishedQuests((prev) => prev.filter((q) => q.id !== questId));
        setTomorrowQuests((prev) => [...prev, res.data!]);
      }
    } catch (err) {
      console.error("Failed to move quest to tomorrow:", err);
    } finally {
      setIsMovingId(null);
    }
  };

  // 2. Remove Quest (from either list)
  const handleRemoveQuest = async (questId: string) => {
    setIsRemovingId(questId);
    try {
      const res = await deleteQuestAction(questId);
      if (res.success) {
        setUnfinishedQuests((prev) => prev.filter((q) => q.id !== questId));
        setTomorrowQuests((prev) => prev.filter((q) => q.id !== questId));
      }
    } catch (err) {
      console.error("Failed to remove quest:", err);
    } finally {
      setIsRemovingId(null);
    }
  };

  // 3. Create or Edit Quest via ForgeQuestModal
  const handleModalSubmit = async (input: CreateQuestInput, editId?: string) => {
    try {
      if (editId) {
        const res = await updateQuestAction({ id: editId, ...input });
        if (res.success && res.data) {
          const updated = res.data;
          // Update in whichever list it resides
          setTomorrowQuests((prev) =>
            prev.map((q) => (q.id === editId ? updated : q))
          );
          setUnfinishedQuests((prev) =>
            prev.map((q) => (q.id === editId ? updated : q))
          );
          setIsForgeModalOpen(false);
          setEditingQuest(null);
          return { success: true };
        }
        return { success: false, error: res.error || "Update failed." };
      } else {
        const res = await createQuestAction(input);
        if (res.success && res.data) {
          const created = res.data;
          if (created.scheduled_date === tomorrowDateStr) {
            setTomorrowQuests((prev) => [...prev, created]);
          } else if (created.scheduled_date === todayDateStr) {
            setUnfinishedQuests((prev) => [...prev, created]);
          }
          setIsForgeModalOpen(false);
          return { success: true };
        }
        return { success: false, error: res.error || "Creation failed." };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Submission error";
      return { success: false, error: message };
    }
  };

  // 4. Save Tomorrow's Plan (Awards 0 XP / 0 Gold)
  const handleSavePlan = async () => {
    setIsSavingPlan(true);
    setSaveSuccess(false);

    try {
      const res = await saveNightlyPlanAction({
        plan_date: todayDateStr,
        target_date: tomorrowDateStr,
        difficulty: selectedDifficulty,
        reflection,
      });

      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Failed to save plan:", err);
    } finally {
      setIsSavingPlan(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Campfire Hero Atmosphere Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.08] via-orange-950/[0.15] to-[#0A0D15]/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(245,158,11,0.1)]">
        {/* Subtle glowing ember lights */}
        <div className="pointer-events-none absolute -top-28 -right-28 h-64 w-64 rounded-full bg-orange-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-amber-600/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Campfire Title & Philosophy */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-xs font-mono text-amber-300">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>NIGHTLY CAMP • REST & PREPARATION</span>
            </div>

            <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-gold-gradient tracking-wide">
              Nightly Camp
            </h1>

            <p className="font-cinzel text-xs sm:text-sm text-slate-300 tracking-wider">
              &ldquo;The day&apos;s adventure is ending. Let&apos;s prepare tomorrow&apos;s.&rdquo;
            </p>

            <p className="text-xs font-mono text-amber-400/90 font-bold uppercase tracking-widest pt-1">
              Review • Reflect • Prepare
            </p>
          </div>

          {/* Right: Bedtime and Timezone Pills */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto font-mono text-xs">
            <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Bedtime: {bedtime}</span>
                </span>
                <button
                  onClick={() => setIsBedtimeModalOpen(true)}
                  className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                  title="Configure bedtime schedule"
                >
                  <Settings className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Timezone: {profile.timezone}
              </p>
            </div>

            <div className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Tomorrow: {tomorrowDateStr}</span>
              </span>
              <p className="text-[10px] text-slate-500">
                Today: {todayDateStr}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ARIA Campfire Counsel */}
      <CampAriaCompanion message={ariaCampMessage} />

      {/* Step 1: Today's Adventure Review */}
      <TodayReviewSection
        stats={initialTodayStats}
        completedQuests={completedQuests}
        unfinishedQuests={unfinishedQuests}
        onMoveToTomorrow={handleMoveToTomorrow}
        onEditQuest={(quest) => {
          setEditingQuest(quest);
          setIsForgeModalOpen(true);
        }}
        onRemoveQuest={handleRemoveQuest}
        isMovingId={isMovingId}
        isRemovingId={isRemovingId}
      />

      {/* Adaptive Difficulty Guidance from ARIA */}
      <AdaptiveGuidanceCard
        recommendation={initialData.adaptiveRecommendation}
      />

      {/* Step 2: Tomorrow's Quest Planning Board */}
      <TomorrowPlanningSection
        tomorrowQuests={tomorrowQuests}
        tomorrowDateStr={tomorrowDateStr}
        summary={currentSummary}
        selectedDifficulty={selectedDifficulty}
        onChangeDifficulty={setSelectedDifficulty}
        reflection={reflection}
        onChangeReflection={setReflection}
        onAddQuest={() => {
          setEditingQuest(null);
          setIsForgeModalOpen(true);
        }}
        onEditQuest={(quest) => {
          setEditingQuest(quest);
          setIsForgeModalOpen(true);
        }}
        onRemoveQuest={handleRemoveQuest}
        onSavePlan={handleSavePlan}
        isSaving={isSavingPlan}
        saveSuccess={saveSuccess}
      />

      {/* Reusable ForgeQuestModal for Add/Edit Quest */}
      <ForgeQuestModal
        isOpen={isForgeModalOpen}
        onClose={() => {
          setIsForgeModalOpen(false);
          setEditingQuest(null);
        }}
        onSubmit={handleModalSubmit}
        initialQuest={editingQuest}
        defaultDate={tomorrowDateStr}
      />

      {/* Bedtime Settings Modal */}
      <BedtimeSettingsModal
        isOpen={isBedtimeModalOpen}
        onClose={() => setIsBedtimeModalOpen(false)}
        currentBedtime={bedtime}
        timezone={profile.timezone}
        onBedtimeUpdated={(newTime) => setBedtime(newTime)}
      />
    </div>
  );
}
