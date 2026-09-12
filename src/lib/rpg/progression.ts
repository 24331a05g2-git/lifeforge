import { LevelProgress, LevelTransitionResult } from "./types";

/**
 * LIFEFORGE RPG Non-Linear Leveling Formula
 * =========================================
 *
 * EXACT SEMANTICS:
 * 1. `getXpRequiredForLevel(L)`:
 *    Represents the exact XP required to advance from Level L to Level L+1.
 *    Formula: floor(100 * (L ^ 1.5))
 *
 *    - Level 1 -> Level 2: floor(100 * 1^1.5)  = 100 XP
 *    - Level 2 -> Level 3: floor(100 * 2^1.5)  = 282 XP
 *    - Level 3 -> Level 4: floor(100 * 3^1.5)  = 519 XP
 *    - Level 4 -> Level 5: floor(100 * 4^1.5)  = 800 XP
 *    - Level 5 -> Level 6: floor(100 * 5^1.5)  = 1118 XP
 *    - Level 6 -> Level 7: floor(100 * 6^1.5)  = 1469 XP
 *    - Level 7 -> Level 8: floor(100 * 7^1.5)  = 1852 XP
 *    - Level 8 -> Level 9: floor(100 * 8^1.5)  = 2262 XP
 *    - Level 9 -> Level 10: floor(100 * 9^1.5) = 2700 XP
 *    - Level 10 -> Level 11: floor(100 * 10^1.5) = 3162 XP
 *
 * 2. `getCumulativeXpForLevel(L)`:
 *    Represents the cumulative total XP required from character creation (Level 1, 0 XP)
 *    to reach Level L:
 *    - Level 1: 0 total XP
 *    - Level 2: 100 total XP (0 + 100)
 *    - Level 3: 382 total XP (100 + 282)
 *    - Level 4: 901 total XP (382 + 519)
 *    - Level 5: 1701 total XP (901 + 800)
 *    - Level 6: 2819 total XP (1701 + 1118)
 *
 * 3. TOTAL CUMULATIVE XP MODEL:
 *    `profile.xp` stores the total cumulative XP the player has ever earned.
 *    Level is derived deterministically from total cumulative XP.
 *    This guarantees that XP overflow carries across levels without any data loss.
 */

/**
 * Calculates XP required to advance from Level `level` to Level `level + 1`.
 */
export function getXpRequiredForLevel(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.floor(100 * Math.pow(safeLevel, 1.5));
}

/**
 * Calculates cumulative total XP required to reach Level `targetLevel` from Level 1.
 * Level 1 requires 0 total XP.
 */
export function getCumulativeXpForLevel(targetLevel: number): number {
  const safeLevel = Math.max(1, Math.floor(targetLevel));
  if (safeLevel === 1) return 0;

  let cumulative = 0;
  for (let lvl = 1; lvl < safeLevel; lvl++) {
    cumulative += getXpRequiredForLevel(lvl);
  }
  return cumulative;
}

/**
 * Derives the player's Level from their total cumulative XP.
 * Returns an integer >= 1.
 */
export function getLevelFromTotalXp(totalXp: number): number {
  const safeXp = Math.max(0, Math.floor(totalXp));

  let level = 1;
  let cumulative = 0;

  while (true) {
    const xpNeededForNext = getXpRequiredForLevel(level);
    if (cumulative + xpNeededForNext > safeXp) {
      break;
    }
    cumulative += xpNeededForNext;
    level++;
  }

  return level;
}

/**
 * Calculates detailed progression metrics for a given total cumulative XP:
 * - Current level
 * - Current level XP threshold (cumulative XP at start of level)
 * - Next level XP threshold (cumulative XP to reach next level)
 * - XP earned into current level
 * - XP required to cross from current to next level
 * - XP remaining to next level
 * - Progress percentage (0 - 100)
 */
export function getProgressWithinLevel(totalXp: number): LevelProgress {
  const safeXp = Math.max(0, Math.floor(totalXp));
  const currentLevel = getLevelFromTotalXp(safeXp);
  const currentLevelThresholdXp = getCumulativeXpForLevel(currentLevel);
  const xpRequiredForNextLevel = getXpRequiredForLevel(currentLevel);
  const nextLevelThresholdXp = currentLevelThresholdXp + xpRequiredForNextLevel;

  const xpIntoCurrentLevel = safeXp - currentLevelThresholdXp;
  const xpRemaining = Math.max(0, xpRequiredForNextLevel - xpIntoCurrentLevel);
  const progressPercentage = Math.min(
    100,
    Math.max(0, Math.round((xpIntoCurrentLevel / xpRequiredForNextLevel) * 100))
  );

  return {
    currentLevel,
    currentLevelThresholdXp,
    nextLevelThresholdXp,
    xpIntoCurrentLevel,
    xpRequiredForNextLevel,
    xpRemaining,
    progressPercentage,
    totalCumulativeXp: safeXp,
  };
}

/**
 * Calculates the exact transition from beforeXp to (beforeXp + xpGained).
 * Accurately detects:
 * - Leveled up status (boolean)
 * - Number of levels gained (e.g., 0, 1, 2+)
 * - Pre-reward and post-reward progression states
 */
export function calculateLevelTransition(
  beforeXp: number,
  xpGained: number
): LevelTransitionResult {
  const safeBeforeXp = Math.max(0, Math.floor(beforeXp));
  const safeXpGained = Math.max(0, Math.floor(xpGained));
  const newTotalXp = safeBeforeXp + safeXpGained;

  const progressBefore = getProgressWithinLevel(safeBeforeXp);
  const progressAfter = getProgressWithinLevel(newTotalXp);

  const previousLevel = progressBefore.currentLevel;
  const newLevel = progressAfter.currentLevel;
  const leveledUp = newLevel > previousLevel;
  const levelsGained = Math.max(0, newLevel - previousLevel);

  return {
    previousLevel,
    newLevel,
    leveledUp,
    levelsGained,
    previousTotalXp: safeBeforeXp,
    newTotalXp,
    xpGained: safeXpGained,
    progressBefore,
    progressAfter,
  };
}
