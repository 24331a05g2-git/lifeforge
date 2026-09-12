"use client";

import React, { useState, useEffect, useRef } from "react";
import { Quest } from "@/lib/quests/types";
import { GameSession, TimerStatus } from "@/lib/games/types";
import { GAME_CONFIG } from "@/lib/games/config";
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface FocusMissionProps {
  quest: Quest;
  session: GameSession;
  onComplete: (notes: string, confirmed: boolean) => Promise<void>;
  distractionFree: boolean;
  onToggleDistractionFree: () => void;
}

export function FocusMission({
  quest,
  session,
  onComplete,
  distractionFree,
  onToggleDistractionFree,
}: FocusMissionProps) {
  const config = GAME_CONFIG.focus_mission;

  // Selected duration preset (in minutes), defaulting to quest's duration
  const [targetMinutes, setTargetMinutes] = useState<number>(quest.estimated_duration || 45);
  const [timerStatus, setTimerStatus] = useState<TimerStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Accomplishment Reflection & Confirmation
  const [accomplishment, setAccomplishment] = useState("");
  const [confirmedRealWorld, setConfirmedRealWorld] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Wall-clock tracking refs
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedRealWorld) {
      setErrorMessage("Please confirm that you performed this deep work session in the real world.");
      return;
    }

    setIsFinishing(true);
    setErrorMessage(null);

    try {
      await onComplete(accomplishment.trim(), confirmedRealWorld);
    } catch (err: unknown) {
      console.error("Focus mission completion error:", err);
      setErrorMessage("Could not record mission completion. Please try again.");
      setIsFinishing(false);
    }
  };

  const minutesDisplay = Math.floor(remainingSeconds / 60);
  const secondsDisplay = remainingSeconds % 60;
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalTargetSeconds) * 100));

  return (
    <div className="w-full space-y-8">
      {/* Cockpit Banner */}
      {!distractionFree && (
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-violet-500/40 bg-violet-500/15 text-violet-300 text-xs font-mono font-bold tracking-widest uppercase">
            <span>🚀 FOCUS MISSION</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-slate-100">
            {quest.title}
          </h1>
          <p className="text-sm font-cinzel text-violet-200">
            &ldquo;{config.tagline}&rdquo;
          </p>
        </div>
      )}

      {/* Main Mission Bridge Card */}
      <div
        className={`relative rounded-3xl border border-violet-500/30 bg-[#0A0D15]/95 p-6 sm:p-12 backdrop-blur-xl shadow-[0_0_60px_rgba(139,92,246,0.15)] space-y-8 transition-all ${
          distractionFree ? "max-w-2xl mx-auto" : ""
        }`}
      >
        {/* Presets Row */}
        {timerStatus === "idle" && (
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs font-mono">
            <span className="text-slate-400 mr-2">MISSION LENGTH:</span>
            {config.timerPresets.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTargetMinutes(m)}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  targetMinutes === m
                    ? "border-violet-400 bg-violet-500/20 text-violet-200 font-bold shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                    : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
        )}

        {/* Big Countdown Timer */}
        <div className="text-center space-y-3">
          <div
            className="font-mono text-6xl sm:text-8xl font-bold tracking-tight text-violet-300 drop-shadow-[0_0_25px_rgba(139,92,246,0.4)] select-none"
            aria-live="polite"
          >
            {minutesDisplay.toString().padStart(2, "0")}:{secondsDisplay.toString().padStart(2, "0")}
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md mx-auto h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-xs font-mono text-slate-400">
            {timerStatus === "running" ? (
              <span className="text-violet-300 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                <span>Deep Work Shield Active • Distractions Locked Out</span>
              </span>
            ) : (
              <span>Target: {targetMinutes} minutes of uncompromised focus</span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {timerStatus === "idle" && (
            <button
              type="button"
              onClick={handleStartTimer}
              className="inline-flex items-center gap-2.5 px-8 py-3 rounded-xl font-cinzel font-bold text-sm text-slate-950 bg-gradient-to-r from-violet-400 via-purple-300 to-violet-400 hover:from-violet-300 hover:to-purple-200 shadow-[0_0_25px_rgba(139,92,246,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Initiate Focus Mission</span>
            </button>
          )}

          {timerStatus === "running" && (
            <button
              type="button"
              onClick={handlePauseTimer}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-violet-400/40 bg-violet-500/10 hover:bg-violet-500/20 text-violet-200 font-mono text-xs font-semibold transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Pause Sprint</span>
            </button>
          )}

          {timerStatus === "paused" && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResumeTimer}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-400 hover:bg-violet-300 text-slate-950 font-cinzel font-bold text-xs shadow-lg transition-all cursor-pointer"
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

          {/* Distraction-Free Toggle */}
          <button
            type="button"
            onClick={onToggleDistractionFree}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/[0.04] text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            {distractionFree ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{distractionFree ? "Normal View" : "Focus Shield View"}</span>
          </button>
        </div>

        {/* Mission Accomplishment Form */}
        <form onSubmit={handleSubmit} className="pt-6 border-t border-white/[0.08] space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="accomplishmentNotes"
              className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
            >
              {config.reflectionLabel} (Optional)
            </label>
            <input
              id="accomplishmentNotes"
              type="text"
              value={accomplishment}
              onChange={(e) => setAccomplishment(e.target.value)}
              placeholder="e.g. Refactored the authentication middleware and authored 4 API tests"
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 text-xs sm:text-sm focus:outline-none focus:border-violet-400 transition-all"
            />
          </div>

          {/* Real-World Honesty Checkbox */}
          <div className="p-4 rounded-xl border border-violet-500/20 bg-violet-500/[0.04] space-y-2">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmedRealWorld}
                onChange={(e) => setConfirmedRealWorld(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-violet-500/40 text-violet-500 focus:ring-violet-400 focus:ring-offset-0 bg-[#0A0D15] cursor-pointer"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong>Real-World Confirmation:</strong> {config.confirmationText}
              </span>
            </label>
            <p className="text-[11px] text-slate-500 pl-7">
              Deep focus is measured by actual real-world attention, not passive browser tabs.
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
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-cinzel font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-violet-400 via-purple-300 to-violet-400 hover:from-violet-300 hover:to-purple-200 shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFinishing ? (
                <span>Recording Sprint...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Conquer Focus Sprint & Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
