import { QuestAttribute, QuestCategory, QuestDifficulty } from "@/lib/quests/types";

export interface RewardEvent {
  id: string;
  user_id: string;
  quest_id: string;
  game_session_id: string;
  event_type: "quest_completion";
  xp_amount: number;
  gold_amount: number;
  attribute: QuestAttribute;
  attribute_amount: number;
  level_before: number;
  level_after: number;
  streak_before: number;
  streak_after: number;
  metadata?: {
    quest_title?: string;
    category?: QuestCategory;
    difficulty?: QuestDifficulty;
    duration_seconds?: number;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface LevelProgress {
  currentLevel: number;
  currentLevelThresholdXp: number; // Cumulative XP needed to reach current level
  nextLevelThresholdXp: number; // Cumulative XP needed to reach next level
  xpIntoCurrentLevel: number; // XP earned within current level
  xpRequiredForNextLevel: number; // Total XP needed to cross from current to next level
  xpRemaining: number; // XP still needed to reach next level
  progressPercentage: number; // 0 - 100 percentage within current level
  totalCumulativeXp: number; // Grand total cumulative XP
}

export interface LevelTransitionResult {
  previousLevel: number;
  newLevel: number;
  leveledUp: boolean;
  levelsGained: number;
  previousTotalXp: number;
  newTotalXp: number;
  xpGained: number;
  progressBefore: LevelProgress;
  progressAfter: LevelProgress;
}

export interface StreakResult {
  previousStreak: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string; // YYYY-MM-DD
  isStreakExtended: boolean; // True if streak incremented today
  isNewRecord: boolean; // True if this created a new longest streak
}

export interface AuthoritativeRewardResult {
  reward: {
    xp: number;
    gold: number;
    attribute: QuestAttribute;
    attributeGain: number;
  };
  progression: LevelTransitionResult;
  streak: StreakResult;
  rewardEventId: string;
}
