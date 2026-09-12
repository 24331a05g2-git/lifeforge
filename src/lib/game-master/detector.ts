import { GameMasterContext, GameMasterContextData } from "./types";

/**
 * Deterministically evaluates the player's current RPG context state
 * based on verified real-world signals.
 */
export function detectGameMasterContext(
  data: GameMasterContextData
): GameMasterContext {
  const {
    localHour,
    questsToday,
    completedToday,
    remainingQuests,
    currentStreak,
  } = data;

  // 1. Board is completely empty for today
  if (questsToday === 0) {
    return "no_quests";
  }

  // 2. Streak at risk: late in the day (>= 17:00), active streak exists, but 0 completed today
  if (currentStreak > 0 && completedToday === 0 && localHour >= 17) {
    return "streak_at_risk";
  }

  // 3. Evening Review: late evening (>= 18:00), and all quests conquered or solid progress
  if (localHour >= 18 && (remainingQuests === 0 || completedToday >= 2)) {
    return "evening_review";
  }

  // 4. Good progress: 2+ completed or >= 50% completed today
  if (completedToday >= 2 || (questsToday > 0 && completedToday / questsToday >= 0.5)) {
    return "good_progress";
  }

  // 5. Quest completed earlier today, with additional trials awaiting
  if (completedToday >= 1 && remainingQuests > 0) {
    return "quest_completed";
  }

  // 6. Morning: 05:00 - 11:59 with 0 completed yet
  if (localHour >= 5 && localHour < 12 && completedToday === 0) {
    return "morning";
  }

  // 7. Midday progress: 12:00 - 16:59 with trials waiting
  if (localHour >= 12 && localHour < 17 && remainingQuests > 0) {
    return "midday_progress";
  }

  // 8. Low progress: late afternoon (>= 15:00) with 0 completed
  if (localHour >= 15 && completedToday === 0 && questsToday > 0) {
    return "low_progress";
  }

  // 9. Upcoming quest awaiting action
  if (remainingQuests > 0) {
    return "upcoming_quest";
  }

  // 10. Default fallback state
  return "inactive";
}
