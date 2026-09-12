import { Quest, QuestDifficulty } from "@/lib/quests/types";
import { AdaptiveSignals } from "./types";

export interface ComputeSignalsInput {
  quests: Quest[];
  gameSessions?: { duration_seconds: number }[];
  currentStreak: number;
  startDateStr: string;
  endDateStr: string;
  windowDays?: number;
}

/**
 * Computes deterministic mathematical signals from real database records
 * over a specified rolling window (default 7 days).
 * Never fabricates metrics or estimates without backing data.
 */
export function computeAdaptiveSignals(input: ComputeSignalsInput): AdaptiveSignals {
  const {
    quests,
    gameSessions = [],
    currentStreak,
    startDateStr,
    endDateStr,
    windowDays = 7,
  } = input;

  const totalQuests = quests.length;
  const completedQuests = quests.filter((q) => q.status === "completed").length;
  const unfinishedQuests = Math.max(0, totalQuests - completedQuests);

  const completionRate =
    totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) / 100 : 0;

  const avgQuestsPerDay =
    windowDays > 0 ? Math.round((totalQuests / windowDays) * 10) / 10 : 0;

  const totalSeconds = gameSessions.reduce(
    (sum, s) => sum + (s.duration_seconds || 0),
    0
  );
  const avgDailyMinutes =
    windowDays > 0 ? Math.round((totalSeconds / 60) / windowDays) : 0;

  const difficultyDistribution: Record<QuestDifficulty, number> = {
    easy: 0,
    normal: 0,
    hard: 0,
    epic: 0,
  };

  quests.forEach((q) => {
    if (q.difficulty in difficultyDistribution) {
      difficultyDistribution[q.difficulty]++;
    }
  });

  // Threshold: At least 3 quests in the window to establish reliable patterns
  const hasSufficientData = totalQuests >= 3;

  return {
    windowDays,
    startDateStr,
    endDateStr,
    totalQuests,
    completedQuests,
    unfinishedQuests,
    completionRate,
    avgQuestsPerDay,
    avgDailyMinutes,
    currentStreak: Math.max(0, currentStreak),
    difficultyDistribution,
    hasSufficientData,
  };
}
