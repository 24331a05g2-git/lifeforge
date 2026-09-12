import { ArchetypeInfo, AttributeType } from "@/lib/assessment/types";
import { ARCHETYPES } from "@/lib/assessment/archetypes";

export interface EvolutionTier {
  tierNumber: number;
  name: string; // "Initiate", "Apprentice", "Adept", "Master"
  title: string; // Full title tailored to archetype: e.g. "Adept Strategist"
  minLevel: number;
  maxLevel: number;
  crestColor: string; // Tailwind color class for border/glow
  auraGradient: string; // Tailwind gradient
  sigilShape: "circle" | "shield" | "octagon" | "diamond";
  description: string;
}

const TIER_CONFIGS = [
  {
    tierNumber: 1,
    name: "Initiate",
    minLevel: 1,
    maxLevel: 4,
    crestColor: "border-amber-500/40 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    auraGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    sigilShape: "circle" as const,
    description: "Your journey has just commenced. The raw embers of potential flicker within.",
  },
  {
    tierNumber: 2,
    name: "Apprentice",
    minLevel: 5,
    maxLevel: 9,
    crestColor: "border-sky-500/50 text-sky-300 shadow-[0_0_25px_rgba(56,189,248,0.3)]",
    auraGradient: "from-sky-500/15 via-indigo-500/5 to-transparent",
    sigilShape: "shield" as const,
    description: "Disciplined training has honed your foundations into reliable strength.",
  },
  {
    tierNumber: 3,
    name: "Adept",
    minLevel: 10,
    maxLevel: 19,
    crestColor: "border-purple-500/60 text-purple-300 shadow-[0_0_35px_rgba(168,85,247,0.4)]",
    auraGradient: "from-purple-500/20 via-violet-500/10 to-transparent",
    sigilShape: "octagon" as const,
    description: "A seasoned veteran of real-world trials. Your habits are forged into iron resolve.",
  },
  {
    tierNumber: 4,
    name: "Master",
    minLevel: 20,
    maxLevel: 999,
    crestColor: "border-amber-400 text-amber-200 shadow-[0_0_50px_rgba(251,191,36,0.6)]",
    auraGradient: "from-amber-400/25 via-amber-500/15 to-transparent",
    sigilShape: "diamond" as const,
    description: "An ascended paragon of self-mastery. Your daily quests inspire the realm.",
  },
];

const ARCHETYPE_TITLE_MAP: Record<string, Record<number, string>> = {
  warrior: {
    1: "Initiate Warrior",
    2: "Vanguard Berserker",
    3: "Adept Champion",
    4: "Master of Iron & Might",
  },
  scholar: {
    1: "Initiate Scholar",
    2: "Apprentice Savant",
    3: "Adept Philosopher",
    4: "Archon of Infinite Wisdom",
  },
  strategist: {
    1: "Initiate Tactician",
    2: "Mastery Pathfinder",
    3: "Adept Grandmaster",
    4: "Supreme Architect of Fate",
  },
  builder: {
    1: "Initiate Builder",
    2: "Apprentice Crafter",
    3: "Adept Engineer",
    4: "Master World-Architect",
  },
  explorer: {
    1: "Initiate Wanderer",
    2: "Apprentice Pathfinder",
    3: "Adept Voyager",
    4: "Master Frontier Sovereign",
  },
  guardian: {
    1: "Initiate Sentinel",
    2: "Apprentice Defender",
    3: "Adept Aegis",
    4: "Eternal Bastion Sovereign",
  },
};

/**
 * Derives the visual character evolution tier from the player's level and archetype.
 */
export function getCharacterEvolution(level: number, archetypeId: string): EvolutionTier {
  const safeLevel = Math.max(1, Math.floor(level));
  const tierConfig =
    TIER_CONFIGS.find((t) => safeLevel >= t.minLevel && safeLevel <= t.maxLevel) ||
    TIER_CONFIGS[TIER_CONFIGS.length - 1];

  const safeArchetype = archetypeId.toLowerCase().trim().replace(/^the\s+/, "");
  const titles = ARCHETYPE_TITLE_MAP[safeArchetype] || ARCHETYPE_TITLE_MAP.strategist;
  const tailoredTitle = titles[tierConfig.tierNumber] || `${tierConfig.name} ${archetypeId}`;

  return {
    ...tierConfig,
    title: tailoredTitle,
  };
}
