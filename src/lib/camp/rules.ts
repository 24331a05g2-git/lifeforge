import { Quest } from "@/lib/quests/types";
import { timeToMinutes } from "@/lib/notifications/rules";
import { CampAriaMessage, NightlyPlanDifficulty, TomorrowSummary } from "./types";

/**
 * Computes the next calendar date (YYYY-MM-DD) strictly using UTC calendar math,
 * avoiding daylight savings shifts.
 */
export function getNextCalendarDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
  return nextDate.toISOString().split("T")[0];
}

/**
 * Computes a past calendar date (YYYY-MM-DD) strictly using UTC calendar math.
 */
export function getPastCalendarDate(dateStr: string, daysAgo: number): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const pastDate = new Date(Date.UTC(year, month - 1, day - daysAgo));
  return pastDate.toISOString().split("T")[0];
}

/**
 * Checks whether the current local time falls in the Nightly Camp relevance window:
 * - Within 60 minutes before bedtime
 * - Up to 180 minutes after bedtime
 * - Evening hours from 20:00 (8:00 PM) onward
 */
export function isBedtimeWindow(
  currentTimeStr: string,
  bedtimeStr: string = "22:30"
): boolean {
  const currentMinutes = timeToMinutes(currentTimeStr);
  const bedtimeMinutes = timeToMinutes(bedtimeStr);

  // If after 8:00 PM (1200 minutes)
  if (currentMinutes >= 20 * 60) {
    return true;
  }

  // Pre-bedtime 60-minute window
  const diffBefore = bedtimeMinutes - currentMinutes;
  if (diffBefore >= 0 && diffBefore <= 60) {
    return true;
  }

  // Post-bedtime 180-minute window (including midnight rollover)
  let diffAfter = currentMinutes - bedtimeMinutes;
  if (diffAfter < 0) {
    diffAfter += 24 * 60; // Rollover midnight
  }
  if (diffAfter >= 0 && diffAfter <= 180) {
    return true;
  }

  return false;
}

/**
 * Calculates summary metrics for tomorrow's planned quests.
 * These are strictly expected projections; planning does not award rewards.
 */
export function calculateTomorrowSummary(
  quests: Quest[],
  difficulty: NightlyPlanDifficulty = "normal"
): TomorrowSummary {
  const questCount = quests.length;
  const estimatedMinutes = quests.reduce(
    (sum, q) => sum + (q.estimated_duration || 30),
    0
  );
  const expectedXp = quests.reduce((sum, q) => sum + (q.xp_reward || 0), 0);
  const expectedGold = quests.reduce((sum, q) => sum + (q.gold_reward || 0), 0);

  const categories = Array.from(new Set(quests.map((q) => q.category)));

  return {
    questCount,
    estimatedMinutes,
    expectedXp,
    expectedGold,
    categories,
    difficulty,
  };
}

/**
 * Generates an encouraging, non-shaming ARIA campfire reflection message.
 */
export function generateCampAriaMessage(params: {
  completedCount: number;
  unfinishedCount: number;
  currentStreak: number;
  difficulty: NightlyPlanDifficulty;
}): CampAriaMessage {
  const { completedCount, unfinishedCount, currentStreak, difficulty } = params;

  if (completedCount === 0 && unfinishedCount === 0) {
    return {
      title: "The Quiet Camp",
      message:
        "The stars are tranquil above our camp tonight, Adventurer. Tomorrow is an unwritten parchment. Carve out a few trials to forge your path.",
    };
  }

  if (completedCount > 0 && unfinishedCount === 0) {
    return {
      title: "Flawless Day Conquered",
      message: `Every single trial on today's board was conquered! Your ${currentStreak}-day momentum flame burns bright. Rest deeply tonight—your attributes have grown.`,
    };
  }

  if (completedCount > 0 && unfinishedCount > 0) {
    return {
      title: "Victories Forged by Fire",
      message: `You claimed ${completedCount} victory${
        completedCount === 1 ? "" : "s"
      } today. Not every trial needs to be finished before dusk; choose what deserves another attempt tomorrow, then let your stamina recover.`,
    };
  }

  if (completedCount === 0 && unfinishedCount > 0) {
    return {
      title: "A Night of Renewal",
      message:
        "Some days the path is rocky, Adventurer. There is no shame in pausing at camp. Select one or two meaningful trials for tomorrow and begin with fresh energy.",
    };
  }

  return {
    title: "Twilight Reflections",
    message: `Night falls across the citadel. Tomorrow is prepared with ${difficulty} resolve. Rest well, hero.`,
  };
}
