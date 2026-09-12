import { detectGameMasterContext } from "../detector";
import { RuleBasedGameMasterProvider } from "../provider";
import { GameMasterContextData } from "../types";
import {
  isWithinQuietHours,
  evaluateNotificationEligibility,
  timeToMinutes,
} from "../../notifications/rules";
import { NotificationPreferences, DEFAULT_NOTIFICATION_PREFERENCES } from "../../notifications/types";

// Simple test runner for Node/tsx
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
  console.log("\n==========================================");
  console.log("  PHASE 8: GAME MASTER & NOTIFICATIONS TESTS");
  console.log("==========================================\n");

  const baseContext: GameMasterContextData = {
    timeOfDay: "morning",
    localHour: 9,
    questsToday: 3,
    completedToday: 0,
    remainingQuests: 3,
    currentStreak: 2,
    longestStreak: 5,
    level: 4,
    xp: 450,
    goals: ["Deep Work", "Fitness"],
    strongestAttributes: ["Focus", "Strength"],
    recentActivity: { completedQuestCount: 0 },
    timezone: "UTC",
  };

  // ----------------------------------------------------
  // 1. Context Detector Tests
  // ----------------------------------------------------
  console.log("--- 1. Context Detector Tests ---");

  // Empty Board
  assertEqual(
    detectGameMasterContext({ ...baseContext, questsToday: 0, remainingQuests: 0 }),
    "no_quests",
    "Empty board maps to 'no_quests'"
  );

  // Streak at Risk (localHour >= 17, streak > 0, completed = 0)
  assertEqual(
    detectGameMasterContext({
      ...baseContext,
      localHour: 18,
      completedToday: 0,
      currentStreak: 4,
    }),
    "streak_at_risk",
    "Active streak with 0 completions past 17:00 maps to 'streak_at_risk'"
  );

  // Evening Review (localHour >= 18, all completed)
  assertEqual(
    detectGameMasterContext({
      ...baseContext,
      localHour: 20,
      completedToday: 3,
      remainingQuests: 0,
      currentStreak: 4,
    }),
    "evening_review",
    "Evening with all quests completed maps to 'evening_review'"
  );

  // Good Progress (completed >= 2)
  assertEqual(
    detectGameMasterContext({
      ...baseContext,
      localHour: 14,
      questsToday: 4,
      completedToday: 2,
      remainingQuests: 2,
    }),
    "good_progress",
    "Multiple completions today map to 'good_progress'"
  );

  // Morning (localHour 5-11, 0 completed)
  assertEqual(
    detectGameMasterContext({
      ...baseContext,
      localHour: 8,
      questsToday: 2,
      completedToday: 0,
      remainingQuests: 2,
    }),
    "morning",
    "Morning hours with pending quests map to 'morning'"
  );

  // Midday Progress (localHour 12-16, remaining quests)
  assertEqual(
    detectGameMasterContext({
      ...baseContext,
      localHour: 13,
      questsToday: 4,
      completedToday: 0,
      remainingQuests: 4,
      currentStreak: 0,
    }),
    "midday_progress",
    "Midday hours with remaining quests map to 'midday_progress'"
  );

  // ----------------------------------------------------
  // 2. RuleBasedGameMasterProvider Tests
  // ----------------------------------------------------
  console.log("\n--- 2. Game Master Provider & Tone Tests ---");
  const provider = new RuleBasedGameMasterProvider();

  const morningMessage = await provider.generateMessage({
    ...baseContext,
    localHour: 8,
    completedToday: 0,
  });
  assert(
    morningMessage.title.length > 0 && morningMessage.message.length > 0,
    "Morning guidance has non-empty title and message"
  );
  assertEqual(
    morningMessage.context,
    "morning",
    "Morning guidance context is correctly assigned"
  );
  assert(
    !morningMessage.message.toLowerCase().includes("lazy") &&
      !morningMessage.message.toLowerCase().includes("failed") &&
      !morningMessage.message.toLowerCase().includes("disappointing"),
    "Guidance tone is non-shaming and constructive"
  );

  const streakRiskMessage = await provider.generateMessage({
    ...baseContext,
    localHour: 19,
    currentStreak: 7,
    completedToday: 0,
  });
  assertEqual(
    streakRiskMessage.context,
    "streak_at_risk",
    "Streak alert generated correctly"
  );
  assertEqual(
    streakRiskMessage.priority,
    "high",
    "Streak at risk alert has 'high' priority"
  );
  assert(
    streakRiskMessage.message.includes("7"),
    "Streak alert includes current streak count"
  );

  // ----------------------------------------------------
  // 3. Quiet Hours Evaluator Tests
  // ----------------------------------------------------
  console.log("\n--- 3. Quiet Hours Evaluator Tests ---");

  // Overnight window: 22:00 -> 07:00
  assert(
    isWithinQuietHours("22:00", "22:00", "07:00"),
    "22:00 is within 22:00-07:00 quiet hours"
  );
  assert(
    isWithinQuietHours("23:45", "22:00", "07:00"),
    "23:45 is within 22:00-07:00 quiet hours"
  );
  assert(
    isWithinQuietHours("02:15", "22:00", "07:00"),
    "02:15 is within 22:00-07:00 quiet hours"
  );
  assert(
    isWithinQuietHours("06:59", "22:00", "07:00"),
    "06:59 is within 22:00-07:00 quiet hours"
  );
  assert(
    !isWithinQuietHours("07:00", "22:00", "07:00"),
    "07:00 is outside 22:00-07:00 quiet hours"
  );
  assert(
    !isWithinQuietHours("12:00", "22:00", "07:00"),
    "12:00 is outside 22:00-07:00 quiet hours"
  );
  assert(
    !isWithinQuietHours("21:59", "22:00", "07:00"),
    "21:59 is outside 22:00-07:00 quiet hours"
  );

  // Daytime window: 13:00 -> 15:00
  assert(
    isWithinQuietHours("13:30", "13:00", "15:00"),
    "13:30 is within 13:00-15:00 quiet hours"
  );
  assert(
    !isWithinQuietHours("12:59", "13:00", "15:00"),
    "12:59 is outside 13:00-15:00 quiet hours"
  );
  assert(
    !isWithinQuietHours("15:00", "13:00", "15:00"),
    "15:00 is outside 13:00-15:00 quiet hours"
  );

  // ----------------------------------------------------
  // 4. Notification Eligibility & Caps Tests
  // ----------------------------------------------------
  console.log("\n--- 4. Notification Eligibility & Rules Tests ---");

  const defaultPrefs: NotificationPreferences = {
    user_id: "test-user",
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  };

  // Master disabled
  const resDisabled = evaluateNotificationEligibility({
    type: "streak_alert",
    preferences: { ...defaultPrefs, enabled: false },
    currentTimeStr: "14:00",
    todayNotificationCount: 0,
    hasDuplicateToday: false,
  });
  assertEqual(resDisabled.allowed, false, "Disallowed when notifications disabled");
  assertEqual(resDisabled.reason, "notifications_disabled", "Reason is 'notifications_disabled'");

  // Category disabled
  const resCatDisabled = evaluateNotificationEligibility({
    type: "streak_alert",
    preferences: { ...defaultPrefs, streak_alerts: false },
    currentTimeStr: "14:00",
    todayNotificationCount: 0,
    hasDuplicateToday: false,
  });
  assertEqual(resCatDisabled.allowed, false, "Disallowed when streak_alerts category is off");
  assertEqual(resCatDisabled.reason, "category_disabled", "Reason is 'category_disabled'");

  // Quiet hours blocked
  const resQuiet = evaluateNotificationEligibility({
    type: "aria_guidance",
    preferences: defaultPrefs,
    currentTimeStr: "23:00", // during 22:00 - 07:00
    todayNotificationCount: 0,
    hasDuplicateToday: false,
  });
  assertEqual(resQuiet.allowed, false, "Disallowed during quiet hours");
  assertEqual(resQuiet.reason, "quiet_hours", "Reason is 'quiet_hours'");

  // Daily limit reached
  const resLimit = evaluateNotificationEligibility({
    type: "quest_reminder",
    preferences: { ...defaultPrefs, max_daily_notifications: 3 },
    currentTimeStr: "14:00",
    todayNotificationCount: 3,
    hasDuplicateToday: false,
  });
  assertEqual(resLimit.allowed, false, "Disallowed when max daily notifications reached");
  assertEqual(resLimit.reason, "daily_limit_reached", "Reason is 'daily_limit_reached'");

  // Duplicate today
  const resDup = evaluateNotificationEligibility({
    type: "streak_alert",
    preferences: defaultPrefs,
    currentTimeStr: "14:00",
    todayNotificationCount: 1,
    hasDuplicateToday: true,
  });
  assertEqual(resDup.allowed, false, "Disallowed when duplicate exists for today");
  assertEqual(resDup.reason, "duplicate_today", "Reason is 'duplicate_today'");

  // All criteria pass
  const resAllowed = evaluateNotificationEligibility({
    type: "streak_alert",
    preferences: defaultPrefs,
    currentTimeStr: "18:00",
    todayNotificationCount: 1,
    hasDuplicateToday: false,
  });
  assertEqual(resAllowed.allowed, true, "Allowed when all rules satisfied");

  console.log("\n==========================================");
  console.log(`  TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log("==========================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
