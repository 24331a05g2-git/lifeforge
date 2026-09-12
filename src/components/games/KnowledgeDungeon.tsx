"use client";

import React, { useState, useEffect, useRef } from "react";
import { Quest } from "@/lib/quests/types";
import { GameSession, TimerStatus } from "@/lib/games/types";
import { GAME_CONFIG } from "@/lib/games/config";
import {
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  FileText,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface KnowledgeDungeonProps {
  quest: Quest;
  session: GameSession;
  onComplete: (notes: string, confirmed: boolean) => Promise<void>;
}

export function KnowledgeDungeon({
  quest,
  session,
  onComplete,
}: KnowledgeDungeonProps) {
  const config = GAME_CONFIG.knowledge_dungeon;

  // Selected duration preset (in minutes), defaulting to quest's estimated duration
  const [targetMinutes, setTargetMinutes] = useState<number>(quest.estimated_duration || 45);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Reflection & Study Notes
  const [studyNotes, setStudyNotes] = useState("");
  const [reflection, setReflection] = useState("");
  const [confirmedRealWorld, setConfirmedRealWorld] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Wall-clock tracking refs
  const startTimeRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalTargetSeconds = targetMinutes * 60;
  const remainingSeconds = Math.max(0, totalTargetSeconds - elapsedSeconds);

  // Wall-clock accurate timer implementation
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerStatus, totalTargetSeconds]);

  const handleStartTimer = () => {
    setTimerStatus("running");
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedRealWorld) {
      setErrorMessage("Please confirm that you engaged in this study session in the real world.");
      return;
    }

    setIsFinishing(true);
    setErrorMessage(null);

    try {
      const combinedNotes = [studyNotes.trim(), reflection.trim()].filter(Boolean).join("\n---\n");
      await onComplete(combinedNotes, confirmedRealWorld);
    } catch (err: unknown) {
      console.error("Knowledge dungeon completion error:", err);
      setErrorMessage("Could not record lesson completion. Please try again.");
      setIsFinishing(false);
    }
  };

  const minutesDisplay = Math.floor(remainingSeconds / 60);
  const secondsDisplay = remainingSeconds % 60;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalTargetSeconds) * 100));

  return (
    <div className="w-full space-y-8">
      {/* Dungeon Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-sky-500/40 bg-sky-500/15 text-sky-300 text-xs font-mono font-bold tracking-widest uppercase">
          <span>📖 KNOWLEDGE DUNGEON</span>
        </div>
        <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-slate-100">
          {quest.title}
        </h1>
        <p className="text-sm font-cinzel text-sky-200">
          &ldquo;{config.tagline}&rdquo; — {config.callToAction}
        </p>
      </div>

      {/* Main Study Arena Card */}
      <div className="relative rounded-3xl border border-sky-500/30 bg-[#0A0D15]/90 p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(56,189,248,0.12)] space-y-8">
        {/* Preset Selectors */}
        {timerStatus === "idle" && (
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-slate-400 mr-2">DURATION PRESET:</span>
            {config.timerPresets.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTargetMinutes(m)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  targetMinutes === m
                    ? "border-sky-400 bg-sky-500/20 text-sky-200 font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        )}

        {/* Big Countdown Timer Display */}
        <div className="text-center space-y-3">
          <div
            className="font-mono text-5xl sm:text-7xl font-bold tracking-tight text-sky-300 drop-shadow-[0_0_20px_rgba(56,189,248,0.35)] select-none"
            aria-live="polite"
          >
            {minutesDisplay.toString().padStart(2, "0")}:{secondsDisplay.toString().padStart(2, "0")}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-xs font-mono text-slate-400">
            {elapsedSeconds > 0 ? (
              <span>
                Elapsed: <strong>{Math.floor(elapsedSeconds / 60)}m {elapsedSeconds % 60}s</strong> •{" "}
                {progressPercent}% completed
              </span>
            ) : (
              <span>Target: {targetMinutes} minutes of focused learning</span>
            )}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-4">
          {timerStatus === "idle" && (
            <button
              type="button"
              onClick={handleStartTimer}
              className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl font-cinzel font-bold text-sm text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 hover:from-sky-300 hover:to-sky-200 shadow-[0_0_25px_rgba(56,189,248,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter Dungeon (Start)</span>
            </button>
          )}

          {timerStatus === "running" && (
            <button
              type="button"
              onClick={handlePauseTimer}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-sky-400/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-200 font-mono text-xs font-semibold transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Delve</span>
            </button>
          )}

          {timerStatus === "paused" && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResumeTimer}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-cinzel font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
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

        {/* Study Notes Scratchpad */}
        <div className="space-y-2">
          <label
            htmlFor="dungeonStudyNotes"
            className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>Active Study Scratchpad (Optional Notes & Insights)</span>
          </label>
          <textarea
            id="dungeonStudyNotes"
            rows={3}
            value={studyNotes}
            onChange={(e) => setStudyNotes(e.target.value)}
            placeholder="Capture key concepts, code snippets, book notes, or definitions as you study..."
            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-slate-100 placeholder:text-slate-600 text-xs sm:text-sm font-mono focus:outline-none focus:border-sky-400 transition-all resize-none"
          />
        </div>

        {/* Completion Confirmation Form */}
        <form
          onSubmit={handleSubmit}
          className="pt-6 border-t border-white/[0.08] space-y-5"
        >
          <div className="space-y-2">
            <label
              htmlFor="lessonReflection"
              className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
            >
              {config.reflectionLabel} (Optional Reflection)
            </label>
            <input
              id="lessonReflection"
              type="text"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="e.g. Learned how React 19 handles Server Components and async cookies"
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 text-xs sm:text-sm focus:outline-none focus:border-sky-400 transition-all"
            />
          </div>

          {/* Real-World Honesty Checkbox */}
          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/[0.04] space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedRealWorld}
                onChange={(e) => setConfirmedRealWorld(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-sky-500/40 text-sky-500 focus:ring-sky-400 focus:ring-offset-0 bg-[#0A0D15] cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong>Real-World Confirmation:</strong> I confirm that I engaged in this study session in the real world.
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-7">
              The Forge trusts your integrity. Quests reflect real effort, not virtual clicks.
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
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-sky-400 hover:from-sky-300 hover:to-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFinishing ? (
                <span>Sealing Lesson...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conquer Lesson & Record Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
