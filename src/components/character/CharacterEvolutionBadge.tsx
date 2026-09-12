"use client";

import React from "react";
import { getCharacterEvolution } from "@/lib/rpg/evolution";
import { Sparkles, Shield, Crown } from "lucide-react";

interface CharacterEvolutionBadgeProps {
  level: number;
  archetype: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CharacterEvolutionBadge({
  level,
  archetype,
  className = "",
  size = "md",
}: CharacterEvolutionBadgeProps) {
  const evolution = getCharacterEvolution(level, archetype);

  const sizeStyles = {
    sm: {
      container: "w-14 h-14",
      iconSize: "w-6 h-6",
      badgeText: "text-[10px]",
    },
    md: {
      container: "w-20 h-20",
      iconSize: "w-9 h-9",
      badgeText: "text-xs",
    },
    lg: {
      container: "w-24 h-24",
      iconSize: "w-11 h-11",
      badgeText: "text-sm",
    },
  }[size];

  return (
    <div className={`flex flex-col items-center text-center space-y-2.5 ${className}`}>
      {/* Animated Glowing Crest Sigil */}
      <div
        className={`relative ${sizeStyles.container} rounded-3xl bg-gradient-to-b ${evolution.auraGradient} border-2 ${evolution.crestColor} flex items-center justify-center transition-transform hover:scale-105 duration-300 backdrop-blur-md`}
      >
        {/* Tier Specific Sigil Insignia */}
        {evolution.tierNumber === 1 && (
          <div className="text-amber-400">
            <Shield className={sizeStyles.iconSize} />
          </div>
        )}
        {evolution.tierNumber === 2 && (
          <div className="text-sky-400">
            <Sparkles className={sizeStyles.iconSize} />
          </div>
        )}
        {evolution.tierNumber === 3 && (
          <div className="text-purple-400">
            <Crown className={sizeStyles.iconSize} />
          </div>
        )}
        {evolution.tierNumber === 4 && (
          <div className="text-amber-300 animate-pulse">
            <Crown className={`${sizeStyles.iconSize} drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]`} />
          </div>
        )}

        {/* Level Overlay Pill */}
        <div className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-[#0A0D15] border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 shadow-md">
          LVL {level}
        </div>
      </div>

      {/* Evolution Rank Title */}
      <div className="space-y-0.5">
        <div className="font-cinzel font-bold text-slate-100 text-sm sm:text-base">
          {evolution.title}
        </div>
        <div className="text-[11px] font-mono text-amber-400/90 tracking-wider uppercase">
          Tier {evolution.tierNumber} • {evolution.name}
        </div>
      </div>
    </div>
  );
}
