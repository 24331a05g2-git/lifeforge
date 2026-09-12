import { Quest } from "@/lib/quests/types";
import { AdaptiveRecommendation } from "@/lib/adaptive/types";

export type NightlyPlanDifficulty = "easy" | "normal" | "challenge";
export type NightlyPlanStatus = "draft" | "saved" | "completed";

export interface NightlyPlanRecord {
  id?: string;
  user_id: string;
  plan_date: string;
  target_date: string;
  difficulty: NightlyPlanDifficulty;
  status: NightlyPlanStatus;
  reflection?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TomorrowSummary {
  questCount: number;
  estimatedMinutes: number;
  expectedXp: number;
  expectedGold: number;
  categories: string[];
  difficulty: NightlyPlanDifficulty;
}

export interface TodayReviewData {
  totalQuestsToday: number;
  completedQuestsCount: number;
  remainingQuestsCount: number;
  xpEarnedToday: number;
  goldEarnedToday: number;
  activeMinutesToday: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  completedCategories: string[];
}

export interface CampProfileInfo {
  character_name: string;
  archetype: string;
  level: number;
  xp: number;
  gold: number;
  current_streak: number;
  longest_streak: number;
  bedtime: string;
  timezone: string;
}

export interface CampAriaMessage {
  title: string;
  message: string;
}

export interface NightlyCampData {
  profile: CampProfileInfo;
  todayDateStr: string;
  tomorrowDateStr: string;
  todayStats: TodayReviewData;
  todayCompletedQuests: Quest[];
  todayUnfinishedQuests: Quest[];
  tomorrowQuests: Quest[];
  tomorrowSummary: TomorrowSummary;
  nightlyPlan: NightlyPlanRecord | null;
  isBedtimeWindow: boolean;
  ariaCampMessage: CampAriaMessage;
  adaptiveRecommendation: AdaptiveRecommendation;
}

export interface SaveNightlyPlanInput {
  plan_date: string;
  target_date: string;
  difficulty: NightlyPlanDifficulty;
  reflection?: string;
}

export const DIFFICULTY_DESCRIPTIONS: Record<
  NightlyPlanDifficulty,
  { label: string; subtitle: string; badgeColor: string; bgAccent: string }
> = {
  easy: {
    label: "EASY",
    subtitle: "A lighter adventure. Focus on consistency and light steps.",
    badgeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    bgAccent: "border-emerald-500/30 bg-emerald-950/20",
  },
  normal: {
    label: "NORMAL",
    subtitle: "A balanced day of progress and purposeful growth.",
    badgeColor: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    bgAccent: "border-amber-500/30 bg-amber-950/20",
  },
  challenge: {
    label: "CHALLENGE",
    subtitle: "Push your limits. Take on ambitious quests and test your mettle.",
    badgeColor: "text-orange-400 border-orange-500/40 bg-orange-500/10",
    bgAccent: "border-orange-500/30 bg-orange-950/20",
  },
};
