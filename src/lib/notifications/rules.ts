import { NotificationPreferences, NotificationType } from "./types";

/**
 * Parses "HH:MM" into minutes from midnight (0..1439).
 */
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return 0;
  return h * 60 + m;
}

/**
 * Checks if a given "HH:MM" time falls within quiet hours.
 * Accurately supports overnight wrapping (e.g. 22:00 to 07:00).
 */
export function isWithinQuietHours(
  currentTimeStr: string,
  startTimeStr: string,
  endTimeStr: string
): boolean {
  const current = timeToMinutes(currentTimeStr);
  const start = timeToMinutes(startTimeStr);
  const end = timeToMinutes(endTimeStr);

  if (start === end) {
    return false;
  }

  if (start < end) {
    // Standard daytime window, e.g. 13:00 to 15:00
    return current >= start && current < end;
  } else {
    // Overnight window, e.g. 22:00 to 07:00
    return current >= start || current < end;
  }
}

/**
 * Formats the current time in the user's timezone as "HH:MM".
 */
export function getCurrentTimeInTimezone(timezone: string = "UTC"): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    const h = String(d.getUTCHours()).padStart(2, "0");
    const m = String(d.getUTCMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }
}

/**
 * Returns the hour (0..23) for a date in the given timezone.
 */
export function getHourInTimezone(date: Date, timezone: string): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      hour: "2-digit",
      hour12: false,
    });
    const parsed = parseInt(formatter.format(date), 10);
    return isNaN(parsed) ? date.getUTCHours() : parsed;
  } catch {
    return date.getUTCHours();
  }
}

export interface NotificationEligibility {
  allowed: boolean;
  reason?:
    | "notifications_disabled"
    | "category_disabled"
    | "quiet_hours"
    | "daily_limit_reached"
    | "duplicate_today";
}

/**
 * Evaluates whether a notification can be delivered given user preferences,
 * time of day, daily caps, and duplicate rules.
 */
export function evaluateNotificationEligibility(params: {
  type: NotificationType;
  preferences: NotificationPreferences;
  currentTimeStr: string;
  todayNotificationCount: number;
  hasDuplicateToday: boolean;
}): NotificationEligibility {
  const {
    type,
    preferences,
    currentTimeStr,
    todayNotificationCount,
    hasDuplicateToday,
  } = params;

  // 1. Master enable toggle
  if (!preferences.enabled) {
    return { allowed: false, reason: "notifications_disabled" };
  }

  // 2. Category toggles
  if (type === "streak_alert" && !preferences.streak_alerts) {
    return { allowed: false, reason: "category_disabled" };
  }
  if (type === "quest_reminder" && !preferences.quest_reminders) {
    return { allowed: false, reason: "category_disabled" };
  }
  if (type === "aria_guidance" && !preferences.aria_tips) {
    return { allowed: false, reason: "category_disabled" };
  }

  // 3. Quiet hours check
  if (
    preferences.quiet_hours_enabled &&
    isWithinQuietHours(
      currentTimeStr,
      preferences.quiet_hours_start,
      preferences.quiet_hours_end
    )
  ) {
    return { allowed: false, reason: "quiet_hours" };
  }

  // 4. Daily cap check
  if (todayNotificationCount >= preferences.max_daily_notifications) {
    return { allowed: false, reason: "daily_limit_reached" };
  }

  // 5. Duplicate check
  if (hasDuplicateToday) {
    return { allowed: false, reason: "duplicate_today" };
  }

  return { allowed: true };
}
