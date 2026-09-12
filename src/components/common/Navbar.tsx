"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./Logo";
import { Sword, Compass, Sparkles, Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#07080B]/80 backdrop-blur-md transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center">
          <Logo size="md" showText={true} />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main Navigation">
          <a
            href="#loop"
            className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md px-2 py-1"
          >
            <Compass className="w-4 h-4 text-amber-500/70" />
            <span>The Loop</span>
          </a>

          <a
            href="#arenas"
            className="text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md px-2 py-1"
          >
            <Sparkles className="w-4 h-4 text-amber-500/70" />
            <span>Sacred Arenas</span>
          </a>

          <div className="h-4 w-[1px] bg-white/10 mx-1" />

          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md px-3 py-1.5"
          >
            Sign In
          </Link>

          <Link
            href="/signup"
            className="group relative inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg overflow-hidden transition-all duration-300 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <Sword className="w-3.5 h-3.5 transition-transform group-hover:rotate-12 duration-200" />
            <span>Begin Journey</span>
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            href="/signup"
            className="text-xs font-semibold px-3 py-1.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300"
          >
            Play
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md"
            aria-label="Toggle Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-white/[0.08] bg-[#0A0C12]/95 backdrop-blur-xl px-6 py-5 space-y-4"
          >
            <div className="flex flex-col space-y-3">
              <a
                href="#loop"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-300 hover:text-amber-400 py-1.5 text-base flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                The Loop
              </a>
              <a
                href="#arenas"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-300 hover:text-amber-400 py-1.5 text-base flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Sacred Arenas
              </a>
              <div className="h-[1px] bg-white/10 my-2" />
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-slate-300 hover:text-white py-1.5 text-base"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20"
              >
                ⚔️ Begin Your Journey
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
