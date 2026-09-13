"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCalendarDateInTimezone } from "@/lib/rpg/streak";
import { getPastCalendarDate } from "@/lib/camp/rules";
import { computeAdaptiveSignals } from "@/lib/adaptive/signals";
import { evaluateAdaptiveRecommendation } from "@/lib/adaptive/rules";
import { AdaptiveActionResult, AdaptiveRecommendation } from "@/lib/adaptive/types";
import { Quest } from "@/lib/quests/types";

/**
 * Server-authoritative action to analyze a player's real 7-day activity
 * and produce deterministic workload recommendations.
 * Awards STRICTLY 0 XP and 0 Gold.
 */
export async function getAdaptiveDifficultyAction(): Promise<
  AdaptiveActionResult<AdaptiveRecommendation>
> {
  if (!getSupabaseEnv().isConfigured) {
    return { success: false, error: "Supabase credentials not configured." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required to consult Adaptive Guidance." };
  }

  // 1. Fetch Profile for Timezone & Current Streak
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("timezone, current_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { success: false, error: "Player profile not found." };
  }

  const userTimezone = profile.timezone || "UTC";
  const currentStreak = profile.current_streak || 0;

  // 2. Derive 7-day window dates in user's timezone
  const now = new Date();
  const endDateStr = getCalendarDateInTimezone(now, userTimezone);
  const startDateStr = getPastCalendarDate(endDateStr, 7);
  const startIso = `${startDateStr}T00:00:00.000Z`;

  // 3. Query Quests in Window (Only for this authenticated user)
  const { data: quests = [], error: questError } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", user.id)
    .gte("scheduled_date", startDateStr)
    .lte("scheduled_date", endDateStr)
    .order("scheduled_date", { ascending: true });

  if (questError) {
    return { success: false, error: `Failed to query quest history: ${questError.message}` };
  }

  // 4. Query Game Sessions in Window
  const { data: sessions = [] } = await supabase
    .from("game_sessions")
    .select("duration_seconds")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .gte("created_at", startIso);

  // 5. Compute Signals & Evaluate Recommendation
  const signals = computeAdaptiveSignals({
    quests: (quests as Quest[]) || [],
    gameSessions: sessions || [],
    currentStreak,
    startDateStr,
    endDateStr,
    windowDays: 7,
  });

  const recommendation = evaluateAdaptiveRecommendation(signals);

  return {
    success: true,
    data: recommendation,
  };
}
