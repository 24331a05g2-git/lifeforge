export type NotificationType =
  | "streak_alert"
  | "quest_reminder"
  | "progression"
  | "aria_guidance"
  | "system";

export type NotificationPriority = "low" | "normal" | "high";

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  action_label?: string | null;
  action_url?: string | null;
  read: boolean;
  priority: NotificationPriority;
  created_at: string;
  metadata?: Record<string, unknown> | null;
}

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  enabled: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string; // "HH:MM" e.g. "22:00"
  quiet_hours_end: string;   // "HH:MM" e.g. "07:00"
  max_daily_notifications: number; // e.g. 3
  streak_alerts: boolean;
  quest_reminders: boolean;
  aria_tips: boolean;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<NotificationPreferences, "user_id"> = {
  enabled: true,
  quiet_hours_enabled: true,
  quiet_hours_start: "22:00",
  quiet_hours_end: "07:00",
  max_daily_notifications: 3,
  streak_alerts: true,
  quest_reminders: true,
  aria_tips: true,
};
