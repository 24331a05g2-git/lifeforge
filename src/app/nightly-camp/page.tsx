import React from "react";
import { redirect } from "next/navigation";
import { getNightlyCampDataAction } from "@/actions/nightly-camp";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { AppNavbar } from "@/components/navigation/AppNavbar";
import { NightlyCampView } from "@/components/camp/NightlyCampView";

export const metadata = {
  title: "Nightly Camp | LIFEFORGE",
  description: "End-of-day review and tomorrow's quest planning camp.",
};

export default async function NightlyCampPage() {
  const result = await getNightlyCampDataAction();

  if (!result.success || !result.data) {
    redirect("/login?redirectedFrom=/nightly-camp");
  }

  const data = result.data;
  const { profile } = data;

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white pb-16 md:pb-0">
      <ParticleBackground />

      {/* Unified RPG Navbar */}
      <AppNavbar
        activeTab="camp"
        characterName={profile.character_name}
        level={profile.level}
        gold={profile.gold}
        streak={profile.current_streak}
      />

      {/* Main Camp Content */}
      <main className="relative z-20 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <NightlyCampView initialData={data} />
      </main>

      {/* Campfire Cinematic Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500 font-cinzel tracking-widest uppercase border-t border-white/[0.04]">
        Tomorrow&apos;s adventure starts tonight. Rest well, Adventurer.
      </footer>
    </div>
  );
}
