"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { revalidatePath } from "next/cache";
import {
  AchievementKey,
  AchievementProgressItem,
  PlayerProgressionSignals,
  UserAchievement,
} from "@/lib/achievements/types";
import {
  evaluateAchievementProgress,
  getEligibleUnlocks,
} from "@/lib/achievements/engine";

export interface AchievementsActionResult {
  success: boolean;
  achievements: AchievementProgressItem[];
  unlockedCount: number;
  totalCount: number;
  newlyUnlocked?: AchievementKey[];
  error?: string;
}

/**
 * Evaluates authenticated user's real database signals and returns their full achievements dossier.
 * If newly eligible achievements are discovered, they are atomically granted.
 */
export async function getUserAchievementsAction(): Promise<AchievementsActionResult> {
  if (!getSupabaseEnv().isConfigured) {
    return { success: false, achievements: [], unlockedCount: 0, totalCount: 8, error: "Database unconfigured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, achievements: [], unlockedCount: 0, totalCount: 8, error: "Authentication required." };
  }

  // 1. Fetch Player Profile (streak, level)
  const { data: profile } = await supabase
    .from("profiles")
    .select("level, current_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  const level = profile?.level || 1;
  const currentStreak = profile?.current_streak || 0;

  // 2. Fetch Completed Quests & Categories
  const { data: completedQuests = [] } = await supabase
    .from("quests")
    .select("category")
    .eq("user_id", user.id)
    .eq("status", "completed");

  const completedQuestsCount = (completedQuests || []).length;
  const uniqueCategories = new Set((completedQuests || []).map((q) => q.category));
  const uniqueCategoriesCount = uniqueCategories.size;

  // 3. Fetch Nightly Plans Completed
  let completedNightlyPlansCount = 0;
  try {
    const { data: nightlyPlans = [] } = await supabase
      .from("nightly_plans")
      .select("id")
      .eq("user_id", user.id);
    completedNightlyPlansCount = (nightlyPlans || []).length;
  } catch {
    // Graceful fallback if table is empty
  }

  // 4. Fetch Defeated Boss Battles
  let defeatedBossesCount = 0;
  try {
    const { data: defeatedBosses = [] } = await supabase
      .from("boss_battles")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "defeated");
    defeatedBossesCount = (defeatedBosses || []).length;
  } catch {
    // Graceful fallback
  }

  // Compile Verified Database Signals
  const signals: PlayerProgressionSignals = {
    completedQuestsCount,
    currentStreak,
    level,
    uniqueCategoriesCount,
    completedNightlyPlansCount,
    defeatedBossesCount,
  };

  // 5. Fetch Existing Unlocks
  const { data: existingUnlocks = [] } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", user.id);

  const existingRecords: UserAchievement[] = (existingUnlocks || []).map((u) => ({
    id: u.id,
    user_id: u.user_id,
    achievement_key: u.achievement_key as AchievementKey,
    unlocked_at: u.unlocked_at,
    metadata: u.metadata,
  }));

  const alreadyUnlockedKeys = new Set(existingRecords.map((r) => r.achievement_key));

  // 6. Check for Newly Eligible Unlocks
  const newlyEligible = getEligibleUnlocks(signals, alreadyUnlockedKeys);

  if (newlyEligible.length > 0) {
    const rowsToInsert = newlyEligible.map((key) => ({
      user_id: user.id,
      achievement_key: key,
      unlocked_at: new Date().toISOString(),
    }));

    // Server-authoritative idempotent insertion
    await supabase.from("user_achievements").upsert(rowsToInsert, {
      onConflict: "user_id,achievement_key",
      ignoreDuplicates: true,
    });

    for (const key of newlyEligible) {
      existingRecords.push({
        id: "new",
        user_id: user.id,
        achievement_key: key,
        unlocked_at: new Date().toISOString(),
      });
    }

    revalidatePath("/character");
    revalidatePath("/dashboard");
  }

  // 7. Format Complete Progress
  const formattedAchievements = evaluateAchievementProgress(signals, existingRecords);
  const unlockedCount = formattedAchievements.filter((a) => a.isUnlocked).length;

  return {
    success: true,
    achievements: formattedAchievements,
    unlockedCount,
    totalCount: formattedAchievements.length,
    newlyUnlocked: newlyEligible.length > 0 ? newlyEligible : undefined,
  };
}
