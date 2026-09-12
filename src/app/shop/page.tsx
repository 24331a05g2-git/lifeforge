import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getShopCatalogAction } from "@/actions/economy";
import { AppNavbar } from "@/components/navigation/AppNavbar";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { ShopView } from "@/components/shop/ShopView";

export const metadata = {
  title: "Citadel Emporium | LIFEFORGE",
  description: "Spend hard-earned quest gold on prestige cosmetics and realm badges.",
};

export default async function ShopPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/shop");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile || !profile.assessment_completed) {
    redirect("/character-discovery");
  }

  const shopRes = await getShopCatalogAction();
  const catalog = shopRes.success ? shopRes.catalog : [];
  const playerGold = profile.gold || 0;

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#07080B] text-slate-100 selection:bg-amber-500/30 selection:text-white pb-16 md:pb-0">
      <ParticleBackground />

      {/* Unified RPG Navbar */}
      <AppNavbar
        activeTab="shop"
        characterName={profile.character_name}
        level={profile.level}
        gold={playerGold}
        streak={profile.current_streak || 0}
      />

      {/* Main Shop View */}
      <main className="relative z-20 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        <ShopView initialCatalog={catalog} initialGold={playerGold} />
      </main>

      {/* Cinematic Footer */}
      <footer className="relative z-20 py-6 text-center text-xs text-slate-500 font-cinzel tracking-widest uppercase border-t border-white/[0.04]">
        Don&apos;t just manage your life. Play it.
      </footer>
    </div>
  );
}
