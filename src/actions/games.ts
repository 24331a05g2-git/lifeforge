"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { GameSession, GameSessionResult } from "@/lib/games/types";
import { Quest } from "@/lib/quests/types";
import { advanceActiveBossesOnQuestCompletion } from "@/actions/bosses";
import { getUserAchievementsAction } from "@/actions/achievements";

export interface GameActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Initiates an active game session for a specific quest.
 * Server-authoritative: validates session, quest ownership, and prevents starting completed quests.
 */
export async function startGameSessionAction(
  questId: string
): Promise<GameActionResult<GameSessionResult>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      success: false,
      error: "Supabase credentials are not configured in .env.local.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Authentication required to enter mini-game arena.",
    };
  }

  // 1. Verify Quest exists and belongs to authenticated user
  const { data: quest, error: questError } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("user_id", user.id)
    .single();

  if (questError || !quest) {
    return {
      success: false,
      error: "Mission not found or you do not have permission to launch it.",
    };
  }

  if (quest.status === "completed") {
    return {
      success: false,
      error: "This quest has already been conquered.",
    };
  }

  // 2. Check for an existing active session for this quest
  const { data: activeSession } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("quest_id", questId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (activeSession) {
    // Resume existing active session
    return {
      success: true,
      data: {
        session: activeSession as GameSession,
        quest: quest as Quest,
      },
    };
  }

  // 3. Create a new active game session
  const newSessionPayload = {
    user_id: user.id,
    quest_id: quest.id,
    game_type: quest.game_type,
    started_at: new Date().toISOString(),
    status: "active",
    duration_seconds: 0,
    user_notes: "",
  };

  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .insert(newSessionPayload)
    .select()
    .single();

  if (sessionError || !session) {
    console.error("Failed to create game session:", sessionError?.message);
    return {
      success: false,
      error: `Could not launch arena session: ${sessionError?.message || "Unknown error"}`,
    };
  }

  // 4. Transition quest status to in_progress
  await supabase
    .from("quests")
    .update({ status: "in_progress" })
    .eq("id", quest.id)
    .eq("user_id", user.id);

  revalidatePath("/quests");
  revalidatePath(`/quests/${quest.id}/play`);

  return {
    success: true,
    data: {
      session: session as GameSession,
      quest: { ...quest, status: "in_progress" } as Quest,
    },
  };
}

import {
  calculateQuestReward,
  calculateAttributeGain,
  resolveQuestAttribute,
} from "@/lib/rpg/rewards";
import { calculateLevelTransition } from "@/lib/rpg/progression";
import { calculateStreakUpdate } from "@/lib/rpg/streak";
import { AuthoritativeRewardResult } from "@/lib/rpg/types";
import { QuestDifficulty } from "@/lib/quests/types";

/**
 * Completes an active game session, marks the quest completed, and awards
 * server-authoritative XP, Gold, Attribute gains, Level-Up detection, and Streak updates.
 *
 * ZERO TRUST: All rewards, progression, and streaks are calculated strictly server-side.
 * IDEMPOTENCY: Protected by database uniqueness constraints on quest_id and game_session_id.
 */
export async function completeGameSessionAction(
  sessionId: string,
  userNotes: string = "",
  confirmedRealWorld: boolean = true,
  userTimezone: string = "UTC"
): Promise<GameActionResult<GameSessionResult>> {
  if (!confirmedRealWorld) {
    return {
      success: false,
      error: "Please confirm that you performed this activity in the real world.",
    };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Authentication required to record activity completion.",
    };
  }

  // 1. Attempt Atomic PostgreSQL RPC function (claim_quest_reward)
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("claim_quest_reward", {
      p_session_id: sessionId,
      p_user_notes: userNotes,
      p_user_timezone: userTimezone || "UTC",
    });

    if (!rpcError && rpcData && rpcData.success) {
      if (rpcData.quest?.category) {
        await advanceActiveBossesOnQuestCompletion(user.id, rpcData.quest.category);
      }
      await getUserAchievementsAction();

      revalidatePath("/quests");
      revalidatePath("/dashboard");
      revalidatePath("/character");

      return {
        success: true,
        data: {
          session: rpcData.session,
          quest: rpcData.quest,
          reward: {
            reward: rpcData.reward,
            progression: rpcData.progression,
            streak: rpcData.streak,
            rewardEventId: rpcData.rewardEventId,
          },
        },
      };
    } else if (rpcError && rpcError.message.includes("already been claimed")) {
      return {
        success: false,
        error: "Reward has already been claimed for this quest.",
      };
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("already been claimed")) {
      return {
        success: false,
        error: "Reward has already been claimed for this quest.",
      };
    }
  }

  // 2. Server-Authoritative Fallback Transaction (Zero-Trust Validation Chain)
  // Step A: Fetch & Validate Session
  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    return {
      success: false,
      error: "Session record not found or you do not have permission.",
    };
  }

  if (session.status === "abandoned") {
    return {
      success: false,
      error: "Cannot claim reward for an abandoned session.",
    };
  }

  // Step B: Fetch & Validate Quest
  const { data: quest, error: questError } = await supabase
    .from("quests")
    .select("*")
    .eq("id", session.quest_id)
    .eq("user_id", user.id)
    .single();

  if (questError || !quest) {
    return {
      success: false,
      error: "Associated quest could not be verified or unauthorized.",
    };
  }

  // Step C: Idempotency Check — Check if a reward event already exists
  const { data: existingReward } = await supabase
    .from("reward_events")
    .select("id")
    .eq("quest_id", quest.id)
    .maybeSingle();

  if (existingReward) {
    return {
      success: false,
      error: "Reward has already been claimed for this quest.",
    };
  }

  // Step D: Fetch Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      success: false,
      error: "Character profile could not be loaded.",
    };
  }

  // Step E: Compute Elapsed Wall-Clock Seconds
  const startedAt = new Date(session.started_at).getTime();
  const endedAtDate = new Date();
  const endedAt = endedAtDate.getTime();
  const elapsedSeconds = Math.max(1, Math.round((endedAt - startedAt) / 1000));

  // Step F: Mark Game Session Completed
  const { data: updatedSession, error: updateSessionError } = await supabase
    .from("game_sessions")
    .update({
      status: "completed",
      ended_at: endedAtDate.toISOString(),
      duration_seconds: elapsedSeconds,
      user_notes: userNotes.trim().slice(0, 1000),
    })
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateSessionError || !updatedSession) {
    return {
      success: false,
      error: `Could not finalize session: ${updateSessionError?.message}`,
    };
  }

  // Step G: Mark Quest Completed
  const { data: updatedQuest, error: updateQuestError } = await supabase
    .from("quests")
    .update({
      status: "completed",
      completed_at: endedAtDate.toISOString(),
    })
    .eq("id", quest.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateQuestError || !updatedQuest) {
    return {
      success: false,
      error: `Could not finalize quest: ${updateQuestError?.message}`,
    };
  }

  // Step H: Compute Deterministic Rewards, Level Progression, and Streak
  const questDifficulty = quest.difficulty as QuestDifficulty;
  const rewardConfig = calculateQuestReward(questDifficulty);
  const targetAttribute = resolveQuestAttribute(quest.category);
  const currentAttrVal = (profile as Record<string, number>)[targetAttribute] || 50;
  const attrProgression = calculateAttributeGain(questDifficulty, currentAttrVal);
  const levelProgression = calculateLevelTransition(profile.xp || 0, rewardConfig.xp);
  const streakUpdate = calculateStreakUpdate(
    profile.current_streak || 0,
    profile.longest_streak || 0,
    profile.last_completed_date,
    userTimezone || profile.timezone || "UTC"
  );

  // Step I: Update Profile (XP, Level, Gold, Attribute, Streak)
  const profileUpdates: Record<string, unknown> = {
    xp: levelProgression.newTotalXp,
    level: levelProgression.newLevel,
    gold: (profile.gold || 0) + rewardConfig.gold,
    current_streak: streakUpdate.currentStreak,
    longest_streak: streakUpdate.longestStreak,
    last_completed_date: streakUpdate.lastCompletedDate,
    [targetAttribute]: attrProgression.newValue,
  };

  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update(profileUpdates)
    .eq("user_id", user.id);

  if (updateProfileError) {
    console.warn("Profile progression update warning:", updateProfileError.message);
  }

  // Step J: Insert Permanent Reward Event Ledger Row
  const rewardEventPayload = {
    user_id: user.id,
    quest_id: quest.id,
    game_session_id: session.id,
    event_type: "quest_completion",
    xp_amount: rewardConfig.xp,
    gold_amount: rewardConfig.gold,
    attribute: targetAttribute,
    attribute_amount: attrProgression.gain,
    level_before: levelProgression.previousLevel,
    level_after: levelProgression.newLevel,
    streak_before: streakUpdate.previousStreak,
    streak_after: streakUpdate.currentStreak,
    metadata: {
      quest_title: quest.title,
      category: quest.category,
      difficulty: quest.difficulty,
      duration_seconds: elapsedSeconds,
    },
  };

  const { data: rewardEvent, error: insertRewardError } = await supabase
    .from("reward_events")
    .insert(rewardEventPayload)
    .select("id")
    .single();

  if (insertRewardError) {
    console.warn("Reward event ledger insertion warning:", insertRewardError.message);
  }

  if (quest.category) {
    await advanceActiveBossesOnQuestCompletion(user.id, quest.category);
  }
  await getUserAchievementsAction();

  revalidatePath("/quests");
  revalidatePath("/dashboard");
  revalidatePath("/character");
  revalidatePath(`/quests/${quest.id}/play`);

  return {
    success: true,
    data: {
      session: updatedSession as GameSession,
      quest: updatedQuest as Quest,
      reward: {
        reward: {
          xp: rewardConfig.xp,
          gold: rewardConfig.gold,
          attribute: targetAttribute,
          attributeGain: attrProgression.gain,
        },
        progression: levelProgression,
        streak: streakUpdate,
        rewardEventId: rewardEvent?.id || "fallback-id",
      },
    },
  };
}

/**
 * Abandons an active game session and resets the quest status to pending.
 */
export async function abandonGameSessionAction(
  sessionId: string
): Promise<GameActionResult<void>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const { data: session, error: sessionError } = await supabase
    .from("game_sessions")
    .select("quest_id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (sessionError || !session) {
    return { success: false, error: "Session not found." };
  }

  // Mark session as abandoned
  await supabase
    .from("game_sessions")
    .update({
      status: "abandoned",
      ended_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  // Revert quest back to pending
  await supabase
    .from("quests")
    .update({ status: "pending" })
    .eq("id", session.quest_id)
    .eq("user_id", user.id);

  revalidatePath("/quests");

  return { success: true };
}
