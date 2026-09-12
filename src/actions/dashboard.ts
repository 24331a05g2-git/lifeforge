"use server";

import { createClient } from "@/lib/supabase/server";
import { Quest } from "@/lib/quests/types";
import { RewardEvent } from "@/lib/rpg/types";
import { ProfileRecord } from "@/lib/assessment/types";
import { getCalendarDateInTimezone } from "@/lib/rpg/streak";
import { getActiveBossAction } from "@/actions/bosses";
import { BossBattleSummary } from "@/lib/bosses/types";

export interface DailyAdventureStats {
  totalQuestsToday: number;
  completedQuestsToday: number;
  completionPercentage: number;
  todayXpEarned: number;
  todayGoldEarned: number;
  todayActiveMinutes: number;
}

export interface WorldOverviewData {
  profile: ProfileRecord & {
    current_streak: number;
    longest_streak: number;
    last_completed_date: string | null;
    timezone: string;
  };
  todayQuests: Quest[];
  dailyStats: DailyAdventureStats;
  recentVictories: RewardEvent[];
  activeBoss?: BossBattleSummary | null;
  unlockedAchievementsCount?: number;
  totalAchievementsCount?: number;
}

export async function getWorldOverviewAction(): Promise<{
  success: boolean;
  data?: WorldOverviewData;
  error?: string;
}> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, error: "Supabase credentials not configured." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required to enter realm." };
  }

  // 1. Fetch Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { success: false, error: "Player profile not found." };
  }

  // Determine today's date in user's timezone
  const userTimezone = profile.timezone || "UTC";
  const todayDateStr = getCalendarDateInTimezone(new Date(), userTimezone);

  // 2. Fetch All Quests for User (to filter today's quests and get status)
  const { data: allQuests = [] } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const todayQuests = (allQuests || []).filter(
    (q) => q.scheduled_date === todayDateStr
  ) as Quest[];

  const completedTodayQuests = todayQuests.filter((q) => q.status === "completed");

  // 3. Fetch Today's Reward Events (to sum real XP and Gold earned today)
  // Today's start timestamp in UTC (approximated for user's calendar date)
  const todayStartIso = `${todayDateStr}T00:00:00.000Z`;

  const { data: todayRewards = [] } = await supabase
    .from("reward_events")
    .select("xp_amount, gold_amount, created_at")
    .eq("user_id", user.id)
    .gte("created_at", todayStartIso);

  const todayXpEarned = (todayRewards || []).reduce((sum, r) => sum + (r.xp_amount || 0), 0);
  const todayGoldEarned = (todayRewards || []).reduce((sum, r) => sum + (r.gold_amount || 0), 0);

  // 4. Fetch Today's Completed Game Sessions (to compute real active time logged)
  const { data: todaySessions = [] } = await supabase
    .from("game_sessions")
    .select("duration_seconds")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("created_at", todayStartIso);

  const totalDurationSeconds = (todaySessions || []).reduce(
    (sum, s) => sum + (s.duration_seconds || 0),
    0
  );
  const todayActiveMinutes = Math.round(totalDurationSeconds / 60);

  // 5. Fetch Recent Reward Events (for recent victories ledger)
  const { data: recentVictories = [] } = await supabase
    .from("reward_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const totalQuestsCount = todayQuests.length;
  const completedCount = completedTodayQuests.length;
  const completionPercentage =
    totalQuestsCount > 0 ? Math.round((completedCount / totalQuestsCount) * 100) : 0;

  // 5. Fetch Active Boss Encounter & Achievements Count
  const bossResult = await getActiveBossAction();
  const activeBoss = bossResult.success ? bossResult.data : null;

  let unlockedAchievementsCount = 0;
  try {
    const { count } = await supabase
      .from("user_achievements")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);
    unlockedAchievementsCount = count || 0;
  } catch {
    // Graceful fallback
  }

  return {
    success: true,
    data: {
      profile,
      todayQuests,
      dailyStats: {
        totalQuestsToday: totalQuestsCount,
        completedQuestsToday: completedCount,
        completionPercentage,
        todayXpEarned,
        todayGoldEarned,
        todayActiveMinutes,
      },
      recentVictories: (recentVictories || []) as RewardEvent[],
      activeBoss,
      unlockedAchievementsCount,
      totalAchievementsCount: 8,
    },
  };
}
