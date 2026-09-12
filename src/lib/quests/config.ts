import {
  MiniGameType,
  QuestAttribute,
  QuestCategory,
  QuestDifficulty,
  QuestPriority,
  QuestStatus,
} from "./types";

/**
 * Centralized mapping from Quest Category to primary Character Attribute.
 */
export const CATEGORY_TO_ATTRIBUTE: Record<QuestCategory, QuestAttribute> = {
  learning: "intellect",
  fitness: "strength",
  productivity: "focus",
  personal: "discipline",
  creative: "intellect",
  social: "energy",
  other: "discipline",
};

/**
 * Centralized mapping from Quest Category to future Mini-Game Arena.
 */
export const CATEGORY_TO_GAME_TYPE: Record<QuestCategory, MiniGameType> = {
  learning: "knowledge_dungeon",
  fitness: "training_arena",
  productivity: "focus_mission",
  personal: "habit_garden",
  creative: "focus_mission",
  social: "habit_garden",
  other: "habit_garden",
};

/**
 * Centralized difficulty-based reward preview values.
 * Note: These are strictly preview metadata; actual reward minting occurs server-side in later phases.
 */
export const DIFFICULTY_REWARDS: Record<
  QuestDifficulty,
  { xp: number; gold: number; label: string; badgeColor: string }
> = {
  easy: {
    xp: 20,
    gold: 8,
    label: "Easy",
    badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  normal: {
    xp: 40,
    gold: 18,
    label: "Normal",
    badgeColor: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  hard: {
    xp: 80,
    gold: 40,
    label: "Hard",
    badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  },
  epic: {
    xp: 180,
    gold: 100,
    label: "Epic",
    badgeColor: "border-purple-500/40 bg-purple-500/15 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]",
  },
};

/**
 * Category Metadata: Icons, Titles, Descriptions.
 */
export const CATEGORY_META: Record<
  QuestCategory,
  { label: string; icon: string; description: string; color: string }
> = {
  learning: {
    label: "Learning",
    icon: "📜",
    description: "Studies, reading, coding, and skill mastery.",
    color: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
  fitness: {
    label: "Fitness",
    icon: "⚔️",
    description: "Workouts, runs, athletic training, and physical vigor.",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  productivity: {
    label: "Productivity",
    icon: "🎯",
    description: "Deep work sessions, project builds, and milestone conquest.",
    color: "text-violet-400 border-violet-500/30 bg-violet-500/10",
  },
  personal: {
    label: "Personal",
    icon: "🧘",
    description: "Meditation, journaling, sleep routines, and self-care.",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  creative: {
    label: "Creative",
    icon: "✨",
    description: "Writing, design, music, crafts, and invention.",
    color: "text-pink-400 border-pink-500/30 bg-pink-500/10",
  },
  social: {
    label: "Social",
    icon: "🤝",
    description: "Networking, mentoring, community, and team collaboration.",
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  },
  other: {
    label: "Other",
    icon: "🛡️",
    description: "Daily chores, organization, and general life upkeep.",
    color: "text-slate-400 border-slate-500/30 bg-slate-500/10",
  },
};

/**
 * Future Mini-Game Metadata.
 */
export const GAME_TYPE_META: Record<
  MiniGameType,
  { label: string; icon: string; category: string }
> = {
  knowledge_dungeon: {
    label: "Knowledge Dungeon",
    icon: "📖",
    category: "Learning Engine",
  },
  training_arena: {
    label: "Training Arena",
    icon: "🏟️",
    category: "Physical Combat Arena",
  },
  focus_mission: {
    label: "Focus Mission",
    icon: "🚀",
    category: "Deep Work Cockpit",
  },
  habit_garden: {
    label: "Habit Garden",
    icon: "🌱",
    category: "Consistency Flora",
  },
};

/**
 * Priority Metadata.
 */
export const PRIORITY_META: Record<
  QuestPriority,
  { label: string; dotColor: string }
> = {
  low: { label: "Low Priority", dotColor: "bg-slate-400" },
  medium: { label: "Medium Priority", dotColor: "bg-amber-400" },
  high: { label: "High Priority", dotColor: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]" },
};

/**
 * Validates quest state transitions according to the official state machine:
 * - Pending -> In Progress, Completed, Skipped
 * - In Progress -> Completed, Skipped, Pending
 * - Completed -> Terminal (cannot change)
 * - Skipped -> Terminal (cannot change)
 */
export function isValidStatusTransition(
  currentStatus: QuestStatus,
  nextStatus: QuestStatus
): boolean {
  if (currentStatus === nextStatus) return true;

  switch (currentStatus) {
    case "pending":
      return (
        nextStatus === "in_progress" ||
        nextStatus === "completed" ||
        nextStatus === "skipped"
      );
    case "in_progress":
      return (
        nextStatus === "completed" ||
        nextStatus === "skipped" ||
        nextStatus === "pending"
      );
    case "completed":
    case "skipped":
      return false; // Terminal states
    default:
      return false;
  }
}

/**
 * Resolves attribute, game type, and preview rewards for a given category and difficulty.
 */
export function resolveQuestMetadata(
  category: QuestCategory,
  difficulty: QuestDifficulty = "normal"
) {
  const attribute = CATEGORY_TO_ATTRIBUTE[category] || "discipline";
  const game_type = CATEGORY_TO_GAME_TYPE[category] || "habit_garden";
  const rewards = DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.normal;

  return {
    attribute,
    game_type,
    xp_reward: rewards.xp,
    gold_reward: rewards.gold,
  };
}
