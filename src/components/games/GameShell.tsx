"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Quest } from "@/lib/quests/types";
import { GameSession } from "@/lib/games/types";
import { GAME_CONFIG } from "@/lib/games/config";
import { CATEGORY_META, DIFFICULTY_REWARDS } from "@/lib/quests/config";
import { ATTRIBUTE_META } from "@/lib/assessment/scoring";
import { Logo } from "@/components/common/Logo";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import {
  ArrowLeft,
  Clock,
  Shield,
  Sparkles,
  Maximize2,
  Minimize2,
  X,
  AlertTriangle,
} from "lucide-react";

interface GameShellProps {
  quest: Quest;
  session: GameSession;
  onAbandon: () => Promise<void>;
  children: React.ReactNode;
  distractionFree?: boolean;
  onToggleDistractionFree?: () => void;
}

export function GameShell({
  quest,
  session,
  onAbandon,
  children,
  distractionFree = false,
  onToggleDistractionFree,
}: GameShellProps) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);

  const gameConfig = GAME_CONFIG[quest.game_type] || GAME_CONFIG.knowledge_dungeon;
  const catMeta = CATEGORY_META[quest.category] || CATEGORY_META.other;
  const attrMeta = ATTRIBUTE_META[quest.attribute] || ATTRIBUTE_META.discipline;
  const diffRewards = DIFFICULTY_REWARDS[quest.difficulty] || DIFFICULTY_REWARDS.normal;

  const handleConfirmAbandon = async () => {
    setIsAbandoning(true);
    try {
      await onAbandon();
    } finally {
      setIsAbandoning(false);
      setShowExitConfirm(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white">
      <ParticleBackground />

      {/* Top Game Navigation Shell */}
      {!distractionFree && (
        <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#07080B]/90 backdrop-blur-md transition-all">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            {/* Left: Brand & Return */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.03] text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                aria-label="Pause or Exit Arena"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pause & Exit</span>
              </button>
              <Logo size="sm" showText={true} />
            </div>

            {/* Right: Quest Context Pill */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs font-mono">
                <span>{attrMeta.icon}</span>
                <span className="text-amber-300 font-bold">{attrMeta.label}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">{catMeta.label}</span>
              </div>

              <span
                className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${diffRewards.badgeColor}`}
              >
                {diffRewards.label}
              </span>

              {onToggleDistractionFree && (
                <button
                  type="button"
                  onClick={onToggleDistractionFree}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.04] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer"
                  title="Toggle Distraction-Free Mode"
                  aria-label="Toggle Distraction-Free Mode"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Floating Distraction-Free Exit Button */}
      {distractionFree && onToggleDistractionFree && (
        <div className="fixed top-4 right-4 z-50">
          <button
            type="button"
            onClick={onToggleDistractionFree}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-black/80 text-xs font-mono text-slate-300 hover:text-white backdrop-blur-md shadow-lg cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Focus Mode</span>
          </button>
        </div>
      )}

      {/* Main Mini-Game Canvas */}
      <main className="relative z-20 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-center">
        {children}
      </main>

      {/* Footer */}
      {!distractionFree && (
        <footer className="relative z-20 py-4 text-center text-[11px] text-slate-500 font-cinzel tracking-widest uppercase border-t border-white/[0.04]">
          Real-World Activity Engine • The Forge Records Your Effort
        </footer>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="exitModalTitle"
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0A0D15] p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 id="exitModalTitle" className="font-cinzel text-xl font-bold text-slate-100">
                Pause Quest & Exit?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Your session will be marked as abandoned and the mission reset to pending. No progress will be lost.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                disabled={isAbandoning}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs sm:text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Resume Session
              </button>

              <button
                type="button"
                onClick={handleConfirmAbandon}
                disabled={isAbandoning}
                className="px-5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                {isAbandoning ? "Pausing..." : "Exit to Quests"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
