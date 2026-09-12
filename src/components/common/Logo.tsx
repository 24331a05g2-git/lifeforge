"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
  isLink?: boolean;
}

export function Logo({
  size = "md",
  showText = true,
  className,
  isLink = true,
}: LogoProps) {
  const iconDimensions = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  }[size];

  const textStyles = {
    sm: "text-lg tracking-[0.18em]",
    md: "text-xl tracking-[0.22em]",
    lg: "text-3xl tracking-[0.25em]",
    xl: "text-5xl tracking-[0.28em]",
  }[size];

  const content = (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      <div className={cn("relative flex items-center justify-center", iconDimensions)}>
        {/* Ambient Glow Aura */}
        <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md group-hover:bg-amber-500/35 transition-all duration-500" />

        {/* Forge / Sword / Star Emblem SVG */}
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="bladeGrad" x1="50" y1="10" x2="50" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#FDE68A" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            <linearGradient id="forgeBase" x1="20" y1="80" x2="80" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="flameWing" x1="25" y1="40" x2="75" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#F97316" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#DC2626" stopOpacity="0.2" />
            </linearGradient>

            <filter id="forgeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Anvil / Crucible Base */}
          <path
            d="M 28 84 L 72 84 L 66 94 L 34 94 Z"
            fill="url(#forgeBase)"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeOpacity="0.7"
          />

          {/* Outer Flame Wings of the Forge */}
          <path
            d="M 24 68 C 18 52 24 38 32 30 C 30 42 38 48 42 54 C 36 60 30 68 28 78 Z"
            fill="url(#flameWing)"
            filter="url(#forgeGlow)"
          />
          <path
            d="M 76 68 C 82 52 76 38 68 30 C 70 42 62 48 58 54 C 64 60 70 68 72 78 Z"
            fill="url(#flameWing)"
            filter="url(#forgeGlow)"
          />

          {/* Central Forged Sword / Upward Blade */}
          <path
            d="M 50 14 L 56 68 L 50 72 L 44 68 Z"
            fill="url(#bladeGrad)"
          />

          {/* Sword Fuller / Spine line */}
          <line
            x1="50"
            y1="18"
            x2="50"
            y2="66"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeOpacity="0.8"
          />

          {/* Crossguard Anvil Accent */}
          <path
            d="M 38 70 L 62 70 L 60 74 L 40 74 Z"
            fill="#FBBF24"
            stroke="#D97706"
            strokeWidth="1"
          />

          {/* Level 1 / Apex Ascension Spark (Four-Point Star) */}
          <path
            d="M 50 6 L 52.5 12 L 58.5 14.5 L 52.5 17 L 50 23 L 47.5 17 L 41.5 14.5 L 47.5 12 Z"
            fill="#FFFFFF"
            filter="url(#forgeGlow)"
          />
        </svg>
      </div>

      {showText && (
        <span
          className={cn(
            "font-cinzel font-bold text-gold-gradient transition-all duration-300",
            textStyles
          )}
        >
          LIFEFORGE
        </span>
      )}
    </div>
  );

  if (isLink) {
    return (
      <Link href="/" className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md">
        {content}
      </Link>
    );
  }

  return content;
}
