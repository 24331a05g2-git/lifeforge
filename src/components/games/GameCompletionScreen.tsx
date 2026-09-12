"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Quest } from "@/lib/quests/types";
import { GameSession } from "@/lib/games/types";
import { AuthoritativeRewardResult } from "@/lib/rpg/types";
import { CATEGORY_META } from "@/lib/quests/config";
import { ATTRIBUTE_META } from "@/lib/assessment/scoring";
import { LevelProgressBar } from "@/components/rpg/LevelProgressBar";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Coins,
  Flame,
  Award,
  ChevronUp,
} from "lucide-react";

interface GameCompletionScreenProps {
  quest: Quest;
  session: GameSession;
  elapsedSeconds: number;
  rewardResult?: AuthoritativeRewardResult;
}

export function GameCompletionScreen({
  quest,
  session,
  elapsedSeconds,
  rewardResult,
}: GameCompletionScreenProps) {
  const shouldReduceMotion = useReducedMotion();
  const catMeta = CATEGORY_META[quest.category] || CATEGORY_META.other;
  const attrMeta = ATTRIBUTE_META[quest.attribute] || ATTRIBUTE_META.discipline;

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const durationFormatted = `${minutes}m ${seconds.toString().padStart(2, "0")}s`;

  // Fallbacks if rewardResult is somehow missing
  const reward = rewardResult?.reward || {
    xp: quest.xp_reward || 40,
    gold: quest.gold_reward || 18,
    attribute: quest.attribute,
    attributeGain: 1,
  };

  const progression = rewardResult?.progression;
  const streak = rewardResult?.streak;
  const leveledUp = progression?.leveledUp ?? false;
  const newLevel = progression?.newLevel ?? 1;

  // Accessible screen reader announcement
  const screenReaderAnnouncement = `Quest Complete! You earned ${reward.xp} XP, ${reward.gold} Gold, and increased ${attrMeta.label} by ${reward.attributeGain}. ${
    leveledUp ? `Level Up! You reached Level ${newLevel}!` : ""
  } Current streak: ${streak?.currentStreak || 1} days.`;

  return (
    <div className="w-full max-w-xl mx-auto text-center font-mono">
      {/* Screen Reader Live Region */}
      <div className="sr-only" role="status" aria-live="polite">
        {screenReaderAnnouncement}
      </div>

      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative rounded-3xl border border-amber-500/40 bg-[#0A0D15]/95 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_80px_rgba(245,158,11,0.2)] space-y-6"
      >
        {/* Glowing Top Accent Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_20px_rgba(245,158,11,0.9)]" />

        {/* Victory Icon & Level Up Banner */}
        {leveledUp ? (
          <motion.div
            initial={shouldReduceMotion ? {} : { scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="space-y-3"
          >
            {/* Pulsing Level Up Emblem */}
            <div className="relative w-24 h-24 mx-auto rounded-3xl bg-gradient-to-b from-amber-400/20 to-amber-600/20 border-2 border-amber-400 text-amber-300 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.6)]">
              <ChevronUp className="w-7 h-7 text-amber-400 animate-bounce" />
              <span className="font-cinzel font-black text-xl tracking-wider">
                LVL {newLevel}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/60 bg-amber-400/15 text-amber-300 font-cinzel font-bold text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>LEVEL UP!</span>
            </div>

            <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-gold-gradient tracking-wide">
              You Have Grown Stronger
            </h1>
            <p className="text-xs sm:text-sm font-cinzel text-amber-200/90">
              &ldquo;Your discipline transforms into power. Level {newLevel} attained.&rdquo;
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* Mission Conquered Icon */}
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase">
              <span>⚔️ MISSION CONQUERED</span>
            </div>

            <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-gold-gradient tracking-wide">
              Quest Complete
            </h1>
            <p className="text-xs sm:text-sm font-cinzel text-amber-200">
              &ldquo;Session recorded. Your real-world effort fuels your evolution.&rdquo;
            </p>
          </div>
        )}

        {/* Authoritative Rewards Strip */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.08] to-transparent text-center">
          {/* XP Gained */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-center gap-1 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] text-slate-400 tracking-wider">XP REWARD</span>
            </div>
            <div className="font-cinzel text-xl sm:text-2xl font-black text-amber-300">
              +{reward.xp}
            </div>
            <div className="text-[10px] text-slate-400">EXPERIENCE</div>
          </motion.div>

          {/* Gold Gained */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1 border-x border-white/10"
          >
            <div className="flex items-center justify-center gap-1 text-amber-400">
              <Coins className="w-4 h-4" />
              <span className="text-[10px] text-slate-400 tracking-wider">TREASURY</span>
            </div>
            <div className="font-cinzel text-xl sm:text-2xl font-black text-amber-300">
              +{reward.gold}
            </div>
            <div className="text-[10px] text-slate-400">GOLD COINS</div>
          </motion.div>

          {/* Attribute Trained */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <div className="flex items-center justify-center gap-1 text-emerald-400">
              <span>{attrMeta.icon}</span>
              <span className="text-[10px] text-slate-400 tracking-wider">ATTRIBUTE</span>
            </div>
            <div className="font-cinzel text-xl sm:text-2xl font-black text-emerald-300">
              +{reward.attributeGain}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">{attrMeta.label}</div>
          </motion.div>
        </div>

        {/* Level Progression Bar */}
        {progression && (
          <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-left">
            <LevelProgressBar
              totalXp={progression.newTotalXp}
              showLevelBadge={true}
              showDetails={true}
            />
          </div>
        )}

        {/* Streak & Details Grid */}
        <div className="p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-left space-y-3 text-xs">
          {/* Streak Status Pill */}
          {streak && (
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>ACTIVE STREAK:</span>
              </span>
              <span className="font-bold text-orange-300 flex items-center gap-1.5">
                <span>{streak.currentStreak} DAYS</span>
                {streak.isNewRecord && (
                  <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] border border-orange-500/40">
                    NEW RECORD
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Duration */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>REAL-WORLD DURATION:</span>
            </span>
            <span className="font-bold text-amber-300">{durationFormatted}</span>
          </div>

          {/* Quest Name */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="text-slate-400">MISSION:</span>
            <span className="font-bold text-slate-100 max-w-[240px] truncate text-right">
              {quest.title}
            </span>
          </div>

          {/* Activity Notes */}
          {session.user_notes && (
            <div className="pt-1">
              <span className="text-slate-400 block mb-1">ACTIVITY NOTES / REFLECTION:</span>
              <p className="text-[11px] text-slate-300 bg-white/[0.03] p-2.5 rounded-lg border border-white/[0.04] italic">
                &ldquo;{session.user_notes}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Return to Quest Board CTA */}
        <div className="pt-2">
          <Link
            href="/quests"
            className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-cinzel font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
          >
            <span>Return to Quest Board</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
