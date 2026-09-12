"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BossBattleSummary } from "@/lib/bosses/types";
import { claimBossRewardAction } from "@/actions/bosses";
import {
  Skull,
  Trophy,
  Sparkles,
  Coins,
  Flame,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface BossBattleCardProps {
  bossSummary: BossBattleSummary;
  onClaimSuccess?: (xp: number, gold: number) => void;
}

export function BossBattleCard({
  bossSummary,
  onClaimSuccess,
}: BossBattleCardProps) {
  const { boss, remainingQuests, progressPercent, isReadyToClaim } = bossSummary;

  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(boss.reward_claimed);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClaim = async () => {
    if (isClaiming || claimed) return;
    setIsClaiming(true);
    setErrorMessage(null);

    try {
      const res = await claimBossRewardAction(boss.id);
      if (res.success && res.data) {
        setClaimed(true);
        onClaimSuccess?.(res.data.xpEarned, res.data.goldEarned);
      } else {
        setErrorMessage(res.error || "Failed to claim victory bounty.");
      }
    } catch {
      setErrorMessage("Network error while claiming bounty.");
    } finally {
      setIsClaiming(false);
    }
  };

  const isDefeated = boss.status === "defeated";

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border backdrop-blur-xl transition-all shadow-xl ${
        isDefeated
          ? "border-amber-500/50 bg-gradient-to-b from-amber-500/[0.09] via-[#0D1017]/95 to-[#07080B]/95 shadow-[0_0_40px_rgba(245,158,11,0.12)]"
          : "border-red-500/30 bg-gradient-to-b from-red-500/[0.05] via-[#0D1017]/95 to-[#07080B]/95 shadow-[0_0_35px_rgba(239,68,68,0.08)]"
      }`}
    >
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.08] bg-white/[0.02]">
        <div className="flex items-center gap-2">
          {isDefeated ? (
            <Trophy className="w-4 h-4 text-amber-400" />
          ) : (
            <Skull className="w-4 h-4 text-rose-400" />
          )}
          <span
            className={`text-[11px] font-mono uppercase tracking-widest font-bold ${
              isDefeated ? "text-amber-400" : "text-rose-400"
            }`}
          >
            {isDefeated ? "MAJOR GOAL CONQUERED" : "ACTIVE BOSS ENCOUNTER"}
          </span>
        </div>

        <span className="px-2.5 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-mono text-slate-400 uppercase tracking-wider">
          {boss.goal_category === "all" ? "All Disciplines" : `${boss.goal_category} Goal`}
        </span>
      </div>

      <div className="p-6 sm:p-7 space-y-6">
        {/* Title & Lore Header */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h2 className="font-cinzel text-xl sm:text-2xl font-black tracking-wide text-slate-100 flex items-center gap-2">
              <span>{boss.title}</span>
              {isDefeated && <Sparkles className="w-5 h-5 text-amber-400" />}
            </h2>
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="text-amber-400 font-bold">+{boss.xp_reward} XP</span>
              <span className="text-slate-500">•</span>
              <span className="text-yellow-400 font-bold">+{boss.gold_reward} Gold</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 font-serif italic leading-relaxed">
            &ldquo;{boss.description}&rdquo;
          </p>
        </div>

        {/* HP / Quests Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">
              {isDefeated
                ? "Target Annihilated"
                : `${boss.progress} of ${boss.target_value} quests conquered`}
            </span>
            <span
              className={`font-bold ${
                isDefeated ? "text-amber-400" : "text-rose-400"
              }`}
            >
              {isDefeated ? "100% COMPLETE" : `${remainingQuests} quests remain`}
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-900 border border-white/10 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDefeated
                  ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                  : "bg-gradient-to-r from-rose-600 via-orange-500 to-amber-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Defeated Lore Celebration or Guidance */}
        {isDefeated ? (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-mono font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>BOSS DEFEATED: TRIUMPH OF CONSISTENCY</span>
            </div>
            <p className="text-xs text-slate-300 font-serif italic">
              &ldquo;You didn&apos;t just finish a project. You became someone capable of building it.&rdquo;
            </p>

            {/* Victory Bounty Claim Action */}
            <div className="pt-2 flex items-center justify-between gap-4 flex-wrap">
              {claimed ? (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Victory Bounty Claimed (+{boss.xp_reward} XP, +{boss.gold_reward} Gold)</span>
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-cinzel text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-950/40 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isClaiming ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Claiming Bounty...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>Claim Victory Bounty (+{boss.xp_reward} XP, +{boss.gold_reward} Gold)</span>
                    </>
                  )}
                </button>
              )}

              {errorMessage && (
                <span className="text-xs text-rose-400 font-mono">{errorMessage}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Complete relevant quests to inflict damage.</span>
            </div>

            <Link
              href="/quests"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:border-amber-500/40 bg-white/[0.03] hover:bg-amber-500/10 text-xs font-mono text-slate-200 transition-all self-start sm:self-auto"
            >
              <span>View Quests</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
