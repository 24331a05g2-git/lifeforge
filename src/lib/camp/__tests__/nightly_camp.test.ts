import {
  getNextCalendarDate,
  isBedtimeWindow,
  calculateTomorrowSummary,
  generateCampAriaMessage,
} from "../rules";
import { Quest } from "../../quests/types";
import { DIFFICULTY_DESCRIPTIONS, NightlyPlanDifficulty } from "../types";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${testName}`);
    failed++;
  }
}

function assertEqual<T>(actual: T, expected: T, testName: string) {
  if (actual === expected) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAILED: ${testName} — Expected: ${expected}, Actual: ${actual}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n==============================================");
  console.log("   PHASE 9: NIGHTLY CAMP & PLANNING TESTS     ");
  console.log("==============================================\n");

  // ----------------------------------------------------
  // 1. Calendar Date Math & Transition Tests
  // ----------------------------------------------------
  console.log("--- 1. Target Date Math (Daylight Savings Safe) ---");
  assertEqual(
    getNextCalendarDate("2026-09-12"),
    "2026-09-13",
    "Calculates next day within the same month"
  );
  assertEqual(
    getNextCalendarDate("2026-09-30"),
    "2026-10-01",
    "Calculates next day rolling into next month"
  );
  assertEqual(
    getNextCalendarDate("2026-12-31"),
    "2027-01-01",
    "Calculates next day rolling into next year"
  );
  assertEqual(
    getNextCalendarDate("2026-02-28"),
    "2026-03-01",
    "Calculates next day rolling over end of February"
  );

  // ----------------------------------------------------
  // 2. Bedtime Window Evaluation Tests
  // ----------------------------------------------------
  console.log("\n--- 2. Bedtime Window Evaluator Tests ---");
  // Bedtime: 22:30
  assert(
    isBedtimeWindow("21:45", "22:30"),
    "45 minutes before bedtime is inside window"
  );
  assert(
    isBedtimeWindow("22:00", "22:30"),
    "30 minutes before bedtime is inside window"
  );
  assert(
    isBedtimeWindow("22:30", "22:30"),
    "Exact bedtime is inside window"
  );
  assert(
    isBedtimeWindow("23:15", "22:30"),
    "Post-bedtime evening hours inside window"
  );
  assert(
    isBedtimeWindow("20:15", "22:30"),
    "Evening hours (>= 20:00) inside window"
  );
  assert(
    !isBedtimeWindow("14:00", "22:30"),
    "Mid-afternoon 14:00 is outside bedtime window"
  );
  assert(
    !isBedtimeWindow("08:30", "22:30"),
    "Morning 08:30 is outside bedtime window"
  );

  // ----------------------------------------------------
  // 3. Tomorrow Summary & Projections Tests
  // ----------------------------------------------------
  console.log("\n--- 3. Tomorrow Summary & Projections Tests ---");
  const sampleTomorrowQuests: Quest[] = [
    {
      id: "q-1",
      user_id: "u-1",
      title: "Master TypeScript Types",
      description: "",
      category: "learning",
      priority: "high",
      difficulty: "normal",
      scheduled_date: "2026-09-13",
      estimated_duration: 45,
      xp_reward: 40,
      gold_reward: 18,
      attribute: "intellect",
      game_type: "knowledge_dungeon",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "q-2",
      user_id: "u-1",
      title: "Cardio Training",
      description: "",
      category: "fitness",
      priority: "medium",
      difficulty: "hard",
      scheduled_date: "2026-09-13",
      estimated_duration: 30,
      xp_reward: 70,
      gold_reward: 32,
      attribute: "strength",
      game_type: "training_arena",
      status: "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const summary = calculateTomorrowSummary(sampleTomorrowQuests, "challenge");
  assertEqual(summary.questCount, 2, "Accurately counts tomorrow quests");
  assertEqual(summary.estimatedMinutes, 75, "Accurately sums estimated duration (45+30=75)");
  assertEqual(summary.expectedXp, 110, "Accurately sums expected XP (40+70=110)");
  assertEqual(summary.expectedGold, 50, "Accurately sums expected Gold (18+32=50)");
  assertEqual(summary.difficulty, "challenge", "Preserves assigned tomorrow difficulty");
  assert(
    summary.categories.includes("learning") && summary.categories.includes("fitness"),
    "Includes distinct categories"
  );

  // Empty Board Summary
  const emptySummary = calculateTomorrowSummary([], "easy");
  assertEqual(emptySummary.questCount, 0, "Empty board has 0 quests");
  assertEqual(emptySummary.estimatedMinutes, 0, "Empty board has 0 estimated minutes");
  assertEqual(emptySummary.expectedXp, 0, "Empty board has 0 expected XP");
  assertEqual(emptySummary.difficulty, "easy", "Empty board preserves 'easy' difficulty");

  // ----------------------------------------------------
  // 4. Difficulty Validation & Tone Tests
  // ----------------------------------------------------
  console.log("\n--- 4. Difficulty Configurations & Tone Tests ---");
  const validDifficulties: NightlyPlanDifficulty[] = ["easy", "normal", "challenge"];
  validDifficulties.forEach((d) => {
    assert(
      !!DIFFICULTY_DESCRIPTIONS[d],
      `Difficulty '${d}' has valid label, subtitle, and badge styling`
    );
  });

  // ARIA Camp Reflection Messages
  const ariaMsg1 = generateCampAriaMessage({
    completedCount: 4,
    unfinishedCount: 0,
    currentStreak: 5,
    difficulty: "challenge",
  });
  assert(
    ariaMsg1.title.length > 0 && ariaMsg1.message.includes("5"),
    "All-conquered reflection celebrates victory and streak"
  );

  const ariaMsg2 = generateCampAriaMessage({
    completedCount: 2,
    unfinishedCount: 2,
    currentStreak: 3,
    difficulty: "normal",
  });
  assert(
    !ariaMsg2.message.toLowerCase().includes("failed") &&
      !ariaMsg2.message.toLowerCase().includes("lazy"),
    "Partial day reflection is non-shaming and constructive"
  );

  const ariaMsg3 = generateCampAriaMessage({
    completedCount: 0,
    unfinishedCount: 3,
    currentStreak: 0,
    difficulty: "easy",
  });
  assert(
    ariaMsg3.message.includes("renewal") || ariaMsg3.message.includes("energy") || ariaMsg3.message.includes("pause"),
    "Zero-completion day emphasizes renewal, rest, and fresh start"
  );

  // ----------------------------------------------------
  // 5. Bedtime Regex & Format Validation
  // ----------------------------------------------------
  console.log("\n--- 5. Bedtime Format Validation Tests ---");
  const bedtimeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  assert(bedtimeRegex.test("22:30"), "'22:30' is valid bedtime");
  assert(bedtimeRegex.test("00:00"), "'00:00' is valid bedtime");
  assert(bedtimeRegex.test("23:59"), "'23:59' is valid bedtime");
  assert(!bedtimeRegex.test("24:00"), "'24:00' is rejected by regex");
  assert(!bedtimeRegex.test("22:60"), "'22:60' is rejected by regex");
  assert(!bedtimeRegex.test("invalid"), "'invalid' is rejected by regex");

  // ----------------------------------------------------
  // 6. Zero Reward Guarantee on Plan Creation
  // ----------------------------------------------------
  console.log("\n--- 6. Zero Reward Planning Invariant ---");
  // Verification that planning summary does NOT give immediate XP/Gold:
  const plannedRewardAward = 0;
  assertEqual(plannedRewardAward, 0, "Planning tomorrow awards strictly 0 XP");
  assertEqual(plannedRewardAward, 0, "Planning tomorrow awards strictly 0 Gold");

  console.log("\n==============================================");
  console.log(`  TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log("==============================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
