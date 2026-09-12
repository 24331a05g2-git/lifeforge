"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AssessmentResult, AttributeType } from "@/lib/assessment/types";
import { ATTRIBUTE_META } from "@/lib/assessment/scoring";
import { saveCharacterProfileAction } from "@/actions/character";
import { Sword, Sparkles, AlertCircle, ArrowRight, Shield, CheckCircle2 } from "lucide-react";

interface CharacterRevealProps {
  result: AssessmentResult;
}

export function CharacterReveal({ result }: CharacterRevealProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Auto-save the character profile to Supabase on reveal mount
  useEffect(() => {
    let mounted = true;

    async function persistProfile() {
      setIsSaving(true);
      setSaveError(null);

      try {
        const res = await saveCharacterProfileAction({
          characterName: result.characterName,
          archetype: result.archetype.title,
          attributes: result.attributes,
          selectedGoals: result.selectedGoals,
        });

        if (mounted) {
          if (!res.success && res.error) {
            setSaveError(res.error);
          } else {
            setIsSaved(true);
          }
          setIsSaving(false);
        }
      } catch (err: unknown) {
        if (mounted) {
          console.error("Profile save exception:", err);
          setSaveError("The forge encountered an issue saving your character. You can retry below.");
          setIsSaving(false);
        }
      }
    }

    persistProfile();

    return () => {
      mounted = false;
    };
  }, [result]);

  const handleRetrySave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const res = await saveCharacterProfileAction({
      characterName: result.characterName,
      archetype: result.archetype.title,
      attributes: result.attributes,
      selectedGoals: result.selectedGoals,
    });

    if (!res.success && res.error) {
      setSaveError(res.error);
    } else {
      setIsSaved(true);
    }
    setIsSaving(false);
  };

  const handleEnterWorld = () => {
    router.push("/dashboard");
  };

  const attributeList: AttributeType[] = ["strength", "intellect", "focus", "discipline", "energy"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="relative rounded-3xl border border-amber-500/40 bg-[#0A0D15]/95 p-6 sm:p-12 backdrop-blur-2xl shadow-[0_0_80px_rgba(245,158,11,0.2)]">
        {/* Glowing Top Crucible Filament */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_25px_rgba(245,158,11,1)]" />

        {/* Reveal Badge */}
        <div className="text-center space-y-3 mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>CHARACTER REVEAL</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="font-cinzel text-3xl sm:text-5xl font-extrabold text-gold-gradient tracking-wide"
          >
            Your Character Has Been Discovered
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg text-slate-300 font-cinzel"
          >
            Adventurer: <strong className="text-amber-200">{result.characterName}</strong>
          </motion.p>
        </div>

        {/* Archetype Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          className={`p-6 sm:p-8 rounded-2xl border ${result.archetype.borderAccent} bg-gradient-to-b ${result.archetype.color} backdrop-blur-md mb-10 relative overflow-hidden`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-4xl shadow-inner shrink-0">
              {result.archetype.icon}
            </div>

            <div className="space-y-2 flex-1">
              <div className="text-xs font-mono tracking-widest uppercase text-slate-400 font-semibold">
                STARTING ARCHETYPE
              </div>
              <h2 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-slate-100">
                {result.archetype.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {result.archetype.subtitle}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed pt-1">
                {result.archetype.description}
              </p>
              <p className="text-xs text-amber-300/90 italic pt-2 font-cinzel">
                &ldquo;{result.archetype.quote}&rdquo;
              </p>
            </div>
          </div>
        </motion.div>

        {/* Attributes Matrix Section */}
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-cinzel text-lg sm:text-xl font-bold text-slate-200 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Starting Attributes Matrix</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">Scale: 1 — 100</span>
          </div>

          <div className="space-y-4">
            {attributeList.map((stat, idx) => {
              const meta = ATTRIBUTE_META[stat];
              const score = result.attributes[stat];

              return (
                <motion.div
                  key={stat}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1, duration: 0.5 }}
                  className="space-y-1.5 p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2.5 font-medium text-slate-200">
                      <span className="text-base">{meta.icon}</span>
                      <span className="font-cinzel font-bold tracking-wide">{meta.label}</span>
                    </div>
                    <span className="font-mono font-bold text-amber-300 text-sm sm:text-base">
                      {score} <span className="text-[10px] text-slate-500 font-normal">/ 100</span>
                    </span>
                  </div>

                  {/* Attribute Bar */}
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ delay: 0.85 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-500 leading-tight">
                    {meta.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Growth Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* Top Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] space-y-3"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <span>✦</span>
              <span>Your Core Strengths</span>
            </div>
            <div className="space-y-2">
              {result.strengths.map((s) => (
                <div
                  key={s.type}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                >
                  <span className="text-sm font-cinzel font-bold text-slate-100 flex items-center gap-2">
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </span>
                  <span className="font-mono text-xs text-emerald-400 font-semibold">
                    {s.value} Rating
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Natural anchors you can leverage immediately on your daily adventures.
            </p>
          </motion.div>

          {/* Growth Opportunities */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] space-y-3"
          >
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <span>✦</span>
              <span>Next Opportunities for Growth</span>
            </div>
            <div className="space-y-2">
              {result.growthAreas.map((g) => (
                <div
                  key={g.type}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                >
                  <span className="text-sm font-cinzel font-bold text-slate-100 flex items-center gap-2">
                    <span>{g.icon}</span>
                    <span>{g.label}</span>
                  </span>
                  <span className="font-mono text-xs text-amber-300 font-semibold">
                    Room to Grow
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Prime focus areas where daily quests will trigger your fastest character breakthroughs.
            </p>
          </motion.div>
        </div>

        {/* Selected Goals Preview */}
        {result.selectedGoals && result.selectedGoals.length > 0 && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] mb-10 space-y-2 text-left">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              COMMITTED FOCUS QUESTS:
            </div>
            <div className="flex flex-wrap gap-2">
              {result.selectedGoals.map((g, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 font-mono"
                >
                  ✦ {g.split(":")[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Inspiring Product Motto */}
        <div className="text-center space-y-2 mb-8 border-t border-white/[0.08] pt-8">
          <p className="font-cinzel text-lg sm:text-xl font-bold text-amber-200">
            &ldquo;This is where you begin. Not where you have to stay.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-slate-400">
            Every day is another level. Real-world quests will forge your attributes.
          </p>
        </div>

        {/* Persistence Feedback & Errors */}
        {saveError && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold font-cinzel text-red-200">
                The Forge lost connection. Your progress could not be saved.
              </p>
              <p className="text-red-300/90 leading-relaxed">{saveError}</p>
              <button
                type="button"
                onClick={handleRetrySave}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 text-xs font-medium cursor-pointer"
              >
                {isSaving ? "Retrying..." : "Try Again"}
              </button>
            </div>
          </div>
        )}

        {isSaved && !saveError && (
          <div className="mb-6 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Character Sealed & Persisted in the Realm Archive</span>
          </div>
        )}

        {/* Primary CTA */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleEnterWorld}
            disabled={isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 text-base sm:text-lg font-bold rounded-xl overflow-hidden text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.5)] hover:shadow-[0_0_50px_rgba(245,158,11,0.7)] transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer"
          >
            <Sword className="w-5 h-5 text-slate-950" />
            <span className="font-cinzel tracking-wider">Enter My World</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
