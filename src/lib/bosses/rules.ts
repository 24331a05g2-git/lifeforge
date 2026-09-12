import { BossBattle, BossProgressOutcome, BossBattleSummary } from "./types";

/**
 * Checks whether a completed quest applies to a boss battle's goal scope.
 */
export function isQuestApplicableToBoss(questCategory: string, bossGoalCategory: string): boolean {
  if (!bossGoalCategory || bossGoalCategory.toLowerCase() === "all") {
    return true;
  }
  return questCategory.toLowerCase().trim() === bossGoalCategory.toLowerCase().trim();
}

/**
 * Pure evaluation of boss progression upon quest completion.
 */
export function advanceBossProgress(boss: BossBattle, questCategory: string): BossProgressOutcome {
  if (boss.status === "defeated") {
    return {
      progressIncremented: false,
      newProgress: boss.progress,
      defeatedNow: false,
      boss,
    };
  }

  if (!isQuestApplicableToBoss(questCategory, boss.goal_category)) {
    return {
      progressIncremented: false,
      newProgress: boss.progress,
      defeatedNow: false,
      boss,
    };
  }

  const newProgress = Math.min(boss.target_value, boss.progress + 1);
  const defeatedNow = newProgress >= boss.target_value;

  const updatedBoss: BossBattle = {
    ...boss,
    progress: newProgress,
    status: defeatedNow ? "defeated" : "active",
    defeated_at: defeatedNow ? new Date().toISOString() : boss.defeated_at,
  };

  return {
    progressIncremented: true,
    newProgress,
    defeatedNow,
    boss: updatedBoss,
  };
}

/**
 * Computes presentation summary metrics for a boss battle.
 */
export function getBossSummary(boss: BossBattle): BossBattleSummary {
  const remainingQuests = Math.max(0, boss.target_value - boss.progress);
  const progressPercent = Math.min(
    100,
    Math.floor((boss.progress / Math.max(1, boss.target_value)) * 100)
  );
  const isReadyToClaim = boss.status === "defeated" && !boss.reward_claimed;

  return {
    boss,
    remainingQuests,
    progressPercent,
    isReadyToClaim,
  };
}

/**
 * Generates initial starter boss data for new adventurers based on their goals.
 */
export function createStarterBossTemplate(selectedGoals: string[] = []): {
  title: string;
  description: string;
  goal_category: string;
  target_value: number;
  xp_reward: number;
  gold_reward: number;
} {
  const primaryGoal = selectedGoals[0]?.toLowerCase() || "";

  if (primaryGoal.includes("focus") || primaryGoal.includes("work") || primaryGoal.includes("career")) {
    return {
      title: "The Portfolio Beast",
      description: "Build something tangible that stands as proof of your capability and grit.",
      goal_category: "productivity",
      target_value: 10,
      xp_reward: 250,
      gold_reward: 100,
    };
  }

  if (primaryGoal.includes("fitness") || primaryGoal.includes("health") || primaryGoal.includes("strength")) {
    return {
      title: "The Iron Colossus",
      description: "A trial of physical resilience. Reclaim vitality through daily discipline.",
      goal_category: "fitness",
      target_value: 10,
      xp_reward: 250,
      gold_reward: 100,
    };
  }

  if (primaryGoal.includes("learn") || primaryGoal.includes("study") || primaryGoal.includes("skill")) {
    return {
      title: "The Sphinx of Wisdom",
      description: "Unlock deep understanding and conquer difficult concepts one day at a time.",
      goal_category: "learning",
      target_value: 10,
      xp_reward: 250,
      gold_reward: 100,
    };
  }

  return {
    title: "The Citadel Colossus",
    description: "The grand trial of consistency. Conquer 10 daily trials to prove your resolve.",
    goal_category: "all",
    target_value: 10,
    xp_reward: 250,
    gold_reward: 100,
  };
}
