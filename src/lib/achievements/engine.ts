import { ACHIEVEMENTS } from "./definitions";
import {
  AchievementKey,
  AchievementProgressItem,
  PlayerProgressionSignals,
  UserAchievement,
} from "./types";

/**
 * Pure evaluation function mapping player database signals to current achievement progress.
 */
export function evaluateAchievementProgress(
  signals: PlayerProgressionSignals,
  unlockedRecords: UserAchievement[]
): AchievementProgressItem[] {
  const unlockedMap = new Map<string, string>();
  for (const rec of unlockedRecords) {
    unlockedMap.set(rec.achievement_key, rec.unlocked_at);
  }

  return ACHIEVEMENTS.map((def) => {
    const isUnlocked = unlockedMap.has(def.key);
    const unlockedAt = unlockedMap.get(def.key) || null;

    let currentValue = 0;
    switch (def.key) {
      case "first_quest":
        currentValue = Math.min(def.targetValue, signals.completedQuestsCount);
        break;
      case "quest_hunter":
        currentValue = Math.min(def.targetValue, signals.completedQuestsCount);
        break;
      case "unbreakable":
        currentValue = Math.min(def.targetValue, signals.currentStreak);
        break;
      case "forge_master":
        currentValue = Math.min(def.targetValue, signals.level);
        break;
      case "level_ascended":
        currentValue = Math.min(def.targetValue, signals.level);
        break;
      case "night_owl":
        currentValue = Math.min(def.targetValue, signals.completedNightlyPlansCount);
        break;
      case "adventurer":
        currentValue = Math.min(def.targetValue, signals.uniqueCategoriesCount);
        break;
      case "boss_slayer":
        currentValue = Math.min(def.targetValue, signals.defeatedBossesCount);
        break;
    }

    const progressPercent = isUnlocked
      ? 100
      : Math.min(100, Math.floor((currentValue / def.targetValue) * 100));

    return {
      ...def,
      isUnlocked,
      unlockedAt,
      currentValue: isUnlocked ? def.targetValue : currentValue,
      progressPercent,
    };
  });
}

/**
 * Pure function to identify which achievements are currently qualified for unlock
 * but have NOT yet been granted to the player.
 */
export function getEligibleUnlocks(
  signals: PlayerProgressionSignals,
  alreadyUnlockedKeys: Set<string>
): AchievementKey[] {
  const newlyEligible: AchievementKey[] = [];

  for (const def of ACHIEVEMENTS) {
    if (alreadyUnlockedKeys.has(def.key)) continue;

    let eligible = false;
    switch (def.key) {
      case "first_quest":
        eligible = signals.completedQuestsCount >= 1;
        break;
      case "quest_hunter":
        eligible = signals.completedQuestsCount >= 10;
        break;
      case "unbreakable":
        eligible = signals.currentStreak >= 7;
        break;
      case "forge_master":
        eligible = signals.level >= 5;
        break;
      case "level_ascended":
        eligible = signals.level >= 10;
        break;
      case "night_owl":
        eligible = signals.completedNightlyPlansCount >= 1;
        break;
      case "adventurer":
        eligible = signals.uniqueCategoriesCount >= 3;
        break;
      case "boss_slayer":
        eligible = signals.defeatedBossesCount >= 1;
        break;
    }

    if (eligible) {
      newlyEligible.push(def.key);
    }
  }

  return newlyEligible;
}
