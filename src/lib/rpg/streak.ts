import { StreakResult } from "./types";

/**
 * Returns the current calendar date formatted as YYYY-MM-DD in the specified timezone.
 * Falls back safely to UTC if the timezone identifier is invalid.
 */
export function getCalendarDateInTimezone(
  date: Date = new Date(),
  timeZone: string = "UTC"
): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(date); // en-CA outputs YYYY-MM-DD format
  } catch {
    // Fallback to UTC if timezone is malformed
    return date.toISOString().split("T")[0];
  }
}

/**
 * Computes difference in calendar days between two YYYY-MM-DD date strings.
 * Returns positive number if dateA is after dateB, negative if before, 0 if same day.
 */
export function getCalendarDayDifference(dateA: string, dateB: string): number {
  const [yearA, monthA, dayA] = dateA.split("-").map(Number);
  const [yearB, monthB, dayB] = dateB.split("-").map(Number);

  const utcDateA = Date.UTC(yearA, monthA - 1, dayA);
  const utcDateB = Date.UTC(yearB, monthB - 1, dayB);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((utcDateA - utcDateB) / msPerDay);
}

/**
 * Evaluates and calculates streak progression for a quest completion event.
 *
 * RULES:
 * 1. Multiple completions on the same calendar day keep the current streak intact.
 * 2. Completion on the immediate consecutive day (difference === 1) increments streak by 1.
 * 3. Completion after a missed day (difference > 1) resets current streak to 1 while preserving longest streak.
 * 4. First ever completion (no lastCompletedDate) sets current streak to 1.
 */
export function calculateStreakUpdate(
  previousCurrentStreak: number,
  previousLongestStreak: number,
  lastCompletedDate: string | null | undefined,
  currentTimezone: string = "UTC",
  currentDateOverride?: string
): StreakResult {
  const today = currentDateOverride || getCalendarDateInTimezone(new Date(), currentTimezone);
  const safeCurrentStreak = Math.max(0, Math.floor(previousCurrentStreak || 0));
  const safeLongestStreak = Math.max(0, Math.floor(previousLongestStreak || 0));

  // Case 1: First ever quest completion
  if (!lastCompletedDate) {
    const newStreak = 1;
    const newLongest = Math.max(safeLongestStreak, newStreak);
    return {
      previousStreak: safeCurrentStreak,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCompletedDate: today,
      isStreakExtended: true,
      isNewRecord: newStreak > safeLongestStreak,
    };
  }

  const dayDiff = getCalendarDayDifference(today, lastCompletedDate);

  // Case 2: Already completed a quest earlier today
  if (dayDiff === 0) {
    return {
      previousStreak: safeCurrentStreak,
      currentStreak: safeCurrentStreak,
      longestStreak: safeLongestStreak,
      lastCompletedDate: today,
      isStreakExtended: false,
      isNewRecord: false,
    };
  }

  // Case 3: Completed yesterday -> consecutive day victory!
  if (dayDiff === 1) {
    const newStreak = safeCurrentStreak + 1;
    const newLongest = Math.max(safeLongestStreak, newStreak);
    return {
      previousStreak: safeCurrentStreak,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCompletedDate: today,
      isStreakExtended: true,
      isNewRecord: newStreak > safeLongestStreak,
    };
  }

  // Case 4: Missed one or more days -> start fresh streak at 1, preserve historical longest
  const newStreak = 1;
  const newLongest = Math.max(safeLongestStreak, newStreak);
  return {
    previousStreak: safeCurrentStreak,
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastCompletedDate: today,
    isStreakExtended: true,
    isNewRecord: newStreak > safeLongestStreak,
  };
}
