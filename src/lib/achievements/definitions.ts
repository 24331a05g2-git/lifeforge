import { AchievementDefinition, AchievementKey } from "./types";

/**
 * 8 Authoritative Milestone Achievements
 * Evaluated strictly against verified PostgreSQL activity.
 */
export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    key: "first_quest",
    title: "First Quest",
    description: "Conquer your very first trial in the world.",
    iconName: "Sword",
    requirementText: "Complete 1 quest",
    targetValue: 1,
  },
  {
    key: "quest_hunter",
    title: "Quest Hunter",
    description: "Ten trials conquered. Your blade grows sharper with each victory.",
    iconName: "Target",
    requirementText: "Complete 10 quests",
    targetValue: 10,
  },
  {
    key: "unbreakable",
    title: "Unbreakable",
    description: "A 7-day unbroken chain of discipline and relentless showing up.",
    iconName: "Flame",
    requirementText: "Reach a 7-day streak",
    targetValue: 7,
  },
  {
    key: "forge_master",
    title: "Forge Master",
    description: "Reach Level 5 and transcend initiate status into apprentice mastery.",
    iconName: "Shield",
    requirementText: "Reach Level 5",
    targetValue: 5,
  },
  {
    key: "level_ascended",
    title: "Level Ascended",
    description: "Reach Level 10 and step into the echelon of true adept adventurers.",
    iconName: "Sparkles",
    requirementText: "Reach Level 10",
    targetValue: 10,
  },
  {
    key: "night_owl",
    title: "Night Owl",
    description: "Reflect by the evening fire and forge tomorrow's battle plan.",
    iconName: "Moon",
    requirementText: "Complete 1 Nightly Camp plan",
    targetValue: 1,
  },
  {
    key: "adventurer",
    title: "Adventurer",
    description: "Demonstrate versatility by conquering trials across 3 distinct disciplines.",
    iconName: "Compass",
    requirementText: "Complete quests across 3 distinct categories",
    targetValue: 3,
  },
  {
    key: "boss_slayer",
    title: "Boss Slayer",
    description: "Bring down a major real-life milestone boss through sustained questing.",
    iconName: "Trophy",
    requirementText: "Vanquish 1 major goal boss",
    targetValue: 1,
  },
] as const;

export function getAchievementDefinition(key: AchievementKey): AchievementDefinition | undefined {
  return ACHIEVEMENTS.find((a) => a.key === key);
}
