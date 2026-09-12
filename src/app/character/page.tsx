import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { AppNavbar } from "@/components/navigation/AppNavbar";
import { LevelProgressBar } from "@/components/rpg/LevelProgressBar";
import { CharacterEvolutionBadge } from "@/components/character/CharacterEvolutionBadge";
import { CharacterStatsPanel } from "@/components/character/CharacterStatsPanel";
import { ARCHETYPES } from "@/lib/assessment/archetypes";
import { ATTRIBUTE_META } from "@/lib/assessment/scoring";
import { AttributeType } from "@/lib/assessment/types";
import { getCharacterEvolution } from "@/lib/rpg/evolution";
import Link from "next/link";
import { getUserAchievementsAction } from "@/actions/achievements";
import { getUserInventoryAction } from "@/actions/economy";
import { AchievementList } from "@/components/achievements/AchievementList";
import {
  Shield,
  Sparkles,
  Flame,
  Coins,
  Compass,
  Trophy,
  Target,
  ChevronRight,
  TrendingUp,
  Zap,
  ShoppingBag,
  ArrowRight,
  Package,
} from "lucide-react";

export const metadata = {
  title: "Character Dossier | LIFEFORGE",
  description: "Your complete RPG character sheet, archetype lore, and evolution roadmap.",
};

export default async function CharacterPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/character");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !profile || !profile.assessment_completed) {
    redirect("/character-discovery");
  }

  const archetypeKey = profile.archetype.toLowerCase().trim().replace(/^the\s+/, "");
  const archetypeInfo = ARCHETYPES[archetypeKey] || ARCHETYPES.strategist;
  const evolution = getCharacterEvolution(profile.level, profile.archetype);

  // Fetch Achievements and Inventory Collection
  const [achievementsRes, inventoryRes] = await Promise.all([
    getUserAchievementsAction(),
    getUserInventoryAction(),
  ]);

  const achievements = achievementsRes.success ? achievementsRes.achievements : [];
  const unlockedCount = achievementsRes.success ? achievementsRes.unlockedCount : 0;
  const totalCount = achievementsRes.success ? achievementsRes.totalCount : 8;
  const inventory = inventoryRes.success ? inventoryRes.inventory : [];

  const stats: Record<AttributeType, number> = {
    strength: profile.strength || 50,
    intellect: profile.intellect || 50,
    focus: profile.focus || 50,
    discipline: profile.discipline || 50,
    energy: profile.energy || 50,
  };

  // Sort attributes to identify Top Strengths and Opportunities for Growth
  const sortedStats = (Object.keys(stats) as AttributeType[])
    .map((attr) => ({
      attr,
      val: stats[attr],
      meta: ATTRIBUTE_META[attr],
    }))
    .sort((a, b) => b.val - a.val);

  const topStrengths = sortedStats.slice(0, 2);
  const growthAreas = sortedStats.slice(-2).reverse();

  const allTiers = [
    { tier: 1, name: "Initiate", level: "Levels 1–4", desc: "The Awakening" },
    { tier: 2, name: "Apprentice", level: "Levels 5–9", desc: "The Forging" },
    { tier: 3, name: "Adept", level: "Levels 10–19", desc: "The Mastery" },
    { tier: 4, name: "Master", level: "Levels 20+", desc: "The Ascension" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white pb-16 md:pb-0">
      <ParticleBackground />

      {/* Unified RPG Navbar */}
      <AppNavbar
        activeTab="character"
        characterName={profile.character_name}
        level={profile.level}
        gold={profile.gold}
        streak={profile.current_streak || 0}
      />

      {/* Main Character Sheet Content */}
      <main className="relative z-20 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Top Header Card */}
        <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/[0.08] via-white/[0.02] to-transparent bg-[#0A0D15]/90 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Evolution Badge & Titles */}
            <div className="flex items-center gap-5 sm:gap-6">
              <CharacterEvolutionBadge
                level={profile.level}
                archetype={profile.archetype}
                size="lg"
              />

              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/10 text-xs font-mono text-amber-300 font-bold">
                  <span>{archetypeInfo.icon}</span>
                  <span>{archetypeInfo.title}</span>
                </div>

                <h1 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-gold-gradient tracking-wide">
                  {profile.character_name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-400 font-mono">
                  {evolution.title} • {archetypeInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-xs w-full font-mono text-xs self-start md:self-auto">
              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03] space-y-1">
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-[11px] text-slate-400">STREAK</span>
                </div>
                <div className="font-bold text-amber-300 text-sm">
                  {profile.current_streak || 0} Days
                </div>
                <div className="text-[10px] text-slate-500">
                  Record: {profile.longest_streak || 0}d
                </div>
              </div>

              <div className="p-3 rounded-xl border border-white/10 bg-white/[0.03] space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Coins className="w-4 h-4" />
                  <span className="text-[11px] text-slate-400">TREASURY</span>
                </div>
                <div className="font-bold text-amber-300 text-sm">
                  {profile.gold || 0} Gold
                </div>
                <div className="text-[10px] text-slate-500">
                  Total cumulative
                </div>
              </div>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mt-6 pt-5 border-t border-white/[0.08]">
            <LevelProgressBar
              totalXp={profile.xp || 0}
              showLevelBadge={true}
              showDetails={true}
            />
          </div>
        </section>

        {/* 2-Column Character Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Archetype Lore & Strengths */}
          <div className="lg:col-span-5 space-y-6">
            {/* Archetype Lore Card */}
            <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-5 sm:p-7 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <Compass className="w-4 h-4" />
                <span>ARCHETYPE CHRONICLE</span>
              </div>

              <h3 className="font-cinzel text-xl font-bold text-slate-100">
                {archetypeInfo.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
                {archetypeInfo.description}
              </p>

              <blockquote className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] text-xs font-cinzel italic text-amber-200/90 leading-relaxed">
                &ldquo;{archetypeInfo.quote}&rdquo;
              </blockquote>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-5 sm:p-7 backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                <TrendingUp className="w-4 h-4" />
                <span>DISCOVERY ASSESSMENT</span>
              </div>

              {/* Primary Strengths */}
              <div className="space-y-2">
                <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Primary Strengths</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {topStrengths.map(({ attr, val, meta }) => (
                    <div
                      key={attr}
                      className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{meta.icon}</span>
                        <span className="font-bold text-emerald-300">{val}</span>
                      </div>
                      <div className="font-cinzel font-bold text-slate-200 text-xs truncate">
                        {meta.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Areas */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Growth Opportunities</span>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {growthAreas.map(({ attr, val, meta }) => (
                    <div
                      key={attr}
                      className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{meta.icon}</span>
                        <span className="font-bold text-amber-300">{val}</span>
                      </div>
                      <div className="font-cinzel font-bold text-slate-200 text-xs truncate">
                        {meta.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Focus Goals */}
              {profile.selected_goals && profile.selected_goals.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/[0.06] font-mono text-xs">
                  <div className="text-slate-400 uppercase tracking-wider text-[11px]">
                    Active Life Focus Areas:
                  </div>
                  <div className="space-y-1.5">
                    {profile.selected_goals.map((g: string, i: number) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-slate-300 text-[11px]"
                      >
                        ✦ {g}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (7 cols): Attributes & Evolution Roadmap */}
          <div className="lg:col-span-7 space-y-6">
            {/* 5 Core Attributes Matrix */}
            <CharacterStatsPanel stats={stats} />

            {/* Visual Evolution Tier Roadmap */}
            <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-5 sm:p-7 backdrop-blur-xl space-y-5 font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2 text-xs text-amber-400">
                  <Trophy className="w-4 h-4" />
                  <span>EVOLUTION ROADMAP</span>
                </div>
                <span className="text-xs text-slate-400">
                  Current: Tier {evolution.tierNumber} ({evolution.name})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allTiers.map((t) => {
                  const isCurrent = t.tier === evolution.tierNumber;
                  const isUnlocked = profile.level >= (t.tier === 1 ? 1 : t.tier === 2 ? 5 : t.tier === 3 ? 10 : 20);

                  return (
                    <div
                      key={t.tier}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? "border-amber-500/60 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                          : isUnlocked
                          ? "border-white/10 bg-white/[0.02]"
                          : "border-white/[0.04] bg-white/[0.01] opacity-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          TIER {t.tier}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {t.level}
                        </span>
                      </div>
                      <h4 className="font-cinzel font-bold text-slate-100 text-sm">
                        {t.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {t.desc}
                      </p>
                      {isCurrent && (
                        <div className="mt-2 text-[10px] text-amber-300 font-bold inline-flex items-center gap-1">
                          <span>Active Tier</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Feats of the Realm (Achievements) */}
        <section aria-label="Feats and Achievements" id="achievements">
          <AchievementList
            initialAchievements={achievements}
            unlockedCount={unlockedCount}
            totalCount={totalCount}
          />
        </section>

        {/* Character Vault & Cosmetics */}
        <section aria-label="Character Vault">
          <div className="rounded-3xl border border-white/10 bg-[#0A0D15]/90 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-center text-amber-300">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-cinzel text-lg font-bold text-slate-100">
                    Character Vault & Relics
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {inventory.length} Prestige Cosmetics Collected
                  </p>
                </div>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-cinzel text-xs font-bold uppercase tracking-wider transition-all self-start sm:self-auto"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Visit Citadel Shop</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {inventory.length === 0 ? (
              <div className="text-center py-8 text-slate-500 space-y-2">
                <p className="text-sm font-cinzel text-slate-400">Your vault is currently empty.</p>
                <p className="text-xs font-mono">
                  Conquer daily trials to earn Gold and forge virtual cosmetics at the Emporium.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-amber-500/30 bg-white/[0.02] flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-300">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-slate-100 uppercase">
                        {item.item_key.replace("_", " ")}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        Acquired {new Date(item.acquired_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Cinematic Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500 font-cinzel tracking-widest uppercase border-t border-white/[0.04]">
        Don&apos;t just manage your life. Play it.
      </footer>
    </div>
  );
}
