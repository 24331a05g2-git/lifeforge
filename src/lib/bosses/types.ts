/**
 * LIFEFORGE: Boss Battles Domain Types
 * Phase 11: Real-Life Goal Encounters
 */

export type BossStatus = "active" | "defeated";

export interface BossBattle {
  id: string;
  user_id: string;
  title: string;
  description: string;
  goal_category: string;
  progress: number;
  target_value: number;
  xp_reward: number;
  gold_reward: number;
  status: BossStatus;
  reward_claimed: boolean;
  created_at: string;
  defeated_at?: string | null;
}

export interface BossBattleSummary {
  boss: BossBattle;
  remainingQuests: number;
  progressPercent: number;
  isReadyToClaim: boolean;
}

export interface BossProgressOutcome {
  progressIncremented: boolean;
  newProgress: number;
  defeatedNow: boolean;
  boss: BossBattle;
}
