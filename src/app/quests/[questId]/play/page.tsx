import React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { startGameSessionAction } from "@/actions/games";
import { GameLauncher } from "@/components/games/GameLauncher";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { Logo } from "@/components/common/Logo";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export const metadata = {
  title: "Play Quest | LIFEFORGE",
  description: "Execute your real-world quest inside the LIFEFORGE mini-game arena.",
};

interface PlayQuestPageProps {
  params: Promise<{
    questId: string;
  }>;
}

export default async function PlayQuestPage({ params }: PlayQuestPageProps) {
  const { questId } = await params;
  const supabase = await createClient();

  // 1. Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectedFrom=/quests/${questId}/play`);
  }

  // 2. Check profile & assessment completion
  const { data: profile } = await supabase
    .from("profiles")
    .select("character_name, archetype, assessment_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !profile.assessment_completed) {
    redirect("/character-discovery");
  }

  // 3. Start or resume game session (Server Authoritative)
  const result = await startGameSessionAction(questId);

  if (!result.success || !result.data) {
    return (
      <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white">
        <ParticleBackground />

        <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#07080B]/85 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
            <Logo size="sm" showText={true} />
            <Link
              href="/quests"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-400/40 bg-white/[0.03] text-xs font-mono text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Quest Board</span>
            </Link>
          </div>
        </header>

        <main className="relative z-20 flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full rounded-2xl border border-red-500/30 bg-[#0D111A]/90 p-6 sm:p-8 backdrop-blur-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="font-cinzel text-xl font-bold text-slate-100">
              Arena Access Denied
            </h2>
            <p className="text-sm text-slate-400 font-mono">
              {result.error || "Unable to launch this quest mini-game session."}
            </p>
            <div className="pt-2">
              <Link
                href="/quests"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-bold text-sm shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Quest Board</span>
              </Link>
            </div>
          </div>
        </main>

        <footer className="relative z-20 py-6 text-center text-xs text-slate-500 font-cinzel tracking-widest uppercase border-t border-white/[0.04]">
          Don&apos;t just manage your life. Play it.
        </footer>
      </div>
    );
  }

  const { quest, session } = result.data;

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white">
      <ParticleBackground />

      <main className="relative z-20 flex-1 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8">
        <GameLauncher quest={quest} initialSession={session} />
      </main>

      <footer className="relative z-20 py-4 text-center text-[11px] text-slate-500 font-cinzel tracking-widest uppercase border-t border-white/[0.04]">
        LIFEFORGE • Forge the life you want to live.
      </footer>
    </div>
  );
}
