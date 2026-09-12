"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Dumbbell, Zap, Sprout, ShieldCheck, Flame, Compass, Moon } from "lucide-react";

export function LorePreview() {
  const loopSteps = [
    { name: "Discover", desc: "Uncover character traits & archetype", icon: Compass },
    { name: "Plan", desc: "Deck daily quests at the forge", icon: ShieldCheck },
    { name: "Quest", desc: "Transform real-life tasks into trials", icon: Flame },
    { name: "Play", desc: "Engage dedicated mini-game arenas", icon: Zap },
    { name: "Reward", desc: "Mint verifiable XP, gold & loot", icon: SparkleIcon },
    { name: "Night Camp", desc: "Review victories & forge tomorrow", icon: Moon },
  ];

  const arenas = [
    {
      id: "knowledge-dungeon",
      title: "Knowledge Dungeon",
      category: "Learning & Skill Acquisition",
      desc: "Conquer flashcards, reading notes, and study trials. Every correct insight deals combat strikes to dungeon beasts.",
      icon: BookOpen,
      badge: "INT / WIS",
      accent: "from-sky-500/20 to-indigo-500/5",
      border: "border-sky-500/30",
      glow: "group-hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]",
      iconColor: "text-sky-400",
    },
    {
      id: "training-arena",
      title: "Training Arena",
      category: "Fitness & Physical Energy",
      desc: "Workout intervals and rep sets translate into combat strikes against training dummies. Rest intervals replenish stamina.",
      icon: Dumbbell,
      badge: "STR / VIT",
      accent: "from-amber-500/20 to-orange-500/5",
      border: "border-amber-500/30",
      glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
      iconColor: "text-amber-400",
    },
    {
      id: "focus-mission",
      title: "Focus Mission",
      category: "Productivity & Deep Work",
      desc: "Starship cockpit deep-work sprints. Soundscapes and focus checkpoints shield you from worldly distractions.",
      icon: Zap,
      badge: "FOC / AGI",
      accent: "from-violet-500/20 to-purple-500/5",
      border: "border-violet-500/30",
      glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]",
      iconColor: "text-violet-400",
    },
    {
      id: "habit-garden",
      title: "Habit Garden",
      category: "Consistency & Daily Rituals",
      desc: "Check off daily rituals to water mystical flora. Unbroken consistency evolves seedlings into glowing legendary blooms.",
      icon: Sprout,
      badge: "DIS / CHA",
      accent: "from-emerald-500/20 to-teal-500/5",
      border: "border-emerald-500/30",
      glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
      iconColor: "text-emerald-400",
    },
  ];

  const lexicon = [
    { real: "Task", rpg: "Quest" },
    { real: "To-do List", rpg: "Quest Board" },
    { real: "Points", rpg: "XP" },
    { real: "Currency", rpg: "Gold" },
    { real: "User", rpg: "Adventurer" },
    { real: "Profile", rpg: "Character" },
    { real: "Goal", rpg: "Main Quest" },
    { real: "Daily Plan", rpg: "Adventure" },
    { real: "Evening Plan", rpg: "Night Camp" },
    { real: "Achievement", rpg: "Unlock" },
  ];

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 border-t border-white/[0.05] space-y-28">
      {/* THE 4 SACRED ARENAS */}
      <div id="arenas" className="space-y-12 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-semibold tracking-wider uppercase font-mono">
            <span>⚔️ Real-World Arenas</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-slate-100 tracking-wide">
            One Life. Four Battlegrounds.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            No generic checkboxes. Every real-life activity channels into a tailored RPG mini-game engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {arenas.map((arena, i) => {
            const Icon = arena.icon;
            return (
              <motion.div
                key={arena.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group relative p-7 rounded-2xl border ${arena.border} bg-gradient-to-b ${arena.accent} backdrop-blur-md transition-all duration-300 ${arena.glow}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] ${arena.iconColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                    {arena.badge}
                  </span>
                </div>

                <div className="mt-5 space-y-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 font-mono">
                    {arena.category}
                  </span>
                  <h3 className="font-cinzel text-xl font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                    {arena.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {arena.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* THE SACRED LOOP */}
      <div id="loop" className="space-y-12 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wider uppercase font-mono">
            <span>✦ The Heroic Cycle</span>
          </div>
          <h2 className="font-cinzel text-3xl sm:text-4xl font-bold text-slate-100 tracking-wide">
            The Core Game Loop
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            From sunrise questing to evening campfire reflection, your personal evolution never stalls.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {loopSteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative flex flex-col items-center text-center p-5 rounded-xl border border-white/[0.06] bg-[#0A0C13]/80 hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3">
                  <StepIcon className="w-5 h-5" />
                </div>
                <span className="text-xs font-mono text-slate-500 mb-1">STAGE 0{idx + 1}</span>
                <h4 className="font-cinzel text-sm font-bold text-slate-200 mb-1.5">{step.name}</h4>
                <p className="text-[11px] text-slate-400 leading-tight">{step.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* THE ADVENTURER'S LEXICON */}
      <div className="p-8 sm:p-10 rounded-3xl border border-amber-500/20 bg-gradient-to-b from-amber-500/[0.03] to-transparent backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
          <div>
            <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-amber-200">
              The Adventurer&apos;s Lexicon
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Words shape reality. In LIFEFORGE, every mundane term ascends into an RPG reality.
            </p>
          </div>
          <span className="self-start sm:self-auto text-xs font-mono px-3 py-1.5 rounded-full border border-amber-500/30 text-amber-300 bg-amber-500/10">
            PHASE 1 CODEX
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {lexicon.map((entry) => (
            <div
              key={entry.real}
              className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <div className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                {entry.real}
              </div>
              <div className="text-sm font-cinzel font-bold text-amber-300 mt-1 flex items-center gap-1.5">
                <span>⚔️</span>
                <span>{entry.rpg}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SparkleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}
