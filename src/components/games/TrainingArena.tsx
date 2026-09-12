"use client";

import React, { useState, useEffect, useRef } from "react";
import { Quest } from "@/lib/quests/types";
import { GameSession, TimerStatus } from "@/lib/games/types";
import { GAME_CONFIG } from "@/lib/games/config";
import {
  Play,
  Pause,
  RotateCcw,
  Dumbbell,
  CheckCircle2,
  Plus,
  Trash2,
  AlertCircle,
  Clock,
  Flame,
  Check,
} from "lucide-react";

interface TrainingArenaProps {
  quest: Quest;
  session: GameSession;
  onComplete: (notes: string, confirmed: boolean) => Promise<void>;
}

interface WorkoutExercise {
  id: string;
  name: string;
  target: string;
  completed: boolean;
}

export function TrainingArena({
  quest,
  session,
  onComplete,
}: TrainingArenaProps) {
  const config = GAME_CONFIG.training_arena;

  // Timer state
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Exercises checklist
  const [exercises, setExercises] = useState<WorkoutExercise[]>([
    { id: "1", name: "Warmup Stretches & Mobility", target: "5 minutes", completed: false },
    { id: "2", name: "Primary Exercise Circuit", target: "3 sets × 12 reps", completed: false },
    { id: "3", name: "Secondary / Core Work", target: "3 sets × 15 reps", completed: false },
    { id: "4", name: "Cool-down & Heart Recovery", target: "5 minutes", completed: false },
  ]);
  const [newExerciseName, setNewExerciseName] = useState("");

  // Notes & Confirmation
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [confirmedRealWorld, setConfirmedRealWorld] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Wall-clock tracking
  const startTimeRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerStatus === "running") {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const delta = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedSeconds(accumulatedSecondsRef.current + delta);
        }
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStatus]);

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

  const toggleExercise = (id: string) => {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e))
    );
  };

  const addExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;
    setExercises((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newExerciseName.trim(),
        target: "Custom sets",
        completed: false,
      },
    ]);
    setNewExerciseName("");
  };

  const removeExercise = (id: string) => {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedRealWorld) {
      setErrorMessage("Please confirm that you performed this physical workout in the real world.");
      return;
    }

    setIsFinishing(true);
    setErrorMessage(null);

    try {
      const exerciseSummary = exercises
        .map((e) => `[${e.completed ? "X" : " "}] ${e.name} (${e.target})`)
        .join("\n");
      const fullNotes = [workoutNotes.trim(), "Workout Circuit:", exerciseSummary]
        .filter(Boolean)
        .join("\n");

      await onComplete(fullNotes, confirmedRealWorld);
    } catch (err: unknown) {
      console.error("Training arena completion error:", err);
      setErrorMessage("Could not record training completion. Please try again.");
      setIsFinishing(false);
    }
  };

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const completedExercisesCount = exercises.filter((e) => e.completed).length;

  return (
    <div className="w-full space-y-8">
      {/* Arena Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase">
          <span>🏟️ TRAINING ARENA</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-slate-100">
          {quest.title}
        </h1>
        <p className="text-sm font-cinzel text-amber-200">
          &ldquo;{config.tagline}&rdquo; — {config.callToAction}
        </p>
      </div>

      {/* Main Training Card */}
      <div className="relative rounded-3xl border border-amber-500/30 bg-[#0A0D15]/90 p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(245,158,11,0.12)] space-y-8">
        {/* Stopwatch Display */}
        <div className="text-center space-y-3">
          <div
            className="font-mono text-5xl sm:text-7xl font-bold tracking-tight text-amber-300 drop-shadow-[0_0_20px_rgba(245,158,11,0.35)] select-none"
            aria-live="polite"
          >
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
          </div>

          <div className="text-xs font-mono text-slate-400 flex items-center justify-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Exertion Stopwatch</span>
            <span className="text-slate-600">•</span>
            <span>Target: ~{quest.estimated_duration}m</span>
          </div>

          {/* Stopwatch Controls */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {timerStatus === "idle" && (
              <button
                type="button"
                onClick={handleStartTimer}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-cinzel font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Training Stopwatch</span>
              </button>
            )}

            {timerStatus === "running" && (
              <button
                type="button"
                onClick={handlePauseTimer}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 font-mono text-xs font-semibold transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Stopwatch</span>
              </button>
            )}

            {timerStatus === "paused" && (
              <>
                <button
                  type="button"
                  onClick={handleResumeTimer}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-cinzel font-bold text-xs shadow-lg transition-all cursor-pointer"
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
              </>
            )}
          </div>
        </div>

        {/* Workout Circuit Checklist */}
        <div className="space-y-3 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-semibold text-slate-200 uppercase tracking-wider">
              Workout Circuit Tracker ({completedExercisesCount}/{exercises.length} sets completed)
            </span>
            <span className="text-amber-400">Strength Exertion</span>
          </div>

          <div className="space-y-2">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  ex.completed
                    ? "border-emerald-500/40 bg-emerald-500/10 text-slate-200"
                    : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExercise(ex.id)}
                  className="flex items-center gap-3 text-left flex-1 cursor-pointer select-none"
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      ex.completed
                        ? "border-emerald-400 bg-emerald-400 text-slate-950 font-bold"
                        : "border-slate-600 bg-transparent"
                    }`}
                  >
                    {ex.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className={`text-xs sm:text-sm font-medium ${ex.completed ? "line-through text-slate-400" : "text-slate-100"}`}>
                      {ex.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">{ex.target}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => removeExercise(ex.id)}
                  className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                  aria-label="Remove exercise"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add custom exercise */}
          <form onSubmit={addExercise} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Add another exercise / set (e.g. Kettlebell Swings 3 × 20)..."
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              Add Set
            </button>
          </form>
        </div>

        {/* Workout Notes */}
        <div className="space-y-2">
          <label
            htmlFor="workoutNotes"
            className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
          >
            {config.reflectionLabel}
          </label>
          <input
            id="workoutNotes"
            type="text"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="e.g. 5km run completed in 24m, felt energized on hills"
            className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-400 transition-all"
          />
        </div>

        {/* Completion Form */}
        <form onSubmit={handleSubmit} className="pt-6 border-t border-white/[0.08] space-y-5">
          {/* Real-World Honesty Checkbox */}
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedRealWorld}
                onChange={(e) => setConfirmedRealWorld(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-amber-500/40 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 bg-[#0A0D15] cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong>Real-World Confirmation:</strong> {config.confirmationText}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-7">
              The application does not use automated sensors. Your honest real-world effort builds authentic power.
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
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFinishing ? (
                <span>Recording Workout...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conquer Arena & Record Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
