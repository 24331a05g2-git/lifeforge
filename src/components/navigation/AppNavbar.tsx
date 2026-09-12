"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/common/Logo";
import { signOutAction } from "@/actions/auth";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import {
  Compass,
  Sword,
  Shield,
  Coins,
  Flame,
  LogOut,
  Sparkles,
  Moon,
  ShoppingBag,
} from "lucide-react";

interface AppNavbarProps {
  characterName: string;
  level: number;
  gold: number;
  streak: number;
  activeTab?: "world" | "quests" | "character" | "camp" | "shop";
}

export function AppNavbar({
  characterName,
  level,
  gold,
  streak,
  activeTab,
}: AppNavbarProps) {
  const pathname = usePathname();

  const currentTab =
    activeTab ||
    (pathname.startsWith("/quests")
      ? "quests"
      : pathname.startsWith("/shop")
      ? "shop"
      : pathname.startsWith("/character")
      ? "character"
      : pathname.startsWith("/nightly-camp")
      ? "camp"
      : "world");

  const navLinks = [
    {
      id: "world",
      href: "/dashboard",
      label: "World",
      icon: Compass,
      match: currentTab === "world",
    },
    {
      id: "quests",
      href: "/quests",
      label: "Quests",
      icon: Sword,
      match: currentTab === "quests",
    },
    {
      id: "shop",
      href: "/shop",
      label: "Shop",
      icon: ShoppingBag,
      match: currentTab === "shop",
    },
    {
      id: "camp",
      href: "/nightly-camp",
      label: "Camp",
      icon: Moon,
      match: currentTab === "camp",
    },
    {
      id: "character",
      href: "/character",
      label: "Character",
      icon: Shield,
      match: currentTab === "character",
    },
  ];

  return (
    <>
      {/* Top Main Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#07080B]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Left: Logo & Phase Badge */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Logo size="sm" showText={true} />
            <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-[11px] font-mono text-amber-300">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>PHASE 11: REWARDS & BOSSES</span>
            </div>
          </div>

          {/* Center: Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            {navLinks.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                    tab.match
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${tab.match ? "text-amber-400" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Player Stats & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Live Stats Pill Strip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs font-mono">
              {/* Streak */}
              <div className="flex items-center gap-1 text-orange-400" title={`Current streak: ${streak} days`}>
                <Flame className="w-3.5 h-3.5" />
                <span className="font-bold">{streak}d</span>
              </div>

              <span className="text-slate-600">•</span>

              {/* Gold */}
              <div className="flex items-center gap-1 text-amber-400" title={`Treasury: ${gold} Gold`}>
                <Coins className="w-3.5 h-3.5" />
                <span className="font-bold">{gold}G</span>
              </div>

              <span className="text-slate-600 hidden sm:inline">•</span>

              {/* Level */}
              <div className="hidden sm:flex items-center gap-1 text-slate-300 font-bold" title={`Level ${level}`}>
                <span className="text-amber-300">Lvl {level}</span>
              </div>
            </div>

            {/* In-App Notification Center */}
            <NotificationCenter />

            {/* Sign Out Button */}
            <form action={signOutAction}>
              <button
                type="submit"
                className="p-2 rounded-lg border border-red-500/30 hover:border-red-500/60 bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer"
                title="Sign out of realm"
                aria-label="Sign out of realm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar for Comfortable Thumb Reach */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.08] bg-[#07080B]/95 backdrop-blur-xl px-4 py-2 flex items-center justify-around">
        {navLinks.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-[11px] font-mono transition-all ${
                tab.match
                  ? "text-amber-300 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  tab.match ? "bg-amber-500/20 border border-amber-500/40" : ""
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.match ? "text-amber-400" : "text-slate-400"}`} />
              </div>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
