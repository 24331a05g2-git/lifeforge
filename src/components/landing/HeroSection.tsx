"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/common/Logo";
import { Sword, ArrowRight } from "lucide-react";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.82, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="relative min-h-[calc(100vh-4.5rem)] flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24 text-center select-none">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto flex flex-col items-center"
      >
        {/* RPG-INSPIRED LOGO */}
        <motion.div variants={logoVariants} className="mb-4 relative">
          <div className="absolute -inset-6 bg-amber-500/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
          <Logo size="xl" showText={false} isLink={false} />
        </motion.div>

        {/* APP NAME */}
        <motion.div variants={itemVariants} className="space-y-1">
          <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-[0.22em] text-gold-gradient drop-shadow-[0_4px_24px_rgba(245,158,11,0.35)]">
            LIFEFORGE
          </h1>
        </motion.div>

        {/* PRIMARY TAGLINE */}
        <motion.div variants={itemVariants} className="mt-4 sm:mt-5">
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-amber-200/90 tracking-wide font-cinzel">
            &ldquo;Forge the life you want to live.&rdquo;
          </p>
        </motion.div>

        {/* SECONDARY BRAND MESSAGE */}
        <motion.div
          variants={itemVariants}
          className="mt-8 sm:mt-10 py-4 px-6 sm:px-8 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-sm max-w-xl"
        >
          <div className="space-y-2 text-slate-300 text-base sm:text-lg font-normal leading-relaxed">
            <p className="flex items-center justify-center gap-2">
              <span className="text-amber-400/80 font-mono text-sm">✦</span>
              <span>Your goals are quests.</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-amber-400/80 font-mono text-sm">✦</span>
              <span>Your habits build your character.</span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="text-amber-400/80 font-mono text-sm">✦</span>
              <span className="font-medium text-amber-200">Every day is another level.</span>
            </p>
          </div>
        </motion.div>

        {/* CALL TO ACTIONS */}
        <motion.div
          variants={itemVariants}
          className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto"
        >
          {/* Primary CTA */}
          <Link
            href="/signup"
            className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-bold rounded-xl overflow-hidden text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.45)] hover:shadow-[0_0_45px_rgba(245,158,11,0.7)] transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400"
          >
            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            <Sword className="w-5 h-5 text-slate-950 transition-transform group-hover:rotate-12 duration-200" />
            <span className="font-cinzel tracking-wider">Begin Your Journey</span>
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/login"
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-7 py-4 text-base font-medium rounded-xl text-slate-300 hover:text-white border border-white/10 hover:border-amber-400/40 bg-white/[0.02] hover:bg-amber-500/[0.06] transition-all duration-300 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span>Already playing? Sign In</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>

        {/* PHILOSOPHICAL MOTTO */}
        <motion.div
          variants={itemVariants}
          className="mt-16 sm:mt-20 pt-8 border-t border-white/[0.05] w-full flex flex-col items-center justify-center"
        >
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/[0.03]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span className="font-cinzel text-xs sm:text-sm font-semibold tracking-[0.28em] text-amber-300/80 uppercase">
              Don&apos;t just manage your life. Play it.
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
