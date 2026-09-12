"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  NotificationItem,
  NotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/lib/notifications/types";

export interface NotificationActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Retrieves the authenticated user's notifications.
 */
export async function getNotificationsAction(
  limit: number = 30
): Promise<NotificationActionResult<{ notifications: NotificationItem[]; unreadCount: number }>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return { success: false, error: error.message };
    }

    const unreadCount = (notifications || []).filter((n) => !n.read).length;

    return {
      success: true,
      data: {
        notifications: (notifications as NotificationItem[]) || [],
        unreadCount,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch notifications.";
    return { success: false, error: message };
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationReadAction(
  notificationId: string
): Promise<NotificationActionResult<boolean>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to mark notification as read.";
    return { success: false, error: message };
  }
}

/**
 * Marks all notifications for the authenticated user as read.
 */
export async function markAllNotificationsReadAction(): Promise<NotificationActionResult<boolean>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard");
    return { success: true, data: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to mark all notifications read.";
    return { success: false, error: message };
  }
}

/**
 * Retrieves the user's notification preferences, creating defaults if not yet present.
 */
export async function getNotificationPreferencesAction(): Promise<
  NotificationActionResult<NotificationPreferences>
> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required." };
    }

    const { data: preferences, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      return { success: false, error: error.message };
    }

    if (preferences) {
      return { success: true, data: preferences as NotificationPreferences };
    }

    // Initialize default preferences
    const defaultRecord: Partial<NotificationPreferences> = {
      user_id: user.id,
      ...DEFAULT_NOTIFICATION_PREFERENCES,
    };

    const { data: newPreferences, error: insertError } = await supabase
      .from("notification_preferences")
      .insert(defaultRecord)
      .select()
      .single();

    if (insertError) {
      return {
        success: true,
        data: {
          user_id: user.id,
          ...DEFAULT_NOTIFICATION_PREFERENCES,
        },
      };
    }

    return { success: true, data: newPreferences as NotificationPreferences };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to get preferences.";
    return { success: false, error: message };
  }
}

/**
 * Updates the user's notification preferences.
 */
export async function updateNotificationPreferencesAction(
  updates: Partial<NotificationPreferences>
): Promise<NotificationActionResult<NotificationPreferences>> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Authentication required." };
    }

    // Sanitize updates
    const sanitized: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof updates.enabled === "boolean") sanitized.enabled = updates.enabled;
    if (typeof updates.quiet_hours_enabled === "boolean")
      sanitized.quiet_hours_enabled = updates.quiet_hours_enabled;
    if (typeof updates.quiet_hours_start === "string")
      sanitized.quiet_hours_start = updates.quiet_hours_start;
    if (typeof updates.quiet_hours_end === "string")
      sanitized.quiet_hours_end = updates.quiet_hours_end;
    if (typeof updates.max_daily_notifications === "number") {
      sanitized.max_daily_notifications = Math.min(Math.max(1, updates.max_daily_notifications), 10);
    }
    if (typeof updates.streak_alerts === "boolean")
      sanitized.streak_alerts = updates.streak_alerts;
    if (typeof updates.quest_reminders === "boolean")
      sanitized.quest_reminders = updates.quest_reminders;
    if (typeof updates.aria_tips === "boolean")
      sanitized.aria_tips = updates.aria_tips;

    const { data: updated, error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        ...sanitized,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: updated as NotificationPreferences };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update preferences.";
    return { success: false, error: message };
  }
}
