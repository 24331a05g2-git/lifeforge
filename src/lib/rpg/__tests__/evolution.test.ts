import { getCharacterEvolution } from "../evolution";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log("=== RUNNING CHARACTER EVOLUTION TEST SUITE ===\n");

// 1. TIER BOUNDARY TESTS
console.log("1. Testing Evolution Tier Boundaries...");
const e1 = getCharacterEvolution(1, "warrior");
assert(e1.tierNumber === 1 && e1.name === "Initiate", "Level 1 is Tier 1 Initiate");

const e4 = getCharacterEvolution(4, "warrior");
assert(e4.tierNumber === 1 && e4.name === "Initiate", "Level 4 is Tier 1 Initiate");

const e5 = getCharacterEvolution(5, "warrior");
assert(e5.tierNumber === 2 && e5.name === "Apprentice", "Level 5 advances to Tier 2 Apprentice");

const e9 = getCharacterEvolution(9, "warrior");
assert(e9.tierNumber === 2 && e9.name === "Apprentice", "Level 9 is Tier 2 Apprentice");

const e10 = getCharacterEvolution(10, "warrior");
assert(e10.tierNumber === 3 && e10.name === "Adept", "Level 10 advances to Tier 3 Adept");

const e19 = getCharacterEvolution(19, "warrior");
assert(e19.tierNumber === 3 && e19.name === "Adept", "Level 19 is Tier 3 Adept");

const e20 = getCharacterEvolution(20, "warrior");
assert(e20.tierNumber === 4 && e20.name === "Master", "Level 20 advances to Tier 4 Master");

const e50 = getCharacterEvolution(50, "warrior");
assert(e50.tierNumber === 4 && e50.name === "Master", "Level 50 remains Tier 4 Master");
console.log("✓ Tier transitions verified across Levels 1, 4, 5, 9, 10, 19, 20, 50.");

// 2. ARCHETYPE TITLES
console.log("2. Testing Archetype Titles...");
assert(getCharacterEvolution(1, "The Scholar").title === "Initiate Scholar", "Level 1 Scholar");
assert(getCharacterEvolution(5, "scholar").title === "Apprentice Savant", "Level 5 Scholar -> Apprentice Savant");
assert(getCharacterEvolution(10, "scholar").title === "Adept Philosopher", "Level 10 Scholar -> Adept Philosopher");
assert(getCharacterEvolution(20, "scholar").title === "Archon of Infinite Wisdom", "Level 20 Scholar -> Archon of Infinite Wisdom");

assert(getCharacterEvolution(1, "The Strategist").title === "Initiate Tactician", "Level 1 Strategist");
assert(getCharacterEvolution(10, "strategist").title === "Adept Grandmaster", "Level 10 Strategist -> Adept Grandmaster");
console.log("✓ Tailored titles correctly generated for archetypes across all tiers.");

console.log("\n>>> ALL CHARACTER EVOLUTION TESTS PASSED! <<<\n");
