import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getQuestsAction } from "@/actions/quests";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { AppNavbar } from "@/components/navigation/AppNavbar";
import { QuestBoard } from "@/components/quests/QuestBoard";

export default async function QuestsPage() {
  const supabase = await createClient();

  // 1. Verify authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/quests");
  }

  // 2. Check if user completed character discovery
  const { data: profile } = await supabase
    .from("profiles")
    .select("character_name, archetype, level, gold, current_streak, assessment_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !profile.assessment_completed) {
    redirect("/character-discovery");
  }

  // 3. Fetch initial quests
  const { data: initialQuests = [] } = await getQuestsAction();

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white pb-16 md:pb-0">
      <ParticleBackground />

      {/* Unified RPG Navbar */}
      <AppNavbar
        activeTab="quests"
        characterName={profile.character_name}
        level={profile.level}
        gold={profile.gold || 0}
        streak={profile.current_streak || 0}
      />

      {/* Main Quests Board Content */}
      <main className="relative z-20 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <QuestBoard initialQuests={initialQuests || []} userEmail={user.email} />
      </main>

      {/* Cinematic Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500 font-cinzel tracking-widest uppercase border-t border-white/[0.04]">
        Don&apos;t just manage your life. Play it.
      </footer>
    </div>
  );
}
