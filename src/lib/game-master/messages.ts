import { GameMasterContext, GameMasterContextData, GameMasterMessage } from "./types";

interface MessageTemplate {
  title: string;
  template: (data: GameMasterContextData) => string;
  actionLabel?: string;
  actionHref?: string;
  priority: "low" | "normal" | "high";
}

export const GAME_MASTER_MESSAGES: Record<GameMasterContext, MessageTemplate[]> = {
  no_quests: [
    {
      title: "The Board Awaits",
      template: () =>
        "The realm is quiet, Adventurer. Your Quest Board is clear for today. Post your first trial to begin forging your legend.",
      actionLabel: "Post a Quest",
      actionHref: "/quests",
      priority: "normal",
    },
    {
      title: "Unwritten Chapters",
      template: () =>
        "Every grand saga begins with a single declared purpose. Take a moment to set your quest objectives for today.",
      actionLabel: "Forge Quest",
      actionHref: "/quests",
      priority: "normal",
    },
  ],

  streak_at_risk: [
    {
      title: "Momentum in the Balance",
      template: (d) =>
        `Your ${d.currentStreak}-day momentum flame still flickers. Even a brisk 5-minute trial or mini-game will protect your streak before midnight.`,
      actionLabel: "Defend Streak",
      actionHref: "/dashboard#today-quests",
      priority: "high",
    },
    {
      title: "Keep the Flame Alive",
      template: (d) =>
        `Evening approaches, hero. You have an active ${d.currentStreak}-day streak. One completed quest keeps your glory intact!`,
      actionLabel: "Conquer a Quest",
      actionHref: "/dashboard#today-quests",
      priority: "high",
    },
  ],

  evening_review: [
    {
      title: "Twilight in the Citadel",
      template: (d) =>
        d.remainingQuests === 0
          ? `All ${d.completedToday} trials conquered today! The realm stands peaceful tonight. Rest well, hero—your strength has grown.`
          : `The sun dips below the horizon. You've forged ${d.completedToday} victories today. Reflect upon your gains and recover your stamina.`,
      actionLabel: "Inspect Character",
      actionHref: "/character",
      priority: "low",
    },
    {
      title: "A Day Well Forged",
      template: (d) =>
        `Night descends upon the forge. You claimed ${d.completedToday} victories and earned valuable XP. Stand tall in your progress.`,
      actionLabel: "Character Sheet",
      actionHref: "/character",
      priority: "low",
    },
  ],

  good_progress: [
    {
      title: "Unstoppable Momentum",
      template: (d) =>
        `Outstanding discipline! You've already triumphed over ${d.completedToday} quests today. The attributes of a master are forging within you.`,
      actionLabel: "Continue Journey",
      actionHref: "/dashboard#today-quests",
      priority: "normal",
    },
    {
      title: "The Surge of Mastery",
      template: (d) =>
        `With ${d.completedToday} trials completed, your rhythm is undeniable. Carry this focus into your remaining objectives.`,
      actionLabel: "View Objectives",
      actionHref: "/dashboard#today-quests",
      priority: "normal",
    },
  ],

  quest_completed: [
    {
      title: "Victory in the Archives",
      template: (d) =>
        `Another victory inscribed into your record! ${d.remainingQuests} quest${d.remainingQuests === 1 ? "" : "s"} still await in the arena. Ride the wave of accomplishment.`,
      actionLabel: "Next Trial",
      actionHref: "/dashboard#today-quests",
      priority: "normal",
    },
  ],

  morning: [
    {
      title: "Dawn of Opportunity",
      template: (d) =>
        `The sun rises on LIFEFORGE, Adventurer. You have ${d.questsToday} trial${d.questsToday === 1 ? "" : "s"} lined up on the board. Choose your opening move with clear intent.`,
      actionLabel: "Embark on Quest",
      actionHref: "/dashboard#today-quests",
      priority: "normal",
    },
    {
      title: "A Fresh Horizon",
      template: () =>
        "The morning air is sharp with possibility. Fuel your focus and prepare to advance your attributes today.",
      actionLabel: "Inspect Board",
      actionHref: "/dashboard#today-quests",
      priority: "normal",
    },
  ],

  midday_progress: [
    {
      title: "The Midday Forge",
      template: (d) =>
        `The day is at its apex. With ${d.remainingQuests} quest${d.remainingQuests === 1 ? "" : "s"} remaining, channel your energy into the next most meaningful trial.`,
      actionLabel: "Enter Arena",
      actionHref: "/dashboard#today-quests",
      priority: "normal",
    },
  ],

  low_progress: [
    {
      title: "Reset and Refocus",
      template: () =>
        "The afternoon is young, and momentum is always one small decision away. Pick the quickest or lightest quest to break the inertia.",
      actionLabel: "Start Small",
      actionHref: "/dashboard#today-quests",
      priority: "normal",
    },
    {
      title: "Every Journey Starts with One Step",
      template: () =>
        "No pressure, Adventurer. You don't need to finish everything at once—just launch one activity session to regain your flow.",
      actionLabel: "Choose a Quest",
      actionHref: "/dashboard#today-quests",
      priority: "normal",
    },
  ],

  upcoming_quest: [
    {
      title: "Challenges Ahead",
      template: (d) =>
        `${d.remainingQuests} quest${d.remainingQuests === 1 ? "" : "s"} await your blade. Keep your eyes on the goal and conquer them step by step.`,
      actionLabel: "Play Quest",
      actionHref: "/dashboard#today-quests",
      priority: "normal",
    },
  ],

  inactive: [
    {
      title: "Citadel Standby",
      template: () =>
        "I am standing by in the citadel, Adventurer. Whenever you're ready to test your mettle, your quests await.",
      actionLabel: "View Quests",
      actionHref: "/quests",
      priority: "low",
    },
  ],
};

/**
 * Formats a message based on the detected context and context data.
 */
export function buildMessageForContext(
  context: GameMasterContext,
  data: GameMasterContextData
): GameMasterMessage {
  const templates = GAME_MASTER_MESSAGES[context] || GAME_MASTER_MESSAGES.inactive;
  // Deterministic selection based on localHour / completedToday to feel fresh yet stable
  const index = (data.localHour + data.completedToday) % templates.length;
  const chosen = templates[index];

  return {
    id: `${context}-${data.localHour}-${data.completedToday}`,
    context,
    title: chosen.title,
    message: chosen.template(data),
    actionLabel: chosen.actionLabel,
    actionHref: chosen.actionHref,
    priority: chosen.priority,
  };
}
