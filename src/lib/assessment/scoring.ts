import {
  AssessmentResult,
  AttributeScore,
  AttributeType,
} from "./types";
import { QUESTIONS } from "./questions";
import { determineArchetype } from "./archetypes";

export const ATTRIBUTE_META: Record<
  AttributeType,
  { label: string; icon: string; description: string }
> = {
  strength: {
    label: "Strength",
    icon: "💪",
    description: "Physical power, bodily vitality, and athletic endurance.",
  },
  intellect: {
    label: "Intellect",
    icon: "🧠",
    description: "Analytical capacity, learning speed, and problem solving.",
  },
  focus: {
    label: "Focus",
    icon: "🎯",
    description: "Deep attention span, task immersion, and distraction resistance.",
  },
  discipline: {
    label: "Discipline",
    icon: "🔥",
    description: "Willpower, habit consistency, and resistance to short-term impulses.",
  },
  energy: {
    label: "Energy",
    icon: "⚡",
    description: "Daily stamina, physical vitality, recovery speed, and drive.",
  },
};

/**
 * Calculates the player's 5 core attributes, top strengths, growth areas,
 * and archetype from their answers to the 10 discovery questions.
 */
export function calculateAssessmentResult(
  answers: Record<string, string | string[]>,
  characterName: string = "Adventurer"
): AssessmentResult {
  // Baseline initial points for a Level 1 character
  const rawScores: Record<AttributeType, number> = {
    strength: 32,
    intellect: 32,
    focus: 32,
    discipline: 32,
    energy: 32,
  };

  const archetypeWeights: Record<string, number> = {};
  const selectedGoals: string[] = [];

  // Iterate over each question and aggregate scores
  for (const question of QUESTIONS) {
    const selected = answers[question.id];
    if (!selected) continue;

    const selectedIds = Array.isArray(selected) ? selected : [selected];

    for (const optId of selectedIds) {
      const option = question.options.find((o) => o.id === optId);
      if (!option) continue;

      // Track selected goal titles for question 10
      if (question.id === "q10_goals") {
        selectedGoals.push(option.text);
      }

      // Add stat modifiers
      if (option.statModifiers) {
        for (const [stat, points] of Object.entries(option.statModifiers)) {
          const attr = stat as AttributeType;
          if (rawScores[attr] !== undefined && typeof points === "number") {
            rawScores[attr] += points;
          }
        }
      }

      // Aggregate archetype weights
      if (option.archetypeWeight) {
        for (const [arch, weight] of Object.entries(option.archetypeWeight)) {
          archetypeWeights[arch] = (archetypeWeights[arch] || 0) + weight;
        }
      }
    }
  }

  // Normalize stats to 1-100 range with realistic Level 1 bounds (e.g., 40 - 88)
  const attributes: AttributeScore = {
    strength: Math.min(95, Math.max(15, Math.round(rawScores.strength))),
    intellect: Math.min(95, Math.max(15, Math.round(rawScores.intellect))),
    focus: Math.min(95, Math.max(15, Math.round(rawScores.focus))),
    discipline: Math.min(95, Math.max(15, Math.round(rawScores.discipline))),
    energy: Math.min(95, Math.max(15, Math.round(rawScores.energy))),
  };

  // Determine Archetype
  const archetype = determineArchetype(attributes, archetypeWeights);

  // Sort attributes to find top strengths and areas to develop
  const sortedStats = (Object.keys(attributes) as AttributeType[])
    .map((type) => ({
      type,
      value: attributes[type],
      label: ATTRIBUTE_META[type].label,
      icon: ATTRIBUTE_META[type].icon,
    }))
    .sort((a, b) => b.value - a.value);

  // Top 2 are strengths
  const strengths = sortedStats.slice(0, 2);

  // Bottom 2 are opportunities for growth
  const growthAreas = sortedStats.slice(-2).reverse();

  return {
    characterName: characterName.trim() || "Adventurer",
    archetype,
    attributes,
    strengths,
    growthAreas,
    selectedGoals: selectedGoals.length > 0 ? selectedGoals : ["Iron Consistency", "Deep Focus"],
  };
}
