"use server";

import { createClient } from "@/lib/supabase/server";
import { RewardEvent } from "@/lib/rpg/types";

export interface RewardActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Retrieves the authenticated user's recent reward events with RLS enforcement.
 */
export async function getRewardHistoryAction(
  limit: number = 10
): Promise<RewardActionResult<RewardEvent[]>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: true, data: [] };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      error: "Authentication required to read victory ledger.",
    };
  }

  const { data, error } = await supabase
    .from("reward_events")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(Math.min(50, Math.max(1, limit)));

  if (error) {
    console.error("Failed to fetch reward events:", error.message);
    return {
      success: false,
      error: "Could not retrieve victory history.",
    };
  }

  return {
    success: true,
    data: (data || []) as RewardEvent[],
  };
}
