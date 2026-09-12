"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Compass, Sparkles, User, ArrowRight } from "lucide-react";

interface AssessmentIntroProps {
  initialCharacterName: string;
  onBegin: (characterName: string) => void;
}

export function AssessmentIntro({
  initialCharacterName,
  onBegin,
}: AssessmentIntroProps) {
  const [characterName, setCharacterName] = useState(initialCharacterName || "Adventurer");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterName.trim()) return;
    onBegin(characterName.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto text-center"
    >
      <div className="relative rounded-3xl border border-amber-500/30 bg-[#0A0D15]/90 p-8 sm:p-12 backdrop-blur-xl shadow-[0_0_60px_rgba(245,158,11,0.15)]">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_rgba(245,158,11,0.8)]" />

        {/* Ritual Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono font-semibold tracking-wider uppercase mb-6">
          <Compass className="w-4 h-4 text-amber-400 animate-spin [animation-duration:14s]" />
          <span>STAGE 01 // THE DISCOVERY RITUAL</span>
        </div>

        {/* Headings */}
        <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-gold-gradient tracking-wide mb-4">
          Welcome, Adventurer.
        </h1>

        <p className="text-lg sm:text-2xl font-medium text-amber-200/90 font-cinzel mb-4">
          &ldquo;Before your journey begins, let&apos;s discover your character.&rdquo;
        </p>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto mb-3">
          Answer honestly across 10 life domains. There are no wrong answers — only your starting point.
        </p>

        <p className="text-xs sm:text-sm text-amber-400/90 font-cinzel tracking-wider uppercase mb-8">
          &ldquo;This is where you begin. Not where you have to stay.&rdquo;
        </p>

        {/* Character Tag Confirmation Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6 text-left">
          <div className="space-y-2">
            <label
              htmlFor="characterTagInput"
              className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300"
            >
              Confirm Adventurer Tag
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <User className="w-4 h-4" />
              </div>
              <input
                id="characterTagInput"
                type="text"
                required
                minLength={2}
                maxLength={40}
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm font-medium transition-all"
                placeholder="Enter character name"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold rounded-xl overflow-hidden text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_45px_rgba(245,158,11,0.6)] transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span className="font-cinzel tracking-wider">Begin Character Discovery</span>
            <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <p className="text-[11px] text-slate-500 font-mono mt-8">
          10 Questions • ~2 Minutes • Calculates Strength, Intellect, Focus, Discipline & Energy
        </p>
      </div>
    </motion.div>
  );
}
