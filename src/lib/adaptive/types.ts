import { QuestDifficulty } from "@/lib/quests/types";

export type AdaptiveDirection = "lighter" | "balanced" | "harder";
export type AdaptiveConfidence = "low" | "medium" | "high";

export interface AdaptiveSignals {
  windowDays: number;
  startDateStr: string;
  endDateStr: string;
  totalQuests: number;
  completedQuests: number;
  unfinishedQuests: number;
  completionRate: number; // 0.0 to 1.0
  avgQuestsPerDay: number;
  avgDailyMinutes: number;
  currentStreak: number;
  difficultyDistribution: Record<QuestDifficulty, number>;
  hasSufficientData: boolean;
}

export interface AdaptiveRecommendation {
  direction: AdaptiveDirection;
  confidence: AdaptiveConfidence;
  title: string;
  message: string;
  reasons: string[];
  suggestedAction: string;
  signals: AdaptiveSignals;
  generatedAt: string;
}

export interface AdaptiveActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
