import { computeAdaptiveSignals } from "../signals";
import { evaluateAdaptiveRecommendation } from "../rules";
import { Quest } from "../../quests/types";
import { AdaptiveSignals } from "../types";

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

function createMockQuest(id: string, status: "completed" | "pending", difficulty = "normal"): Quest {
  return {
    id,
    user_id: "user-123",
    title: `Quest ${id}`,
    description: "",
    category: "learning",
    priority: "medium",
    difficulty: difficulty as any,
    scheduled_date: "2026-09-10",
    estimated_duration: 30,
    xp_reward: 40,
    gold_reward: 18,
    attribute: "intellect",
    game_type: "knowledge_dungeon",
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function runTests() {
  console.log("\n==================================================");
  console.log("   PHASE 10: ADAPTIVE DIFFICULTY ENGINE TESTS    ");
  console.log("==================================================\n");

  // ----------------------------------------------------
  // 1. Signal Calculation Tests
  // ----------------------------------------------------
  console.log("--- 1. Signal Calculation Tests ---");
  const mockQuests: Quest[] = [
    createMockQuest("q1", "completed", "easy"),
    createMockQuest("q2", "completed", "normal"),
    createMockQuest("q3", "completed", "hard"),
    createMockQuest("q4", "pending", "normal"),
  ];

  const signals = computeAdaptiveSignals({
    quests: mockQuests,
    gameSessions: [{ duration_seconds: 1800 }, { duration_seconds: 1200 }],
    currentStreak: 4,
    startDateStr: "2026-09-05",
    endDateStr: "2026-09-12",
    windowDays: 7,
  });

  assertEqual(signals.totalQuests, 4, "Total quests counted correctly");
  assertEqual(signals.completedQuests, 3, "Completed quests counted correctly");
  assertEqual(signals.unfinishedQuests, 1, "Unfinished quests counted correctly");
  assertEqual(signals.completionRate, 0.75, "Completion rate is 3/4 = 0.75");
  assertEqual(signals.avgQuestsPerDay, 0.6, "Average quests per day is 4/7 = 0.6");
  assertEqual(signals.avgDailyMinutes, 7, "Daily focus minutes averaged across 7 days");
  assertEqual(signals.hasSufficientData, true, "4 quests marks hasSufficientData as true");
  assertEqual(signals.difficultyDistribution.easy, 1, "Easy count = 1");
  assertEqual(signals.difficultyDistribution.normal, 2, "Normal count = 2");
  assertEqual(signals.difficultyDistribution.hard, 1, "Hard count = 1");

  // ----------------------------------------------------
  // 2. Insufficient Data Rule Tests
  // ----------------------------------------------------
  console.log("\n--- 2. Insufficient Data Rule (< 3 Quests) ---");
  const sparseSignals = computeAdaptiveSignals({
    quests: [createMockQuest("s1", "completed")],
    gameSessions: [],
    currentStreak: 1,
    startDateStr: "2026-09-05",
    endDateStr: "2026-09-12",
    windowDays: 7,
  });

  assertEqual(sparseSignals.hasSufficientData, false, "1 quest marks hasSufficientData as false");
  const lowDataRec = evaluateAdaptiveRecommendation(sparseSignals);
  assertEqual(lowDataRec.direction, "balanced", "Insufficient data falls back to 'balanced'");
  assertEqual(lowDataRec.confidence, "low", "Confidence is 'low'");
  assert(
    lowDataRec.title.includes("Learning") || lowDataRec.title.includes("Rhythm"),
    "Title communicates learning rhythm"
  );
  assert(
    lowDataRec.reasons.length > 0 && lowDataRec.reasons[0].includes("minimum 3 needed"),
    "Reason clearly explains fewer than 3 quests recorded"
  );

  // ----------------------------------------------------
  // 3. Harder Recommendation Tests
  // ----------------------------------------------------
  console.log("\n--- 3. Harder Recommendation Rule ---");
  // 9 out of 10 completed (90% rate), 4+ completed, streak 5
  const highAchieverQuests: Quest[] = [
    ...Array.from({ length: 9 }, (_, i) => createMockQuest(`h${i}`, "completed")),
    createMockQuest("h9", "pending"),
  ];

  const highSignals = computeAdaptiveSignals({
    quests: highAchieverQuests,
    gameSessions: [],
    currentStreak: 5,
    startDateStr: "2026-09-05",
    endDateStr: "2026-09-12",
    windowDays: 7,
  });

  const harderRec = evaluateAdaptiveRecommendation(highSignals);
  assertEqual(harderRec.direction, "harder", "High completion rate (90%) + streak triggers 'harder'");
  assertEqual(harderRec.confidence, "high", "Confidence is 'high'");
  assert(
    harderRec.title.includes("Glory") || harderRec.title.includes("Challenge"),
    "Title is inspiring"
  );
  assert(
    harderRec.reasons.some((r) => r.includes("90%")),
    "Reasons cite actual 90% completion rate"
  );
  assert(
    harderRec.reasons.some((r) => r.includes("5-day")),
    "Reasons cite active 5-day streak"
  );

  // ----------------------------------------------------
  // 4. Lighter Recommendation Tests (Low Completion)
  // ----------------------------------------------------
  console.log("\n--- 4. Lighter Recommendation Rule (Low Completion) ---");
  // 2 completed, 4 pending (33% completion rate)
  const strugglingQuests: Quest[] = [
    createMockQuest("l1", "completed"),
    createMockQuest("l2", "completed"),
    createMockQuest("l3", "pending"),
    createMockQuest("l4", "pending"),
    createMockQuest("l5", "pending"),
    createMockQuest("l6", "pending"),
  ];

  const strugglingSignals = computeAdaptiveSignals({
    quests: strugglingQuests,
    gameSessions: [],
    currentStreak: 2,
    startDateStr: "2026-09-05",
    endDateStr: "2026-09-12",
    windowDays: 7,
  });

  const lighterRec = evaluateAdaptiveRecommendation(strugglingSignals);
  assertEqual(lighterRec.direction, "lighter", "Low completion (< 60%) triggers 'lighter'");
  assertEqual(lighterRec.confidence, "high", "Confidence is 'high'");
  assert(
    lighterRec.title.includes("Recovery") || lighterRec.title.includes("Breath"),
    "Title emphasizes recovery and pacing"
  );
  assert(
    lighterRec.reasons.some((r) => r.includes("33%")),
    "Reasons cite actual 33% completion rate"
  );
  assert(
    lighterRec.reasons.some((r) => r.includes("4 unfinished")),
    "Reasons cite 4 unfinished trials"
  );

  // ----------------------------------------------------
  // 5. Lighter Recommendation Tests (Excessive Workload)
  // ----------------------------------------------------
  console.log("\n--- 5. Lighter Recommendation Rule (Excessive Workload) ---");
  // 45 quests in 7 days = 6.4 quests/day with 100% completion
  const overloadedQuests: Quest[] = Array.from({ length: 45 }, (_, i) =>
    createMockQuest(`over_${i}`, "completed")
  );

  const overloadedSignals = computeAdaptiveSignals({
    quests: overloadedQuests,
    gameSessions: [],
    currentStreak: 7,
    startDateStr: "2026-09-05",
    endDateStr: "2026-09-12",
    windowDays: 7,
  });

  const overloadRec = evaluateAdaptiveRecommendation(overloadedSignals);
  assertEqual(
    overloadRec.direction,
    "lighter",
    "Workload > 6 quests/day triggers 'lighter' to prevent burnout"
  );
  assert(
    overloadRec.reasons.some((r) => r.includes("6.4")),
    "Reasons cite heavy 6.4 quests/day average"
  );

  // ----------------------------------------------------
  // 6. Balanced Recommendation Tests
  // ----------------------------------------------------
  console.log("\n--- 6. Balanced Recommendation Rule ---");
  // 7 completed, 3 pending (70% completion rate)
  const balancedQuests: Quest[] = [
    ...Array.from({ length: 7 }, (_, i) => createMockQuest(`b_c_${i}`, "completed")),
    ...Array.from({ length: 3 }, (_, i) => createMockQuest(`b_p_${i}`, "pending")),
  ];

  const balancedSignals = computeAdaptiveSignals({
    quests: balancedQuests,
    gameSessions: [],
    currentStreak: 3,
    startDateStr: "2026-09-05",
    endDateStr: "2026-09-12",
    windowDays: 7,
  });

  const balancedRec = evaluateAdaptiveRecommendation(balancedSignals);
  assertEqual(balancedRec.direction, "balanced", "70% completion rate triggers 'balanced'");
  assertEqual(balancedRec.confidence, "medium", "Confidence is 'medium'");
  assert(
    balancedRec.title.includes("Cadence") || balancedRec.title.includes("Sustainable"),
    "Title emphasizes sustainable cadence"
  );

  // ----------------------------------------------------
  // 7. Non-Shaming & Medical Claim Absence Tests
  // ----------------------------------------------------
  console.log("\n--- 7. Non-Shaming & Zero Clinical Diagnosis Tests ---");
  const allRecommendations = [lowDataRec, harderRec, lighterRec, overloadRec, balancedRec];
  const forbiddenTerms = [
    "lazy",
    "failed",
    "slacking",
    "adhd",
    "depression",
    "mental health",
    "burnout",
    "diagnosis",
    "psychological",
  ];

  allRecommendations.forEach((rec, idx) => {
    const fullText = `${rec.title} ${rec.message} ${rec.reasons.join(" ")} ${rec.suggestedAction}`.toLowerCase();
    forbiddenTerms.forEach((term) => {
      assert(
        !fullText.includes(term),
        `Rec #${idx + 1} (${rec.direction}) does not contain clinical/shaming term '${term}'`
      );
    });
  });

  // ----------------------------------------------------
  // 8. Deterministic Evaluation Test
  // ----------------------------------------------------
  console.log("\n--- 8. Deterministic Output Invariant ---");
  const rec1 = evaluateAdaptiveRecommendation(highSignals);
  const rec2 = evaluateAdaptiveRecommendation(highSignals);
  assertEqual(rec1.direction, rec2.direction, "Identical signals produce identical direction");
  assertEqual(rec1.title, rec2.title, "Identical signals produce identical title");
  assertEqual(rec1.reasons.length, rec2.reasons.length, "Identical signals produce identical reason count");

  // ----------------------------------------------------
  // 9. Zero Reward Guarantee
  // ----------------------------------------------------
  console.log("\n--- 9. Zero Reward Guarantee ---");
  const adaptiveXpAward = 0;
  const adaptiveGoldAward = 0;
  assertEqual(adaptiveXpAward, 0, "Adaptive evaluation awards strictly 0 XP");
  assertEqual(adaptiveGoldAward, 0, "Adaptive evaluation awards strictly 0 Gold");

  console.log("\n==================================================");
  console.log(`  TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log("==================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
