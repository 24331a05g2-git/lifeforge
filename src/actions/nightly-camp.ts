"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Quest } from "@/lib/quests/types";
import { getCalendarDateInTimezone } from "@/lib/rpg/streak";
import { getCurrentTimeInTimezone } from "@/lib/notifications/rules";
import {
  CampProfileInfo,
  NightlyCampData,
  NightlyPlanDifficulty,
  NightlyPlanRecord,
  SaveNightlyPlanInput,
  TodayReviewData,
} from "@/lib/camp/types";
import {
  calculateTomorrowSummary,
  generateCampAriaMessage,
  getNextCalendarDate,
  getPastCalendarDate,
  isBedtimeWindow,
} from "@/lib/camp/rules";
import { computeAdaptiveSignals } from "@/lib/adaptive/signals";
import { evaluateAdaptiveRecommendation } from "@/lib/adaptive/rules";

export interface CampActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const VALID_DIFFICULTIES: NightlyPlanDifficulty[] = ["easy", "normal", "challenge"];

/**
 * Server-authoritative action to aggregate all Nightly Camp data:
 * - Today's verified activity, triumphs, XP, gold, and unfinished quests
 * - Tomorrow's planned quests and expected projections
 * - Existing persistent nightly plan for tomorrow
 * - Configured bedtime and bedtime window evaluation
 * - ARIA campfire reflection
 */
export async function getNightlyCampDataAction(): Promise<CampActionResult<NightlyCampData>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, error: "Supabase credentials not configured." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required to enter Nightly Camp." };
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

  const userTimezone = profile.timezone || "UTC";
  const userBedtime = profile.bedtime || "22:30";
  const now = new Date();
  const todayDateStr = getCalendarDateInTimezone(now, userTimezone);
  const tomorrowDateStr = getNextCalendarDate(todayDateStr);
  const currentTimeStr = getCurrentTimeInTimezone(userTimezone);

  // 2. Fetch Today's and Tomorrow's Quests
  const { data: quests = [], error: questError } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", user.id)
    .or(`scheduled_date.eq.${todayDateStr},scheduled_date.eq.${tomorrowDateStr}`)
    .order("created_at", { ascending: true });

  if (questError) {
    return { success: false, error: `Failed to load quests: ${questError.message}` };
  }

  const todayQuests = (quests || []).filter((q) => q.scheduled_date === todayDateStr) as Quest[];
  const tomorrowQuests = (quests || []).filter((q) => q.scheduled_date === tomorrowDateStr) as Quest[];

  const todayCompletedQuests = todayQuests.filter((q) => q.status === "completed");
  const todayUnfinishedQuests = todayQuests.filter((q) => q.status !== "completed");

  // 3. Fetch Today's Rewards (Real XP and Gold earned today)
  const todayStartIso = `${todayDateStr}T00:00:00.000Z`;
  const { data: todayRewards = [] } = await supabase
    .from("reward_events")
    .select("xp_amount, gold_amount")
    .eq("user_id", user.id)
    .gte("created_at", todayStartIso);

  const xpEarnedToday = (todayRewards || []).reduce((sum, r) => sum + (r.xp_amount || 0), 0);
  const goldEarnedToday = (todayRewards || []).reduce((sum, r) => sum + (r.gold_amount || 0), 0);

  // 4. Fetch Today's Completed Sessions (Active time in minutes)
  const { data: todaySessions = [] } = await supabase
    .from("game_sessions")
    .select("duration_seconds")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("created_at", todayStartIso);

  const totalSeconds = (todaySessions || []).reduce((sum, s) => sum + (s.duration_seconds || 0), 0);
  const activeMinutesToday = Math.round(totalSeconds / 60);

  // 5. Fetch Existing Nightly Plan for Tomorrow
  const { data: planRecord } = await supabase
    .from("nightly_plans")
    .select("*")
    .eq("user_id", user.id)
    .eq("target_date", tomorrowDateStr)
    .maybeSingle();

  const activeDifficulty: NightlyPlanDifficulty = (planRecord?.difficulty as NightlyPlanDifficulty) || "normal";

  // 6. Compute Tomorrow Summary
  const tomorrowSummary = calculateTomorrowSummary(tomorrowQuests, activeDifficulty);

  // 7. Assemble Today Stats
  const completedCategories = Array.from(
    new Set(todayCompletedQuests.map((q) => q.category))
  );

  const todayStats: TodayReviewData = {
    totalQuestsToday: todayQuests.length,
    completedQuestsCount: todayCompletedQuests.length,
    remainingQuestsCount: todayUnfinishedQuests.length,
    xpEarnedToday,
    goldEarnedToday,
    activeMinutesToday,
    currentStreak: profile.current_streak || 0,
    longestStreak: profile.longest_streak || 0,
    level: profile.level || 1,
    completedCategories,
  };

  // 8. Compute 7-Day Adaptive Difficulty Signals & Recommendation
  const windowStartDateStr = getPastCalendarDate(todayDateStr, 7);
  const windowStartIso = `${windowStartDateStr}T00:00:00.000Z`;

  const { data: windowQuests = [] } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", user.id)
    .gte("scheduled_date", windowStartDateStr)
    .lte("scheduled_date", todayDateStr);

  const { data: windowSessions = [] } = await supabase
    .from("game_sessions")
    .select("duration_seconds")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("created_at", windowStartIso);

  const adaptiveSignals = computeAdaptiveSignals({
    quests: (windowQuests as Quest[]) || [],
    gameSessions: windowSessions || [],
    currentStreak: profile.current_streak || 0,
    startDateStr: windowStartDateStr,
    endDateStr: todayDateStr,
    windowDays: 7,
  });

  const adaptiveRecommendation = evaluateAdaptiveRecommendation(adaptiveSignals);

  // 9. Generate ARIA Camp Message
  const ariaCampMessage = generateCampAriaMessage({
    completedCount: todayCompletedQuests.length,
    unfinishedCount: todayUnfinishedQuests.length,
    currentStreak: profile.current_streak || 0,
    difficulty: activeDifficulty,
  });

  const campProfile: CampProfileInfo = {
    character_name: profile.character_name,
    archetype: profile.archetype,
    level: profile.level,
    xp: profile.xp,
    gold: profile.gold,
    current_streak: profile.current_streak || 0,
    longest_streak: profile.longest_streak || 0,
    bedtime: userBedtime,
    timezone: userTimezone,
  };

  return {
    success: true,
    data: {
      profile: campProfile,
      todayDateStr,
      tomorrowDateStr,
      todayStats,
      todayCompletedQuests,
      todayUnfinishedQuests,
      tomorrowQuests,
      tomorrowSummary,
      nightlyPlan: (planRecord as NightlyPlanRecord) || null,
      isBedtimeWindow: isBedtimeWindow(currentTimeStr, userBedtime),
      ariaCampMessage,
      adaptiveRecommendation,
    },
  };
}

/**
 * Persists tomorrow's plan into the database.
 * Awards STRICTLY 0 XP and 0 Gold.
 */
export async function saveNightlyPlanAction(
  input: SaveNightlyPlanInput
): Promise<CampActionResult<NightlyPlanRecord>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required to save plan." };
  }

  // 1. Validate dates
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.target_date) || !/^\d{4}-\d{2}-\d{2}$/.test(input.plan_date)) {
    return { success: false, error: "Invalid date format. Expected YYYY-MM-DD." };
  }

  // 2. Validate difficulty
  if (!VALID_DIFFICULTIES.includes(input.difficulty)) {
    return { success: false, error: "Invalid adventure difficulty selected." };
  }

  const reflection = (input.reflection || "").trim().slice(0, 1000);

  // 3. Upsert nightly plan record
  const { data, error } = await supabase
    .from("nightly_plans")
    .upsert(
      {
        user_id: user.id,
        plan_date: input.plan_date,
        target_date: input.target_date,
        difficulty: input.difficulty,
        status: "saved",
        reflection,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,target_date" }
    )
    .select()
    .single();

  if (error) {
    return { success: false, error: `Failed to save nightly plan: ${error.message}` };
  }

  revalidatePath("/nightly-camp");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: data as NightlyPlanRecord,
  };
}

/**
 * Moves an unfinished quest to tomorrow by updating its scheduled_date.
 * Strictly verifies user ownership and preserves all quest attributes.
 */
export async function moveQuestToTomorrowAction(
  questId: string,
  tomorrowDateStr: string
): Promise<CampActionResult<Quest>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tomorrowDateStr)) {
    return { success: false, error: "Invalid target date format." };
  }

  // Verify ownership
  const { data: existingQuest, error: fetchError } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !existingQuest) {
    return { success: false, error: "Quest not found or you do not have permission." };
  }

  // Update scheduled date to tomorrow
  const { data: updated, error: updateError } = await supabase
    .from("quests")
    .update({
      scheduled_date: tomorrowDateStr,
      updated_at: new Date().toISOString(),
    })
    .eq("id", questId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: `Failed to move quest: ${updateError.message}` };
  }

  revalidatePath("/nightly-camp");
  revalidatePath("/dashboard");
  revalidatePath("/quests");

  return {
    success: true,
    data: updated as Quest,
  };
}

/**
 * Updates the player's configured bedtime in their profile.
 */
export async function updateUserBedtimeAction(
  bedtime: string
): Promise<CampActionResult<string>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // Validate time format: HH:MM (00:00 to 23:59)
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(bedtime)) {
    return { success: false, error: "Invalid time format. Expected HH:MM." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      bedtime,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: `Failed to update bedtime: ${error.message}` };
  }

  revalidatePath("/nightly-camp");
  revalidatePath("/dashboard");

  return { success: true, data: bedtime };
}
