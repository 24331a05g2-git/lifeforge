import { ArchetypeInfo, AttributeScore, AttributeType } from "./types";

export const ARCHETYPES: Record<string, ArchetypeInfo> = {
  warrior: {
    id: "warrior",
    title: "The Warrior",
    subtitle: "Unyielding Vitality & Physical Might",
    description:
      "You channel determination through action, physical rigor, and relentless energy. When challenges rise, you charge forward and forge momentum through sweat and grit.",
    icon: "⚔️",
    primaryAttributes: ["strength", "energy"],
    quote: "Action speaks louder than contemplation. Forge the body, forge the will.",
    color: "from-amber-500/20 to-orange-600/10",
    borderAccent: "border-amber-500/40 text-amber-300",
  },
  scholar: {
    id: "scholar",
    title: "The Scholar",
    subtitle: "Master of Deep Thought & Analytical Wisdom",
    description:
      "You conquer reality by understanding its first principles. Curious, methodical, and hungry for knowledge, you dissect problems with intellectual precision.",
    icon: "📜",
    primaryAttributes: ["intellect", "focus"],
    quote: "To understand the blade is to wield it without striking in vain.",
    color: "from-sky-500/20 to-indigo-600/10",
    borderAccent: "border-sky-500/40 text-sky-300",
  },
  strategist: {
    id: "strategist",
    title: "The Strategist",
    subtitle: "Architect of Focus & Unbroken Discipline",
    description:
      "You eliminate friction through systemic planning. Calm amidst noise, you break monumental quests into precise, surgical victories with unwavering concentration.",
    icon: "🎯",
    primaryAttributes: ["focus", "discipline"],
    quote: "A battle is won before it is fought through preparation and poise.",
    color: "from-violet-500/20 to-purple-600/10",
    borderAccent: "border-violet-500/40 text-violet-300",
  },
  builder: {
    id: "builder",
    title: "The Builder",
    subtitle: "Creator of Systems & Tangible Innovation",
    description:
      "You thrive when turning abstract visions into living creations. Whether coding, crafting, or designing habits, your intellect seeks realization in the real world.",
    icon: "📐",
    primaryAttributes: ["intellect", "energy"],
    quote: "Dreaming is good; constructing what you dream is divine.",
    color: "from-emerald-500/20 to-teal-600/10",
    borderAccent: "border-emerald-500/40 text-emerald-300",
  },
  explorer: {
    id: "explorer",
    title: "The Explorer",
    subtitle: "Pioneer of Frontiers & Boundless Drive",
    description:
      "You crave novelty, rapid adaptation, and expansive horizons. Your high energy and insatiable curiosity keep you constantly testing boundaries and discovering paths.",
    icon: "🧭",
    primaryAttributes: ["energy", "intellect"],
    quote: "The map is not the territory. The true quest is beyond the horizon.",
    color: "from-cyan-500/20 to-blue-600/10",
    borderAccent: "border-cyan-500/40 text-cyan-300",
  },
  guardian: {
    id: "guardian",
    title: "The Guardian",
    subtitle: "Shield of Consistency & Steely Endurance",
    description:
      "You are the unshakeable bedrock. Grounded by rock-solid routines and loyalty to your team and promises, you win through day-in, day-out relentless consistency.",
    icon: "🛡️",
    primaryAttributes: ["discipline", "strength"],
    quote: "The storm will pass; the mountain remains steadfast.",
    color: "from-rose-500/20 to-amber-600/10",
    borderAccent: "border-rose-500/40 text-rose-300",
  },
};

/**
 * Deterministically determines the player's starting archetype based on attribute distribution
 * and specific archetype affinity tallies from their answers.
 */
export function determineArchetype(
  attributes: AttributeScore,
  archetypeWeights: Record<string, number> = {}
): ArchetypeInfo {
  // Score based on attribute strengths
  const scores: Record<string, number> = {
    warrior: attributes.strength * 1.3 + attributes.energy * 1.1 + (archetypeWeights.warrior || 0),
    scholar: attributes.intellect * 1.4 + attributes.focus * 0.9 + (archetypeWeights.scholar || 0),
    strategist: attributes.focus * 1.3 + attributes.discipline * 1.2 + (archetypeWeights.strategist || 0),
    builder: attributes.intellect * 1.1 + attributes.energy * 1.0 + (archetypeWeights.builder || 0),
    explorer: attributes.energy * 1.3 + attributes.intellect * 0.9 + (archetypeWeights.explorer || 0),
    guardian: attributes.discipline * 1.3 + attributes.strength * 1.0 + (archetypeWeights.guardian || 0),
  };

  let bestArchetypeId = "warrior";
  let maxScore = -1;

  for (const [id, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestArchetypeId = id;
    }
  }

  return ARCHETYPES[bestArchetypeId] || ARCHETYPES.scholar;
}
