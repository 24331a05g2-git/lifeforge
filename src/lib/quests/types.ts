export type QuestCategory =
  | "learning"
  | "fitness"
  | "productivity"
  | "personal"
  | "creative"
  | "social"
  | "other";

export type QuestPriority = "low" | "medium" | "high";

export type QuestDifficulty = "easy" | "normal" | "hard" | "epic";

export type QuestStatus = "pending" | "in_progress" | "completed" | "skipped";

export type QuestAttribute = "strength" | "intellect" | "focus" | "discipline" | "energy";

export type MiniGameType =
  | "knowledge_dungeon"
  | "training_arena"
  | "focus_mission"
  | "habit_garden";

export interface Quest {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: QuestCategory;
  priority: QuestPriority;
  difficulty: QuestDifficulty;
  scheduled_date: string;
  estimated_duration: number; // in minutes
  xp_reward: number;
  gold_reward: number;
  attribute: QuestAttribute;
  game_type: MiniGameType;
  status: QuestStatus;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestInput {
  title: string;
  description?: string;
  category: QuestCategory;
  priority?: QuestPriority;
  difficulty?: QuestDifficulty;
  scheduled_date?: string;
  estimated_duration?: number;
}

export interface UpdateQuestInput {
  id: string;
  title?: string;
  description?: string;
  category?: QuestCategory;
  priority?: QuestPriority;
  difficulty?: QuestDifficulty;
  scheduled_date?: string;
  estimated_duration?: number;
}

export type QuestFilterTab = "all" | "today" | "upcoming" | "completed" | "skipped";
