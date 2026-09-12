import { QuestAttribute, QuestCategory, QuestDifficulty } from "@/lib/quests/types";

export const MAX_ATTRIBUTE_VALUE = 100;

export interface QuestRewardConfig {
  xp: number;
  gold: number;
  attributeGain: number;
}

/**
 * Deterministic Server-Authoritative Reward Matrix.
 * Never trust client-supplied reward values.
 */
export const DIFFICULTY_REWARD_TABLE: Record<QuestDifficulty, QuestRewardConfig> = {
  easy: {
    xp: 20,
    gold: 8,
    attributeGain: 1,
  },
  normal: {
    xp: 40,
    gold: 18,
    attributeGain: 1,
  },
  hard: {
    xp: 80,
    gold: 40,
    attributeGain: 2,
  },
  epic: {
    xp: 180,
    gold: 100,
    attributeGain: 3,
  },
};

/**
 * Category to Primary RPG Attribute Mapping.
 */
export const CATEGORY_ATTRIBUTE_MAP: Record<QuestCategory, QuestAttribute> = {
  learning: "intellect",
  fitness: "strength",
  productivity: "focus",
  personal: "discipline",
  creative: "intellect",
  social: "energy",
  other: "discipline",
};

/**
 * Calculates XP and Gold rewards strictly from server-side quest difficulty.
 */
export function calculateQuestReward(difficulty: QuestDifficulty): {
  xp: number;
  gold: number;
  attributeGain: number;
} {
  const config = DIFFICULTY_REWARD_TABLE[difficulty] || DIFFICULTY_REWARD_TABLE.normal;
  return {
    xp: config.xp,
    gold: config.gold,
    attributeGain: config.attributeGain,
  };
}

/**
 * Resolves the primary attribute for a given quest category.
 */
export function resolveQuestAttribute(category: QuestCategory): QuestAttribute {
  return CATEGORY_ATTRIBUTE_MAP[category] || "discipline";
}

/**
 * Calculates the new attribute value with modest deterministic increase, capped at 100.
 */
export function calculateAttributeGain(
  difficulty: QuestDifficulty,
  currentValue: number
): {
  gain: number;
  newValue: number;
  isCapped: boolean;
} {
  const config = DIFFICULTY_REWARD_TABLE[difficulty] || DIFFICULTY_REWARD_TABLE.normal;
  const safeCurrent = Math.max(1, Math.min(MAX_ATTRIBUTE_VALUE, Math.floor(currentValue)));
  const uncappedNew = safeCurrent + config.attributeGain;
  const newValue = Math.min(MAX_ATTRIBUTE_VALUE, uncappedNew);
  const actualGain = newValue - safeCurrent;

  return {
    gain: actualGain,
    newValue,
    isCapped: newValue >= MAX_ATTRIBUTE_VALUE,
  };
}
