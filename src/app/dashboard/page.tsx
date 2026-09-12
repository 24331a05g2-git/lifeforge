import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getWorldOverviewAction } from "@/actions/dashboard";
import { getGameMasterAdviceAction } from "@/actions/game-master";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { AppNavbar } from "@/components/navigation/AppNavbar";
import { LevelProgressBar } from "@/components/rpg/LevelProgressBar";
import { CharacterEvolutionBadge } from "@/components/character/CharacterEvolutionBadge";
import { CharacterStatsPanel } from "@/components/character/CharacterStatsPanel";
import { DailyAdventureProgress } from "@/components/world/DailyAdventureProgress";
import { TodaysQuestBoard } from "@/components/world/TodaysQuestBoard";
import { RewardHistory } from "@/components/rpg/RewardHistory";
import { GameMasterCard } from "@/components/game-master/GameMasterCard";
import { BossBattleCard } from "@/components/bosses/BossBattleCard";
import { getCurrentTimeInTimezone } from "@/lib/notifications/rules";
import { isBedtimeWindow } from "@/lib/camp/rules";
import { Flame, Sparkles, Moon, ArrowRight, Trophy, ShoppingBag } from "lucide-react";

export const metadata = {
  title: "World Command | LIFEFORGE",
  description: "Your personal Life RPG world and daily quest operations center.",
};

export default async function DashboardPage() {
  const result = await getWorldOverviewAction();

  if (!result.success || !result.data) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  const {
    profile,
    todayQuests,
    dailyStats,
    recentVictories,
    activeBoss,
    unlockedAchievementsCount,
  } = result.data;

  // If character has not been discovered yet
  if (!profile.assessment_completed) {
    redirect("/character-discovery");
  }

  const stats = {
    strength: profile.strength || 50,
    intellect: profile.intellect || 50,
    focus: profile.focus || 50,
    discipline: profile.discipline || 50,
    energy: profile.energy || 50,
  };

  const streak = profile.current_streak || 0;
  const longestStreak = profile.longest_streak || 0;

  // Consult ARIA (Game Master) for real-time contextual guidance
  const adviceRes = await getGameMasterAdviceAction();
  const defaultAdvice = {
    id: "aria-default",
    context: "inactive" as const,
    title: "Citadel Standby",
    message: "Standing by in the citadel, Adventurer. Your journey awaits.",
    actionLabel: "View Quests",
    actionHref: "/quests",
    priority: "low" as const,
  };
  const ariaMessage =
    adviceRes.success && adviceRes.data ? adviceRes.data.message : defaultAdvice;
  const ariaContext = adviceRes.success && adviceRes.data ? adviceRes.data.contextData : undefined;

  // Check if it's evening or near bedtime for Nightly Camp invitation
  const currentTimeStr = getCurrentTimeInTimezone(profile.timezone || "UTC");
  const isCampTime = isBedtimeWindow(currentTimeStr, profile.bedtime || "22:30");

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white pb-16 md:pb-0">
      <ParticleBackground />

      {/* Unified RPG Navbar */}
      <AppNavbar
        activeTab="world"
        characterName={profile.character_name}
        level={profile.level}
        gold={profile.gold}
        streak={streak}
      />

      {/* Main World Content */}
      <main className="relative z-20 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Character Realm Hero Banner */}
        <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.06] via-white/[0.02] to-transparent bg-[#0A0D15]/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Evolution Emblem + Identity */}
            <div className="flex items-center gap-5 sm:gap-6">
              <CharacterEvolutionBadge
                level={profile.level}
                archetype={profile.archetype}
                size="md"
              />

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-widest">{profile.archetype}</span>
                </div>
                <h1 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-gold-gradient tracking-wide">
                  {profile.character_name}
                </h1>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-400 font-mono flex-wrap">
                  <span>Level {profile.level}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold">{profile.gold} Gold Coins</span>
                  <span>•</span>
                  <Link
                    href="/character"
                    className="hover:text-amber-300 text-slate-300 transition-colors inline-flex items-center gap-1"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{unlockedAchievementsCount ?? 0}/8 Feats</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Streak Momentum Card */}
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] space-y-2 max-w-xs w-full font-mono text-xs self-start md:self-auto">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-orange-400 font-bold">
                  <Flame className="w-4 h-4" />
                  <span>{streak} DAY STREAK</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Record: {longestStreak}d
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {streak <= 1
                  ? "A new streak begins today. Every legend starts with a single step."
                  : "You're building momentum. Your consistency is forging your character."}
              </p>
            </div>
          </div>

          {/* Level Progress Bar Strip */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <LevelProgressBar
              totalXp={profile.xp || 0}
              showLevelBadge={true}
              showDetails={true}
            />
          </div>
        </section>

        {/* ARIA — The Living RPG Companion & Game Master Guidance */}
        <section aria-label="Game Master Guidance">
          <GameMasterCard
            initialMessage={ariaMessage}
            initialContext={ariaContext}
          />
        </section>

        {/* Nightly Camp Invitation Banner */}
        <section aria-label="Nightly Camp Invitation">
          <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-r from-orange-950/25 via-[#0B0E17]/90 to-[#0A0D15]/90 p-5 sm:p-6 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_35px_rgba(245,158,11,0.06)]">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 flex items-center justify-center text-indigo-300 flex-shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 uppercase tracking-wider font-bold">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>{isCampTime ? "Nightfall Approaches • Camp is Active" : "Nightly Camp Open"}</span>
                </div>
                <h3 className="font-cinzel text-base font-bold text-slate-100">
                  Review Today & Prepare Tomorrow
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Review today&apos;s deeds, reschedule unfinished trials, and forge tomorrow&apos;s quest plan.
                </p>
              </div>
            </div>
            <Link
              href="/nightly-camp"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-cinzel text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-center flex-shrink-0 shadow-md shadow-amber-950/30 active:scale-95"
            >
              <span>Enter Camp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Active Boss Encounter */}
        {activeBoss && (
          <section aria-label="Active Boss Battle">
            <BossBattleCard bossSummary={activeBoss} />
          </section>
        )}

        {/* 2-Column Tactical World Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Today's Adventure & Attributes */}
          <div className="lg:col-span-5 space-y-6">
            {/* Today's Adventure Progress */}
            <DailyAdventureProgress stats={dailyStats} />

            {/* 5 Core Attributes Panel */}
            <CharacterStatsPanel stats={stats} />
          </div>

          {/* Right Column (7 cols): Today's Quest Board (Answering "What should I do today?") */}
          <div className="lg:col-span-7 space-y-6" id="today-quests">
            <TodaysQuestBoard initialQuests={todayQuests} />
          </div>
        </div>

        {/* Bottom: Recent Victories Chronicle */}
        <section>
          <RewardHistory initialEvents={recentVictories} />
        </section>
      </main>

      {/* Cinematic Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500 font-cinzel tracking-widest uppercase border-t border-white/[0.04]">
        Don&apos;t just manage your life. Play it.
      </footer>
    </div>
  );
}
