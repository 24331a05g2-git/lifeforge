"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";
import {
  CreateQuestInput,
  Quest,
  QuestCategory,
  QuestDifficulty,
  QuestPriority,
  QuestStatus,
  UpdateQuestInput,
} from "@/lib/quests/types";
import {
  isValidStatusTransition,
  resolveQuestMetadata,
} from "@/lib/quests/config";

export interface QuestActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const VALID_CATEGORIES: QuestCategory[] = [
  "learning",
  "fitness",
  "productivity",
  "personal",
  "creative",
  "social",
  "other",
];

const VALID_PRIORITIES: QuestPriority[] = ["low", "medium", "high"];
const VALID_DIFFICULTIES: QuestDifficulty[] = ["easy", "normal", "hard", "epic"];
const VALID_STATUSES: QuestStatus[] = ["pending", "in_progress", "completed", "skipped"];

/**
 * Creates a new quest in the Supabase PostgreSQL database.
 * Server-authoritative: user_id is derived strictly from the authenticated session.
 * Attribute, Game Type, XP, and Gold rewards are securely computed on the server.
 */
export async function createQuestAction(
  input: CreateQuestInput
): Promise<QuestActionResult<Quest>> {
  if (!getSupabaseEnv().isConfigured) {
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
      error: "Your session has expired. Please sign in to forge quests.",
    };
  }

  // 1. Validate Title
  const title = input.title?.trim();
  if (!title || title.length < 2 || title.length > 120) {
    return {
      success: false,
      error: "Quest name must be between 2 and 120 runes long.",
    };
  }

  // 2. Validate Category
  const category = input.category;
  if (!category || !VALID_CATEGORIES.includes(category)) {
    return {
      success: false,
      error: "Please select a valid challenge category.",
    };
  }

  // 3. Validate Priority & Difficulty
  const priority = input.priority && VALID_PRIORITIES.includes(input.priority)
    ? input.priority
    : "medium";

  const difficulty = input.difficulty && VALID_DIFFICULTIES.includes(input.difficulty)
    ? input.difficulty
    : "normal";

  // 4. Validate Duration
  const estimatedDuration =
    typeof input.estimated_duration === "number" &&
    input.estimated_duration >= 1 &&
    input.estimated_duration <= 1440
      ? Math.round(input.estimated_duration)
      : 30;

  // 5. Validate Scheduled Date (YYYY-MM-DD)
  const scheduledDate =
    input.scheduled_date && /^\d{4}-\d{2}-\d{2}$/.test(input.scheduled_date)
      ? input.scheduled_date
      : new Date().toISOString().split("T")[0];

  const description = input.description ? input.description.trim().slice(0, 1000) : "";

  // 6. Server-Side Reward & Engine Resolution (Never trust client values)
  const meta = resolveQuestMetadata(category, difficulty);

  const questPayload = {
    user_id: user.id,
    title,
    description,
    category,
    priority,
    difficulty,
    scheduled_date: scheduledDate,
    estimated_duration: estimatedDuration,
    xp_reward: meta.xp_reward,
    gold_reward: meta.gold_reward,
    attribute: meta.attribute,
    game_type: meta.game_type,
    status: "pending" as QuestStatus,
  };

  const { data, error } = await supabase
    .from("quests")
    .insert(questPayload)
    .select()
    .single();

  if (error) {
    console.error("Supabase quest create error:", error.message);
    return {
      success: false,
      error: `The Forge could not record your quest: ${error.message}`,
    };
  }

  revalidatePath("/quests");
  revalidatePath("/dashboard");

  return {
    success: true,
    data: data as Quest,
  };
}

/**
 * Retrieves all quests belonging to the authenticated user.
 */
export async function getQuestsAction(): Promise<QuestActionResult<Quest[]>> {
  if (!getSupabaseEnv().isConfigured) {
    return { success: true, data: [] };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      error: "Authentication required to read quest board.",
    };
  }

  const { data, error } = await supabase
    .from("quests")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase getQuests error:", error.message);
    return {
      success: false,
      error: "Could not retrieve your quest board from the realm archive.",
    };
  }

  return {
    success: true,
    data: (data || []) as Quest[],
  };
}

/**
 * Updates an existing quest with server-side validation and ownership verification.
 */
export async function updateQuestAction(
  input: UpdateQuestInput
): Promise<QuestActionResult<Quest>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const { data: existingQuest, error: fetchError } = await supabase
    .from("quests")
    .select("*")
    .eq("id", input.id)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !existingQuest) {
    return { success: false, error: "Quest not found or you do not have ownership." };
  }

  const updates: Partial<Quest> = {};

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (title.length < 2 || title.length > 120) {
      return { success: false, error: "Quest name must be between 2 and 120 runes long." };
    }
    updates.title = title;
  }

  if (input.description !== undefined) {
    updates.description = input.description.trim().slice(0, 1000);
  }

  if (input.priority && VALID_PRIORITIES.includes(input.priority)) {
    updates.priority = input.priority;
  }

  if (input.estimated_duration !== undefined) {
    if (input.estimated_duration < 1 || input.estimated_duration > 1440) {
      return { success: false, error: "Duration must be between 1 and 1440 minutes." };
    }
    updates.estimated_duration = Math.round(input.estimated_duration);
  }

  if (input.scheduled_date && /^\d{4}-\d{2}-\d{2}$/.test(input.scheduled_date)) {
    updates.scheduled_date = input.scheduled_date;
  }

  // If category or difficulty changed, re-resolve metadata
  const targetCategory = input.category || (existingQuest.category as QuestCategory);
  const targetDifficulty = input.difficulty || (existingQuest.difficulty as QuestDifficulty);

  if (input.category || input.difficulty) {
    if (input.category && !VALID_CATEGORIES.includes(input.category)) {
      return { success: false, error: "Invalid category." };
    }
    if (input.difficulty && !VALID_DIFFICULTIES.includes(input.difficulty)) {
      return { success: false, error: "Invalid difficulty." };
    }

    updates.category = targetCategory;
    updates.difficulty = targetDifficulty;

    const meta = resolveQuestMetadata(targetCategory, targetDifficulty);
    updates.attribute = meta.attribute;
    updates.game_type = meta.game_type;
    updates.xp_reward = meta.xp_reward;
    updates.gold_reward = meta.gold_reward;
  }

  const { data: updated, error: updateError } = await supabase
    .from("quests")
    .update(updates)
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: `Could not update quest: ${updateError.message}` };
  }

  revalidatePath("/quests");
  revalidatePath("/dashboard");

  return { success: true, data: updated as Quest };
}

/**
 * Transitions a quest's status according to the valid state machine.
 */
export async function updateQuestStatusAction(
  questId: string,
  newStatus: QuestStatus
): Promise<QuestActionResult<Quest>> {
  if (!VALID_STATUSES.includes(newStatus)) {
    return { success: false, error: "Invalid quest status transition." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const { data: currentQuest, error: fetchError } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !currentQuest) {
    return { success: false, error: "Quest not found." };
  }

  // Enforce state machine transition rules
  if (!isValidStatusTransition(currentQuest.status as QuestStatus, newStatus)) {
    return {
      success: false,
      error: `Cannot transition mission from ${currentQuest.status} to ${newStatus}.`,
    };
  }

  const updates: Partial<Quest> = {
    status: newStatus,
  };

  if (newStatus === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  const { data: updated, error: updateError } = await supabase
    .from("quests")
    .update(updates)
    .eq("id", questId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (updateError) {
    return { success: false, error: `Could not update quest status: ${updateError.message}` };
  }

  revalidatePath("/quests");
  revalidatePath("/dashboard");

  return { success: true, data: updated as Quest };
}

/**
 * Deletes an existing quest with ownership enforcement.
 */
export async function deleteQuestAction(questId: string): Promise<QuestActionResult<void>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required." };
  }

  const { error } = await supabase
    .from("quests")
    .delete()
    .eq("id", questId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: `Could not delete quest: ${error.message}` };
  }

  revalidatePath("/quests");
  revalidatePath("/dashboard");

  return { success: true };
}
