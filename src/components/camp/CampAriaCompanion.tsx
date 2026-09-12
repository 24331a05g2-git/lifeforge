"use client";

import React from "react";
import { motion } from "framer-motion";
import { CampAriaMessage } from "@/lib/camp/types";
import { Sparkles, Flame, Moon } from "lucide-react";

interface CampAriaCompanionProps {
  message: CampAriaMessage;
}

export function CampAriaCompanion({ message }: CampAriaCompanionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-[#0C0F17]/90 to-[#0A0D15]/95 p-6 sm:p-7 backdrop-blur-xl shadow-[0_0_40px_rgba(245,158,11,0.08)]"
    >
      {/* Background warm fire aura */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-orange-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 flex items-start gap-4 sm:gap-5">
        {/* ARIA Campfire Sigil */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-orange-950/50 to-amber-950/40 flex items-center justify-center text-amber-400 shadow-inner flex-shrink-0">
          <Flame className="w-6 h-6 animate-pulse text-orange-400" />
        </div>

        {/* Text Area */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-xs uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              ARIA • CAMPFIRE COUNSEL
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
              <Moon className="w-2.5 h-2.5" />
              Nightfall
            </span>
          </div>

          <h3 className="font-cinzel text-lg sm:text-xl font-bold text-slate-100 tracking-wide">
            {message.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-3xl">
            {message.message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
