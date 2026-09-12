/**
 * LIFEFORGE: Achievements Domain Types
 * Phase 11: Server-Authoritative Milestones
 */

export type AchievementKey =
  | "first_quest"
  | "quest_hunter"
  | "unbreakable"
  | "forge_master"
  | "level_ascended"
  | "night_owl"
  | "adventurer"
  | "boss_slayer";

export interface AchievementDefinition {
  key: AchievementKey;
  title: string;
  description: string;
  iconName: string;
  requirementText: string;
  targetValue: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_key: AchievementKey;
  unlocked_at: string;
  metadata?: Record<string, any>;
}

export interface AchievementProgressItem extends AchievementDefinition {
  isUnlocked: boolean;
  unlockedAt: string | null;
  currentValue: number;
  progressPercent: number;
}

export interface PlayerProgressionSignals {
  completedQuestsCount: number;
  currentStreak: number;
  level: number;
  uniqueCategoriesCount: number;
  completedNightlyPlansCount: number;
  defeatedBossesCount: number;
}
