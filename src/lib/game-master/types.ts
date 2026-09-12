export type GameMasterContext =
  | "no_quests"
  | "morning"
  | "upcoming_quest"
  | "midday_progress"
  | "good_progress"
  | "quest_completed"
  | "streak_at_risk"
  | "low_progress"
  | "evening_review"
  | "inactive";

export type GameMasterPriority = "low" | "normal" | "high";

export interface GameMasterContextData {
  timeOfDay: "morning" | "midday" | "evening" | "night";
  localHour: number; // 0 - 23 in user's timezone
  questsToday: number;
  completedToday: number;
  remainingQuests: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  xp: number;
  goals: string[];
  strongestAttributes: string[];
  recentActivity: {
    completedQuestCount: number;
    lastCompletionAt?: string;
  };
  timezone: string;
}

export interface GameMasterMessage {
  id: string;
  context: GameMasterContext;
  title: string;
  message: string;
  actionLabel?: string;
  actionHref?: string;
  priority: GameMasterPriority;
}

/**
 * AI-ready abstraction:
 * Allows dropping in a future LLM provider without changing surrounding logic.
 */
export interface GameMasterProvider {
  generateMessage(context: GameMasterContextData): Promise<GameMasterMessage>;
}
