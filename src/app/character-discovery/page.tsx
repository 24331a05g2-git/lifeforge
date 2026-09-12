import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/actions/auth";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { Logo } from "@/components/common/Logo";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";
import { LogOut, User } from "lucide-react";

export default async function CharacterDiscoveryPage() {
  const supabase = await createClient();

  // 1. Server-side authentication verification
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/character-discovery");
  }

  // 2. Check if user already forged their character in the database
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("assessment_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingProfile?.assessment_completed) {
    // Character already exists — redirect to dashboard
    redirect("/dashboard");
  }

  const characterName =
    user.user_metadata?.character_name ||
    user.email?.split("@")[0] ||
    "Adventurer";

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white">
      <ParticleBackground />

      {/* Top Authenticated Header */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between border-b border-white/[0.06]">
        <Logo size="sm" showText={true} />

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-slate-300 font-mono">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.email}</span>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-red-500/30 hover:border-red-500/60 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </header>

      {/* Assessment Interactive Ritual */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 sm:px-6 py-10">
        <AssessmentFlow initialCharacterName={characterName} />
      </main>

      {/* Cinematic Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500 font-cinzel tracking-widest uppercase">
        Don&apos;t just manage your life. Play it.
      </footer>
    </div>
  );
}
