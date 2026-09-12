"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#050608] py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center text-center space-y-8">
        <Logo size="md" showText={true} />

        {/* Central Core Philosophy */}
        <div className="space-y-2">
          <p className="font-cinzel text-base sm:text-lg tracking-[0.25em] text-amber-200/90 font-bold uppercase">
            &ldquo;Don&apos;t just manage your life. Play it.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Forge the life you want to live. Your journey starts at Level 1.
          </p>
        </div>

        {/* Links & Sub-nav */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            Home
          </Link>
          <span className="text-white/10">•</span>
          <Link href="/signup" className="hover:text-amber-400 transition-colors">
            Begin Journey
          </Link>
          <span className="text-white/10">•</span>
          <Link href="/login" className="hover:text-amber-400 transition-colors">
            Sign In
          </Link>
          <span className="text-white/10">•</span>
          <a href="#arenas" className="hover:text-amber-400 transition-colors">
            Arenas
          </a>
          <span className="text-white/10">•</span>
          <a href="#loop" className="hover:text-amber-400 transition-colors">
            The Loop
          </a>
        </div>

        {/* Phase 1 Badge & Copyright */}
        <div className="pt-6 border-t border-white/[0.04] w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div>© {new Date().getFullYear()} LIFEFORGE. All quests reserved.</div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-amber-500/20 bg-amber-500/[0.05] text-amber-300 text-[11px]">
            <span>PHASE 1: LANDING & AUTH ENTRY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
