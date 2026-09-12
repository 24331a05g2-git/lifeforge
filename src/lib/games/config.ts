import { MiniGameType } from "@/lib/quests/types";

export interface GameMetadata {
  id: MiniGameType;
  title: string;
  tagline: string;
  callToAction: string;
  themeColor: string;
  badgeClass: string;
  icon: string;
  timerPresets: number[]; // in minutes
  completionTitle: string;
  reflectionLabel: string;
  confirmationText: string;
}

export const GAME_CONFIG: Record<MiniGameType, GameMetadata> = {
  knowledge_dungeon: {
    id: "knowledge_dungeon",
    title: "Knowledge Dungeon",
    tagline: "Knowledge is XP for your mind.",
    callToAction: "Your Intellect quest awaits.",
    themeColor: "text-sky-400 border-sky-500/40 bg-sky-500/10",
    badgeClass: "border-sky-500/40 bg-sky-500/15 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]",
    icon: "📖",
    timerPresets: [15, 25, 45, 60],
    completionTitle: "Lesson Survived",
    reflectionLabel: "What knowledge did you uncover during this delve?",
    confirmationText: "I completed this real-world learning session.",
  },
  training_arena: {
    id: "training_arena",
    title: "Training Arena",
    tagline: "Forge your physical vessel in the fires of effort.",
    callToAction: "Your Strength quest awaits.",
    themeColor: "text-amber-400 border-amber-500/40 bg-amber-500/10",
    badgeClass: "border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]",
    icon: "🏟️",
    timerPresets: [20, 30, 45, 60],
    completionTitle: "Training Complete",
    reflectionLabel: "Workout notes, sets, reps, or athletic observations:",
    confirmationText: "I completed this real-world physical training session.",
  },
  focus_mission: {
    id: "focus_mission",
    title: "Focus Mission",
    tagline: "Build something today that didn't exist yesterday.",
    callToAction: "Your Focus quest awaits.",
    themeColor: "text-violet-400 border-violet-500/40 bg-violet-500/10",
    badgeClass: "border-violet-500/40 bg-violet-500/15 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.25)]",
    icon: "🚀",
    timerPresets: [25, 45, 60, 90],
    completionTitle: "Focus Mission Complete",
    reflectionLabel: "What did you accomplish or ship during this sprint?",
    confirmationText: "I completed this distraction-free deep work session.",
  },
  habit_garden: {
    id: "habit_garden",
    title: "Habit Garden",
    tagline: "Small actions grow powerful habits.",
    callToAction: "Your Discipline quest awaits.",
    themeColor: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
    badgeClass: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]",
    icon: "🌱",
    timerPresets: [5, 10, 15, 20],
    completionTitle: "Habit Nurtured",
    reflectionLabel: "Mindful reflection, gratitude, or ritual notes:",
    confirmationText: "I performed this habit in the real world.",
  },
};
