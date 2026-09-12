"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { BossBattle, BossBattleSummary } from "@/lib/bosses/types";
import {
  advanceBossProgress,
  createStarterBossTemplate,
  getBossSummary,
} from "@/lib/bosses/rules";
import { getLevelFromTotalXp } from "@/lib/rpg/progression";

export interface BossActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Retrieves the user's current active or unclaimed boss battle.
 * If no boss exists, seeds an initial starter boss based on character goals.
 */
export async function getActiveBossAction(): Promise<
  BossActionResult<BossBattleSummary | null>
> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, error: "Database unconfigured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required." };
  }

  // 1. Look for an active boss or an unclaimed defeated boss
  const { data: activeBosses = [] } = await supabase
    .from("boss_battles")
    .select("*")
    .eq("user_id", user.id)
    .or("status.eq.active,reward_claimed.eq.false")
    .order("created_at", { ascending: false })
    .limit(1);

  if (activeBosses && activeBosses.length > 0) {
    const boss = activeBosses[0] as BossBattle;
    return {
      success: true,
      data: getBossSummary(boss),
    };
  }

  // 2. Check if user already has any boss battles at all
  const { count } = await supabase
    .from("boss_battles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (count === 0) {
    // Fetch profile goals to tailor starter boss
    const { data: profile } = await supabase
      .from("profiles")
      .select("selected_goals")
      .eq("user_id", user.id)
      .maybeSingle();

    const starterTemplate = createStarterBossTemplate(profile?.selected_goals || []);

    const { data: newBoss, error: insertError } = await supabase
      .from("boss_battles")
      .insert({
        user_id: user.id,
        title: starterTemplate.title,
        description: starterTemplate.description,
        goal_category: starterTemplate.goal_category,
        target_value: starterTemplate.target_value,
        xp_reward: starterTemplate.xp_reward,
        gold_reward: starterTemplate.gold_reward,
        progress: 0,
        status: "active",
        reward_claimed: false,
      })
      .select("*")
      .single();

    if (!insertError && newBoss) {
      return {
        success: true,
        data: getBossSummary(newBoss as BossBattle),
      };
    }
  }

  return {
    success: true,
    data: null,
  };
}

/**
 * Claims the victory bounty for a defeated boss battle.
 * Enforces strict single-claim idempotency.
 */
export async function claimBossRewardAction(
  bossId: string
): Promise<BossActionResult<{ xpEarned: number; goldEarned: number }>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { success: false, error: "Database unconfigured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Authentication required to claim bounty." };
  }

  // 1. Try atomic PostgreSQL RPC claim_boss_reward
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc("claim_boss_reward", {
      p_boss_id: bossId,
    });

    if (!rpcError && rpcData && rpcData.success) {
      revalidatePath("/dashboard");
      revalidatePath("/character");
      return {
        success: true,
        data: {
          xpEarned: rpcData.xp_awarded,
          goldEarned: rpcData.gold_awarded,
        },
      };
    }

    if (rpcError) {
      const msg = rpcError.message || "";
      if (msg.includes("already been claimed")) {
        return { success: false, error: "Victory bounty has already been claimed." };
      }
      if (msg.includes("not been defeated")) {
        return { success: false, error: "Boss must be defeated before claiming bounty." };
      }
    }
  } catch {
    // Fall back to server transaction
  }

  // 2. Server-Authoritative Fallback Transaction
  const { data: boss, error: bossErr } = await supabase
    .from("boss_battles")
    .select("*")
    .eq("id", bossId)
    .eq("user_id", user.id)
    .single();

  if (bossErr || !boss) {
    return { success: false, error: "Boss encounter not found." };
  }

  if (boss.status !== "defeated") {
    return { success: false, error: "Boss has not been defeated yet." };
  }

  if (boss.reward_claimed) {
    return { success: false, error: "Victory bounty has already been claimed." };
  }

  // Update boss reward claimed flag
  const { error: updateBossErr } = await supabase
    .from("boss_battles")
    .update({ reward_claimed: true })
    .eq("id", bossId)
    .eq("user_id", user.id);

  if (updateBossErr) {
    return { success: false, error: "Failed to register claimed bounty." };
  }

  // Award XP and Gold to player profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp, gold")
    .eq("user_id", user.id)
    .single();

  if (profile) {
    const newTotalXp = (profile.xp || 0) + boss.xp_reward;
    const newGold = (profile.gold || 0) + boss.gold_reward;
    const newLevel = getLevelFromTotalXp(newTotalXp);

    await supabase
      .from("profiles")
      .update({
        xp: newTotalXp,
        gold: newGold,
        level: newLevel,
      })
      .eq("user_id", user.id);
  }

  // Idempotently record boss_slayer achievement
  await supabase.from("user_achievements").upsert(
    {
      user_id: user.id,
      achievement_key: "boss_slayer",
      unlocked_at: new Date().toISOString(),
    },
    { onConflict: "user_id,achievement_key", ignoreDuplicates: true }
  );

  revalidatePath("/dashboard");
  revalidatePath("/character");

  return {
    success: true,
    data: {
      xpEarned: boss.xp_reward,
      goldEarned: boss.gold_reward,
    },
  };
}

/**
 * Server-authoritative helper called when completing a quest.
 * Advances active boss battles matching the quest's category.
 */
export async function advanceActiveBossesOnQuestCompletion(
  userId: string,
  questCategory: string
): Promise<void> {
  try {
    const supabase = await createClient();

    const { data: activeBosses = [] } = await supabase
      .from("boss_battles")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active");

    for (const rawBoss of activeBosses || []) {
      const boss = rawBoss as BossBattle;
      const outcome = advanceBossProgress(boss, questCategory);
      if (outcome.progressIncremented) {
        await supabase
          .from("boss_battles")
          .update({
            progress: outcome.newProgress,
            status: outcome.boss.status,
            defeated_at: outcome.boss.defeated_at,
          })
          .eq("id", boss.id)
          .eq("user_id", userId);
      }
    }
  } catch (err) {
    console.error("Non-fatal: failed to advance active boss battles:", err);
  }
}
