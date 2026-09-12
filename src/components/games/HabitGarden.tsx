"use client";

import React, { useState, useEffect, useRef } from "react";
import { Quest } from "@/lib/quests/types";
import { GameSession, TimerStatus } from "@/lib/games/types";
import { GAME_CONFIG } from "@/lib/games/config";
import {
  Play,
  Pause,
  RotateCcw,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  Heart,
} from "lucide-react";

interface HabitGardenProps {
  quest: Quest;
  session: GameSession;
  onComplete: (notes: string, confirmed: boolean) => Promise<void>;
}

export function HabitGarden({
  quest,
  session,
  onComplete,
}: HabitGardenProps) {
  const config = GAME_CONFIG.habit_garden;

  const [targetMinutes, setTargetMinutes] = useState<number>(quest.estimated_duration || 10);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Mindful Habit Checklist
  const [checklist, setChecklist] = useState([
    { id: "1", label: "Grounding: 3 deep breaths and physical centering", checked: false },
    { id: "2", label: "Hydration: Drink water and release mental tension", checked: false },
    { id: "3", label: "Pure Presence: Mindful ritual execution without screen multitasking", checked: false },
  ]);

  const [reflection, setReflection] = useState("");
  const [confirmedRealWorld, setConfirmedRealWorld] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Wall-clock tracking
  const startTimeRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTargetSeconds = targetMinutes * 60;
  const remainingSeconds = Math.max(0, totalTargetSeconds - elapsedSeconds);

  useEffect(() => {
    if (timerStatus === "running") {
      startTimeRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const delta = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const currentElapsed = accumulatedSecondsRef.current + delta;
          setElapsedSeconds(currentElapsed);

          if (currentElapsed >= totalTargetSeconds) {
            setTimerStatus("finished");
            if (intervalRef.current) clearInterval(intervalRef.current);
          }
        }
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStatus, totalTargetSeconds]);

  const handleStartTimer = () => setTimerStatus("running");
  const handlePauseTimer = () => {
    if (startTimeRef.current) {
      accumulatedSecondsRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
    }
    setTimerStatus("paused");
  };
  const handleResumeTimer = () => {
    startTimeRef.current = Date.now();
    setTimerStatus("running");
  };
  const handleResetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    accumulatedSecondsRef.current = 0;
    startTimeRef.current = null;
    setElapsedSeconds(0);
    setTimerStatus("idle");
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedRealWorld) {
      setErrorMessage("Please confirm that you performed this habit ritual in the real world.");
      return;
    }

    setIsFinishing(true);
    setErrorMessage(null);

    try {
      const checklistSummary = checklist
        .map((c) => `[${c.checked ? "X" : " "}] ${c.label}`)
        .join("\n");
      const fullNotes = [reflection.trim(), "Mindful Checklist:", checklistSummary]
        .filter(Boolean)
        .join("\n");

      await onComplete(fullNotes, confirmedRealWorld);
    } catch (err: unknown) {
      console.error("Habit garden completion error:", err);
      setErrorMessage("Could not record habit completion. Please try again.");
      setIsFinishing(false);
    }
  };

  const minutesDisplay = Math.floor(remainingSeconds / 60);
  const secondsDisplay = remainingSeconds % 60;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalTargetSeconds) * 100));

  // Determine plant growth visual stage based on progress
  const plantStage =
    progressPercent >= 90
      ? { label: "Mythical Bloom", icon: "🌸", desc: "A vibrant celestial flower blooming with disciplined energy" }
      : progressPercent >= 60
      ? { label: "Leafing Flora", icon: "🌿", desc: "Leaves unfurling with steady, patient daily water" }
      : progressPercent >= 25
      ? { label: "Sprouting Seed", icon: "🌱", desc: "The green shoot emerges from the soil of consistency" }
      : { label: "Planted Seedling", icon: "🌰", desc: "Quietly taking root in fertile intention" };

  return (
    <div className="w-full space-y-8">
      {/* Garden Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase">
          <span>🌱 HABIT GARDEN</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-slate-100">
          {quest.title}
        </h1>
        <p className="text-sm font-cinzel text-emerald-200">
          &ldquo;{config.tagline}&rdquo; — {config.callToAction}
        </p>
      </div>

      {/* Main Garden Sanctuary Card */}
      <div className="relative rounded-3xl border border-emerald-500/30 bg-[#0A0D15]/90 p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(16,185,129,0.12)] space-y-8">
        {/* Visual Plant Growth Stage Representation */}
        <div className="text-center space-y-3 p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03]">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-transform duration-500 hover:scale-105">
            {plantStage.icon}
          </div>

          <div className="space-y-1">
            <div className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
              PLANT EVOLUTION: {plantStage.label}
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {plantStage.desc}
            </p>
          </div>
        </div>

        {/* Timer Presets */}
        {timerStatus === "idle" && (
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-slate-400 mr-2">HABIT DURATION:</span>
            {config.timerPresets.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTargetMinutes(m)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  targetMinutes === m
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-200 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        )}

        {/* Big Peaceful Countdown Timer */}
        <div className="text-center space-y-3">
          <div
            className="font-mono text-5xl sm:text-7xl font-bold tracking-tight text-emerald-300 drop-shadow-[0_0_20px_rgba(16,185,129,0.35)] select-none"
            aria-live="polite"
          >
            {minutesDisplay.toString().padStart(2, "0")}:{secondsDisplay.toString().padStart(2, "0")}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-xs font-mono text-slate-400">
            {elapsedSeconds > 0 ? (
              <span>Nurturing Habit • {progressPercent}% of ritual complete</span>
            ) : (
              <span>Target: {targetMinutes} minutes of mindful presence</span>
            )}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-4">
          {timerStatus === "idle" && (
            <button
              type="button"
              onClick={handleStartTimer}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-cinzel font-bold text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Begin Habit Ritual</span>
            </button>
          )}

          {timerStatus === "running" && (
            <button
              type="button"
              onClick={handlePauseTimer}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-emerald-400/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200 font-mono text-xs font-semibold transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Ritual</span>
            </button>
          )}

          {timerStatus === "paused" && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResumeTimer}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-cinzel font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
              <button
                type="button"
                onClick={handleResetTimer}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.04] text-slate-400 hover:text-white text-xs font-mono transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          )}
        </div>

        {/* Mindful Habit Checklist */}
        <div className="space-y-3 pt-6 border-t border-white/[0.08]">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mindful Anchor Checklist</span>
          </div>

          <div className="space-y-2">
            {checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklistItem(item.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                  item.checked
                    ? "border-emerald-500/40 bg-emerald-500/10 text-slate-200"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                    item.checked
                      ? "border-emerald-400 bg-emerald-400 text-slate-950 font-bold"
                      : "border-slate-600 bg-transparent"
                  }`}
                >
                  {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span className={`text-xs sm:text-sm ${item.checked ? "line-through text-slate-400" : "text-slate-200"}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Input */}
        <div className="space-y-2">
          <label
            htmlFor="habitReflection"
            className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
          >
            {config.reflectionLabel}
          </label>
          <input
            id="habitReflection"
            type="text"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="e.g. 10 minutes of box breathing, noticed calm focus returning"
            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-400 transition-all"
          />
        </div>

        {/* Completion Form */}
        <form onSubmit={handleSubmit} className="pt-6 border-t border-white/[0.08] space-y-5">
          {/* Real-World Honesty Checkbox */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedRealWorld}
                onChange={(e) => setConfirmedRealWorld(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-emerald-500/40 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 bg-[#0A0D15] cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong>Real-World Confirmation:</strong> {config.confirmationText}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-7">
              Habits grow from genuine daily practice. The visual plant reflects your commitment.
            </p>
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Finalize Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isFinishing || !confirmedRealWorld}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:from-emerald-300 hover:to-teal-200 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFinishing ? (
                <span>Nurturing Garden...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Harvest Ritual & Record Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
