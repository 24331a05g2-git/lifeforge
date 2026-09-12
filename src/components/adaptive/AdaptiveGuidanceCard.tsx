"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AdaptiveRecommendation } from "@/lib/adaptive/types";
import {
  Compass,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Flame,
  ArrowDownRight,
  TrendingUp,
  Scale,
  Feather,
  Info,
  ArrowRight,
} from "lucide-react";

interface AdaptiveGuidanceCardProps {
  recommendation: AdaptiveRecommendation;
  onScrollToPlan?: () => void;
}

export function AdaptiveGuidanceCard({
  recommendation,
  onScrollToPlan,
}: AdaptiveGuidanceCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  const { direction, confidence, title, message, reasons, suggestedAction, signals } =
    recommendation;

  // Visual direction configuration
  const config = {
    lighter: {
      badge: "Lighter Load Suggested",
      badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
      accentBorder: "border-emerald-500/30",
      bgGlow: "bg-emerald-500/10",
      icon: Feather,
      iconColor: "text-emerald-400",
    },
    balanced: {
      badge: confidence === "low" ? "Establishing Rhythm" : "Balanced Cadence",
      badgeColor: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
      accentBorder: "border-cyan-500/30",
      bgGlow: "bg-cyan-500/10",
      icon: Scale,
      iconColor: "text-cyan-400",
    },
    harder: {
      badge: "Ready for Challenge",
      badgeColor: "text-orange-400 border-orange-500/40 bg-orange-500/10",
      accentBorder: "border-orange-500/30",
      bgGlow: "bg-orange-500/15",
      icon: TrendingUp,
      iconColor: "text-orange-400",
    },
  }[direction];

  const IconComponent = config.icon;

  const handleAdjustClick = () => {
    if (onScrollToPlan) {
      onScrollToPlan();
    } else {
      const el = document.getElementById("tomorrow-plan-heading");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section aria-label="Adaptive Difficulty Guidance" className="space-y-3">
      <div
        className={`relative overflow-hidden rounded-3xl border ${config.accentBorder} bg-[#0A0D15]/90 p-6 sm:p-7 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.4)] transition-all`}
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className={`pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full ${config.bgGlow} blur-3xl`}
        />

        <div className="relative z-10 space-y-5">
          {/* Top Row: Sigil & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border ${config.accentBorder} bg-white/[0.03] flex items-center justify-center ${config.iconColor} shadow-inner flex-shrink-0`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Adaptive Guidance • ARIA&apos;s Read</span>
                </div>
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-slate-100">
                  {title}
                </h3>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border self-start sm:self-center ${config.badgeColor}`}
            >
              {config.badge}
            </span>
          </div>

          {/* Core Guidance Text */}
          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-3xl">
            {message}
          </p>

          {/* Real Metrics Strip */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 p-3 sm:p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center font-mono">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                7-Day Completion
              </span>
              <span className="text-sm sm:text-base font-bold text-slate-100">
                {signals.totalQuests > 0
                  ? `${Math.round(signals.completionRate * 100)}%`
                  : "N/A"}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Daily Cadence
              </span>
              <span className="text-sm sm:text-base font-bold text-cyan-300">
                {signals.avgQuestsPerDay} <span className="text-xs font-normal">q/day</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Active Streak
              </span>
              <span className="text-sm sm:text-base font-bold text-orange-400">
                {signals.currentStreak}d
              </span>
            </div>
          </div>

          {/* Action Row & Expandable Trigger */}
          <div className="pt-1 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06]">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-400/90 hover:text-amber-300 hover:underline cursor-pointer"
              aria-expanded={showExplanation}
              aria-controls="adaptive-why-section"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Why am I seeing this?</span>
              {showExplanation ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={handleAdjustClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              <span>Adjust Tomorrow&apos;s Plan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Expandable "Why am I seeing this?" Section */}
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                id="adaptive-why-section"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pt-3 space-y-3 font-sans text-xs border-t border-white/[0.04]"
              >
                <div className="space-y-1">
                  <p className="text-slate-300 font-medium">
                    This guidance is generated from your verified 7-day activity:
                  </p>
                  <ul className="space-y-1 text-slate-400 list-disc list-inside">
                    {reasons.map((reason, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] space-y-1">
                  <span className="font-mono text-[11px] text-amber-400 uppercase tracking-wider block font-bold">
                    Suggested Adjustment:
                  </span>
                  <p className="text-slate-300">{suggestedAction}</p>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Adaptive Difficulty is strictly advisory to help you sustain your rhythm. You remain in complete control of your quest board.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
