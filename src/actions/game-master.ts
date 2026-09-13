"use server";

import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getCalendarDateInTimezone } from "@/lib/rpg/streak";
import { GameMasterContextData, GameMasterMessage } from "@/lib/game-master/types";
import { gameMasterProvider } from "@/lib/game-master/provider";
import {
  getCurrentTimeInTimezone,
  getHourInTimezone,
  evaluateNotificationEligibility,
} from "@/lib/notifications/rules";
import { DEFAULT_NOTIFICATION_PREFERENCES, NotificationPreferences, NotificationType } from "@/lib/notifications/types";

export interface GameMasterAdviceResult {
  success: boolean;
  data?: {
    message: GameMasterMessage;
    contextData: GameMasterContextData;
  };
  error?: string;
}

/**
 * Server-authoritative action to evaluate the player's context,
 * generate ARIA's motivational guidance, and idempotently create
 * eligible in-app notifications if rules permit.
 */
export async function getGameMasterAdviceAction(): Promise<GameMasterAdviceResult> {
  if (!getSupabaseEnv().isConfigured) {
    return { success: false, error: "Supabase credentials not configured." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Authentication required to consult Game Master." };
  }

  // 1. Fetch Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { success: false, error: "Profile not found." };
  }

  const userTimezone = profile.timezone || "UTC";
  const now = new Date();
  const todayDateStr = getCalendarDateInTimezone(now, userTimezone);
  const localHour = getHourInTimezone(now, userTimezone);
  const currentTimeStr = getCurrentTimeInTimezone(userTimezone);

  // 2. Fetch Today's Quests
  const { data: quests = [] } = await supabase
    .from("quests")
    .select("id, status, scheduled_date")
    .eq("user_id", user.id);

  const todayQuests = (quests || []).filter((q) => q.scheduled_date === todayDateStr);
  const completedToday = todayQuests.filter((q) => q.status === "completed").length;
  const questsToday = todayQuests.length;
  const remainingQuests = Math.max(0, questsToday - completedToday);

  // 3. Determine time of day
  let timeOfDay: "morning" | "midday" | "evening" | "night" = "morning";
  if (localHour >= 5 && localHour < 12) {
    timeOfDay = "morning";
  } else if (localHour >= 12 && localHour < 17) {
    timeOfDay = "midday";
  } else if (localHour >= 17 && localHour < 21) {
    timeOfDay = "evening";
  } else {
    timeOfDay = "night";
  }

  // Determine top attributes
  const attributes = [
    { name: "Strength", val: profile.strength || 0 },
    { name: "Intellect", val: profile.intellect || 0 },
    { name: "Focus", val: profile.focus || 0 },
    { name: "Discipline", val: profile.discipline || 0 },
    { name: "Energy", val: profile.energy || 0 },
  ].sort((a, b) => b.val - a.val);

  const contextData: GameMasterContextData = {
    timeOfDay,
    localHour,
    questsToday,
    completedToday,
    remainingQuests,
    currentStreak: profile.current_streak || 0,
    longestStreak: profile.longest_streak || 0,
    level: profile.level || 1,
    xp: profile.xp || 0,
    goals: profile.primary_goals || [],
    strongestAttributes: attributes.slice(0, 2).map((a) => a.name),
    recentActivity: {
      completedQuestCount: completedToday,
    },
    timezone: userTimezone,
  };

  // 4. Generate Message via GameMasterProvider
  const message = await gameMasterProvider.generateMessage(contextData);

  // 5. Check In-App Notification Eligibility
  try {
    const { data: prefData } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const preferences: NotificationPreferences = prefData || {
      user_id: user.id,
      ...DEFAULT_NOTIFICATION_PREFERENCES,
    };

    // Map context to notification type
    let notifType: NotificationType = "aria_guidance";
    if (message.context === "streak_at_risk") {
      notifType = "streak_alert";
    } else if (message.context === "morning" || message.context === "upcoming_quest") {
      notifType = "quest_reminder";
    }

    // Count today's notifications
    const todayStartIso = `${todayDateStr}T00:00:00.000Z`;
    const { count: todayCount = 0 } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", todayStartIso);

    // Check duplicate of same context today
    const { data: duplicateNotifs = [] } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", user.id)
      .eq("type", notifType)
      .gte("created_at", todayStartIso)
      .limit(1);

    const hasDuplicateToday = (duplicateNotifs || []).length > 0;

    const eligibility = evaluateNotificationEligibility({
      type: notifType,
      preferences,
      currentTimeStr,
      todayNotificationCount: todayCount || 0,
      hasDuplicateToday,
    });

    // If eligible and context is notable (e.g. streak_at_risk, morning, or evening_review), create notification
    const notableContexts = ["streak_at_risk", "morning", "evening_review", "good_progress"];
    if (eligibility.allowed && notableContexts.includes(message.context)) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        type: notifType,
        title: message.title,
        message: message.message,
        action_label: message.actionLabel || null,
        action_url: message.actionHref || null,
        priority: message.priority,
        metadata: {
          context: message.context,
          localHour,
        },
      });
    }
  } catch (notifErr) {
    console.error("Non-blocking notification evaluation error:", notifErr);
  }

  return {
    success: true,
    data: {
      message,
      contextData,
    },
  };
}
