import {
  getXpRequiredForLevel,
  getCumulativeXpForLevel,
  getLevelFromTotalXp,
  getProgressWithinLevel,
  calculateLevelTransition,
} from "../progression";
import {
  calculateQuestReward,
  calculateAttributeGain,
  resolveQuestAttribute,
} from "../rewards";
import {
  calculateStreakUpdate,
  getCalendarDayDifference,
  getCalendarDateInTimezone,
} from "../streak";
import { QuestDifficulty, QuestCategory } from "@/lib/quests/types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log("===============================================================");
console.log("   LIFEFORGE PHASE 6: RPG PROGRESSION & REWARD ENGINE SUITE    ");
console.log("===============================================================\n");

// -----------------------------------------------------------------------------
// TEST SUITE 1: EXACT NON-LINEAR LEVELING & OVERFLOW
// -----------------------------------------------------------------------------
console.log("--- TEST SUITE 1: Non-Linear Leveling Curve & Multi-Level Jumps ---");

// Check exact formula: floor(100 * level^1.5)
const expectedLevelXp = [
  { level: 1, xpToAdvance: 100, cumulative: 0 },
  { level: 2, xpToAdvance: 282, cumulative: 100 },
  { level: 3, xpToAdvance: 519, cumulative: 382 },
  { level: 4, xpToAdvance: 800, cumulative: 901 },
  { level: 5, xpToAdvance: 1118, cumulative: 1701 },
  { level: 6, xpToAdvance: 1469, cumulative: 2819 },
  { level: 7, xpToAdvance: 1852, cumulative: 4288 },
  { level: 8, xpToAdvance: 2262, cumulative: 6140 },
  { level: 9, xpToAdvance: 2700, cumulative: 8402 },
  { level: 10, xpToAdvance: 3162, cumulative: 11102 },
];

for (const t of expectedLevelXp) {
  const actualXp = getXpRequiredForLevel(t.level);
  assert(
    actualXp === t.xpToAdvance,
    `Level ${t.level} requires ${t.xpToAdvance} XP, got ${actualXp}`
  );

  const actualCumulative = getCumulativeXpForLevel(t.level);
  assert(
    actualCumulative === t.cumulative,
    `Cumulative XP for Level ${t.level} must be ${t.cumulative}, got ${actualCumulative}`
  );
}
console.log("✓ All 10 level thresholds and cumulative values match floor(100 * level^1.5) exactly.");

// Test standard level up with exact overflow
// Player at Level 1 with 80 XP earns 40 XP (normal quest) -> total 120 XP
const transition1 = calculateLevelTransition(80, 40);
assert(transition1.previousLevel === 1, "Previous level was 1");
assert(transition1.newLevel === 2, "New level is 2");
assert(transition1.leveledUp === true, "leveledUp is true");
assert(transition1.levelsGained === 1, "levelsGained is 1");
assert(transition1.newTotalXp === 120, "Total XP is 120");
assert(
  transition1.progressAfter.xpIntoCurrentLevel === 20,
  "XP into Level 2 is exactly 20 XP (120 - 100)"
);
assert(
  transition1.progressAfter.xpRequiredForNextLevel === 282,
  "XP required for Level 3 is 282 XP"
);
assert(
  transition1.progressAfter.xpRemaining === 262,
  "XP remaining to Level 3 is 262 XP (282 - 20)"
);
console.log("✓ Normal level up accurately carries over 20 XP overflow into Level 2.");

// Test multi-level jump: 0 XP player earns 1000 XP
const multiJump = calculateLevelTransition(0, 1000);
assert(multiJump.previousLevel === 1, "Started Level 1");
assert(multiJump.newLevel === 4, "Reached Level 4 (Level 4 starts at 901 XP)");
assert(multiJump.leveledUp === true, "Leveled up true");
assert(multiJump.levelsGained === 3, "Gained 3 levels in one jump");
assert(multiJump.progressAfter.xpIntoCurrentLevel === 99, "99 XP into Level 4 (1000 - 901)");
assert(multiJump.progressAfter.xpRequiredForNextLevel === 800, "Level 4 -> 5 requires 800 XP");
assert(multiJump.progressAfter.xpRemaining === 701, "701 XP remaining to Level 5");
console.log("✓ Multi-level jump (Level 1 -> 4) correctly preserves all 99 overflow XP.");

// -----------------------------------------------------------------------------
// TEST SUITE 2: DETERMINISTIC REWARDS & ATTRIBUTE PROGRESSION
// -----------------------------------------------------------------------------
console.log("\n--- TEST SUITE 2: Deterministic Rewards & Attribute Capping ---");

const difficulties: QuestDifficulty[] = ["easy", "normal", "hard", "epic"];
const expectedRewards = {
  easy: { xp: 20, gold: 8, attrGain: 1 },
  normal: { xp: 40, gold: 18, attrGain: 1 },
  hard: { xp: 80, gold: 40, attrGain: 2 },
  epic: { xp: 180, gold: 100, attrGain: 3 },
};

for (const diff of difficulties) {
  const r = calculateQuestReward(diff);
  assert(r.xp === expectedRewards[diff].xp, `${diff} XP mismatch`);
  assert(r.gold === expectedRewards[diff].gold, `${diff} Gold mismatch`);
  assert(r.attributeGain === expectedRewards[diff].attrGain, `${diff} Attribute gain mismatch`);
}
console.log("✓ All quest difficulty reward matrices verified (easy/normal/hard/epic).");

// Category -> Attribute mapping
const categoryMappings: [QuestCategory, string][] = [
  ["learning", "intellect"],
  ["fitness", "strength"],
  ["productivity", "focus"],
  ["personal", "discipline"],
  ["creative", "intellect"],
  ["social", "energy"],
  ["other", "discipline"],
];

for (const [cat, expectedAttr] of categoryMappings) {
  const actualAttr = resolveQuestAttribute(cat);
  assert(actualAttr === expectedAttr, `Category ${cat} mapped to ${actualAttr}, expected ${expectedAttr}`);
}
console.log("✓ All 7 quest categories accurately mapped to target RPG attributes.");

// Attribute Cap Test (Max 100)
const capTest1 = calculateAttributeGain("epic", 98); // 98 + 3 = 101 -> 100
assert(capTest1.newValue === 100, "Attribute capped at 100");
assert(capTest1.gain === 2, "Actual gain is 2 instead of 3 due to cap");
assert(capTest1.isCapped === true, "isCapped is true");

const capTest2 = calculateAttributeGain("hard", 100); // 100 + 2 = 102 -> 100
assert(capTest2.newValue === 100, "Attribute remains at 100");
assert(capTest2.gain === 0, "Actual gain is 0 when already capped at 100");
assert(capTest2.isCapped === true, "isCapped is true");
console.log("✓ Attribute progression strictly enforces the 100 maximum cap.");

// -----------------------------------------------------------------------------
// TEST SUITE 3: CALENDAR STREAK ENGINE
// -----------------------------------------------------------------------------
console.log("\n--- TEST SUITE 3: Calendar Streak Engine (Timezones & Missed Days) ---");

// Day 1: First quest ever completed
const sDay1 = calculateStreakUpdate(0, 0, null, "UTC", "2026-09-01");
assert(sDay1.currentStreak === 1, "First quest sets streak to 1");
assert(sDay1.longestStreak === 1, "Longest streak is 1");
assert(sDay1.isStreakExtended === true, "Streak extended flag is true");
assert(sDay1.isNewRecord === true, "New record is true");

// Day 1: Second quest completed same day
const sDay1Second = calculateStreakUpdate(1, 1, "2026-09-01", "UTC", "2026-09-01");
assert(sDay1Second.currentStreak === 1, "Same day quest does NOT increase streak");
assert(sDay1Second.longestStreak === 1, "Longest streak remains 1");
assert(sDay1Second.isStreakExtended === false, "Streak extended is false for second quest today");
assert(sDay1Second.isNewRecord === false, "Not a new record");

// Day 1: Third quest completed same day
const sDay1Third = calculateStreakUpdate(1, 1, "2026-09-01", "UTC", "2026-09-01");
assert(sDay1Third.currentStreak === 1, "Third quest same day keeps streak at 1");

// Day 2: Consecutive day completion
const sDay2 = calculateStreakUpdate(1, 1, "2026-09-01", "UTC", "2026-09-02");
assert(sDay2.currentStreak === 2, "Consecutive day increments streak to 2");
assert(sDay2.longestStreak === 2, "Longest streak increases to 2");
assert(sDay2.isStreakExtended === true, "Streak extended is true");
assert(sDay2.isNewRecord === true, "New record is true");

// Day 3: Consecutive day completion
const sDay3 = calculateStreakUpdate(2, 2, "2026-09-02", "UTC", "2026-09-03");
assert(sDay3.currentStreak === 3, "Day 3 increments streak to 3");
assert(sDay3.longestStreak === 3, "Longest streak is 3");

// Day 6: Completed after missing 2 days (Sept 4 and 5 missed)
const sDay6 = calculateStreakUpdate(3, 3, "2026-09-03", "UTC", "2026-09-06");
assert(sDay6.currentStreak === 1, "Missed days resets current streak to 1");
assert(sDay6.longestStreak === 3, "Longest streak preserved at 3 without penalty");
assert(sDay6.isStreakExtended === true, "Streak extended is true for fresh streak");
assert(sDay6.isNewRecord === false, "1 is not greater than 3, so not a new record");
console.log("✓ Streak engine accurately handles first quest, multiple quests same day, consecutive days, and missed days.");

// -----------------------------------------------------------------------------
// TEST SUITE 4: SIMULATED SERVER-AUTHORITATIVE TRANSACTION & IDEMPOTENCY
// -----------------------------------------------------------------------------
console.log("\n--- TEST SUITE 4: Concurrency, Idempotency & Abandoned Session Recovery ---");

interface MockDb {
  profiles: Map<string, { id: string; user_id: string; xp: number; level: number; gold: number; strength: number; current_streak: number; longest_streak: number; last_completed_date: string | null }>;
  quests: Map<string, { id: string; user_id: string; status: string; difficulty: QuestDifficulty; category: QuestCategory }>;
  sessions: Map<string, { id: string; user_id: string; quest_id: string; status: string }>;
  reward_events: Map<string, { id: string; quest_id: string; game_session_id: string; xp_amount: number }>;
}

function createMockDb(): MockDb {
  const db: MockDb = {
    profiles: new Map(),
    quests: new Map(),
    sessions: new Map(),
    reward_events: new Map(),
  };

  db.profiles.set("user-1", {
    id: "profile-1",
    user_id: "user-1",
    xp: 0,
    level: 1,
    gold: 0,
    strength: 50,
    current_streak: 0,
    longest_streak: 0,
    last_completed_date: null,
  });

  db.quests.set("quest-1", {
    id: "quest-1",
    user_id: "user-1",
    status: "in_progress",
    difficulty: "normal",
    category: "fitness",
  });

  return db;
}

/**
 * Simulates the atomic server-authoritative reward execution with full ownership chain and idempotency checks.
 */
function simulateRewardTransaction(
  db: MockDb,
  userId: string,
  sessionId: string,
  confirmedRealWorld: boolean
): { success: boolean; error?: string; reward?: any } {
  // 1. Check real world confirmation
  if (!confirmedRealWorld) {
    return { success: false, error: "Real world confirmation required" };
  }

  // 2. Authenticate & fetch session
  const session = db.sessions.get(sessionId);
  if (!session || session.user_id !== userId) {
    return { success: false, error: "Unauthorized session or not found" };
  }

  if (session.status === "abandoned") {
    return { success: false, error: "Cannot claim reward for an abandoned session" };
  }

  // 3. Fetch quest & verify ownership
  const quest = db.quests.get(session.quest_id);
  if (!quest || quest.user_id !== userId) {
    return { success: false, error: "Unauthorized quest or not found" };
  }

  // 4. Idempotency Check (Unique Constraint simulation)
  for (const re of db.reward_events.values()) {
    if (re.quest_id === quest.id || re.game_session_id === session.id) {
      return { success: false, error: "Reward has already been claimed for this quest." };
    }
  }

  // 5. Fetch Profile
  const profile = db.profiles.get(userId);
  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  // 6. Complete session & quest
  session.status = "completed";
  quest.status = "completed";

  // 7. Calculate rewards
  const reward = calculateQuestReward(quest.difficulty);
  const transition = calculateLevelTransition(profile.xp, reward.xp);
  const streak = calculateStreakUpdate(
    profile.current_streak,
    profile.longest_streak,
    profile.last_completed_date,
    "UTC",
    "2026-09-12"
  );
  const attrGain = calculateAttributeGain(quest.difficulty, profile.strength);

  // 8. Update Profile
  profile.xp = transition.newTotalXp;
  profile.level = transition.newLevel;
  profile.gold += reward.gold;
  profile.strength = attrGain.newValue;
  profile.current_streak = streak.currentStreak;
  profile.longest_streak = streak.longestStreak;
  profile.last_completed_date = streak.lastCompletedDate;

  // 9. Insert into reward_events
  const rewardEventId = `reward-${Date.now()}-${Math.random()}`;
  db.reward_events.set(rewardEventId, {
    id: rewardEventId,
    quest_id: quest.id,
    game_session_id: session.id,
    xp_amount: reward.xp,
  });

  return {
    success: true,
    reward: {
      xp: reward.xp,
      gold: reward.gold,
      progression: transition,
      streak,
    },
  };
}

// Case A: Abandoned session followed by successful session
const db1 = createMockDb();
// Session 1: Started and abandoned
db1.sessions.set("session-abandoned", {
  id: "session-abandoned",
  user_id: "user-1",
  quest_id: "quest-1",
  status: "abandoned",
});

// Attempting reward on abandoned session should fail
const resAbandoned = simulateRewardTransaction(db1, "user-1", "session-abandoned", true);
assert(resAbandoned.success === false, "Abandoned session reward rejected");

// Session 2: Fresh session launched for the same quest
db1.sessions.set("session-valid", {
  id: "session-valid",
  user_id: "user-1",
  quest_id: "quest-1",
  status: "active",
});

const resValid = simulateRewardTransaction(db1, "user-1", "session-valid", true);
assert(resValid.success === true, "Valid session after abandoned session succeeds");
assert(resValid.reward.xp === 40, "40 XP awarded");
assert(db1.profiles.get("user-1")!.xp === 40, "Profile XP updated to 40");
console.log("✓ Abandoned session followed by legitimate session works seamlessly.");

// Case B: Duplicate Completion / Double-Click / Race Condition
// Attempting to complete the same session or quest again MUST be rejected
const resDuplicate = simulateRewardTransaction(db1, "user-1", "session-valid", true);
assert(resDuplicate.success === false, "Duplicate completion attempt rejected");
assert(
  resDuplicate.error === "Reward has already been claimed for this quest.",
  "Correct idempotency error returned"
);
assert(db1.reward_events.size === 1, "Exactly one reward event exists in ledger");
assert(db1.profiles.get("user-1")!.xp === 40, "Profile XP remained 40 (no double award)");
console.log("✓ Duplicate completion and double-submit rejected by uniqueness ledger.");

// Case C: Unauthorized Quest / Other User's Quest
const db2 = createMockDb();
db2.sessions.set("session-other-user", {
  id: "session-other-user",
  user_id: "user-2", // Belongs to user-2
  quest_id: "quest-1",
  status: "active",
});

const resHacker = simulateRewardTransaction(db2, "user-1", "session-other-user", true);
assert(resHacker.success === false, "Cross-user session completion blocked");
console.log("✓ Ownership verification prevents unauthorized users from completing other sessions.");

// Case D: Refresh after reward / Network retry
// If the page refreshes, the quest is already completed, so attempting to replay or re-reward fails safely
const resRetry = simulateRewardTransaction(db1, "user-1", "session-valid", true);
assert(resRetry.success === false, "Network retry / page refresh rejected safely");
console.log("✓ Page refresh and network retry handled idempotently.");

console.log("\n===============================================================");
console.log("   >>> ALL PHASE 6 PROGRESSION & REWARD TESTS PASSED! <<<      ");
console.log("===============================================================\n");
