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

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log("=== RUNNING LIFEFORGE RPG PROGRESSION TEST SUITE ===\n");

// 1. NON-LINEAR LEVEL FORMULA TESTS
console.log("1. Testing Non-Linear Level Formula...");
assert(getXpRequiredForLevel(1) === 100, "Level 1 -> 2 requires 100 XP (floor(100 * 1^1.5))");
assert(getXpRequiredForLevel(2) === 282, "Level 2 -> 3 requires 282 XP (floor(100 * 2^1.5))");
assert(getXpRequiredForLevel(3) === 519, "Level 3 -> 4 requires 519 XP (floor(100 * 3^1.5))");
assert(getXpRequiredForLevel(4) === 800, "Level 4 -> 5 requires 800 XP (floor(100 * 4^1.5))");
assert(getXpRequiredForLevel(5) === 1118, "Level 5 -> 6 requires 1118 XP (floor(100 * 5^1.5))");
console.log("✓ getXpRequiredForLevel matches floor(100 * L^1.5) exactly.");

// 2. CUMULATIVE XP THRESHOLDS
console.log("2. Testing Cumulative XP Thresholds...");
assert(getCumulativeXpForLevel(1) === 0, "Level 1 cumulative is 0");
assert(getCumulativeXpForLevel(2) === 100, "Level 2 cumulative is 100");
assert(getCumulativeXpForLevel(3) === 382, "Level 3 cumulative is 382");
assert(getCumulativeXpForLevel(4) === 901, "Level 4 cumulative is 901");
assert(getCumulativeXpForLevel(5) === 1701, "Level 5 cumulative is 1701");
console.log("✓ Cumulative XP thresholds accurate.");

// 3. DERIVING LEVEL FROM TOTAL XP
console.log("3. Testing Level Derivation from Total Cumulative XP...");
assert(getLevelFromTotalXp(0) === 1, "0 XP is Level 1");
assert(getLevelFromTotalXp(99) === 1, "99 XP is Level 1");
assert(getLevelFromTotalXp(100) === 2, "100 XP reaches Level 2");
assert(getLevelFromTotalXp(381) === 2, "381 XP is Level 2");
assert(getLevelFromTotalXp(382) === 3, "382 XP reaches Level 3");
assert(getLevelFromTotalXp(900) === 3, "900 XP is Level 3");
assert(getLevelFromTotalXp(901) === 4, "901 XP reaches Level 4");
console.log("✓ getLevelFromTotalXp derives correct level without desync.");

// 4. XP OVERFLOW & MULTI-LEVEL JUMP TESTS
console.log("4. Testing XP Overflow & Multi-Level Jumps...");
const normalProgression = calculateLevelTransition(95, 50); // 95 XP + 50 XP = 145 XP
assert(normalProgression.previousLevel === 1, "Started at Level 1");
assert(normalProgression.newLevel === 2, "Advanced to Level 2");
assert(normalProgression.leveledUp === true, "Leveled up detected");
assert(normalProgression.levelsGained === 1, "Gained 1 level");
assert(normalProgression.progressAfter.xpIntoCurrentLevel === 45, "XP overflow into Level 2 is 45 XP (145 - 100)");
assert(normalProgression.progressAfter.xpRemaining === 237, "XP remaining to Level 3 is 237 (282 - 45)");

// Huge multi-level jump: Level 1 with 0 XP gets 1000 XP
const megaJump = calculateLevelTransition(0, 1000);
assert(megaJump.previousLevel === 1, "Started at Level 1");
assert(megaJump.newLevel === 4, "1000 XP reaches Level 4 (threshold is 901)");
assert(megaJump.leveledUp === true, "Leveled up detected");
assert(megaJump.levelsGained === 3, "Gained 3 levels");
assert(megaJump.progressAfter.xpIntoCurrentLevel === 99, "99 XP into Level 4 (1000 - 901)");
console.log("✓ XP overflow preserves all excess XP seamlessly across single and multiple level jumps.");

// 5. REWARDS CALCULATION TESTS
console.log("5. Testing Rewards Engine...");
const easyReward = calculateQuestReward("easy");
assert(easyReward.xp === 20 && easyReward.gold === 8 && easyReward.attributeGain === 1, "Easy rewards: 20 XP, 8 Gold, +1 Attr");

const normalReward = calculateQuestReward("normal");
assert(normalReward.xp === 40 && normalReward.gold === 18 && normalReward.attributeGain === 1, "Normal rewards: 40 XP, 18 Gold, +1 Attr");

const hardReward = calculateQuestReward("hard");
assert(hardReward.xp === 80 && hardReward.gold === 40 && hardReward.attributeGain === 2, "Hard rewards: 80 XP, 40 Gold, +2 Attr");

const epicReward = calculateQuestReward("epic");
assert(epicReward.xp === 180 && epicReward.gold === 100 && epicReward.attributeGain === 3, "Epic rewards: 180 XP, 100 Gold, +3 Attr");

// Attribute capping test
const cappedAttr = calculateAttributeGain("epic", 99);
assert(cappedAttr.newValue === 100, "Attribute capped at 100 (99 + 3 -> 100)");
assert(cappedAttr.gain === 1, "Actual gain was 1 due to cap");
assert(cappedAttr.isCapped === true, "isCapped flag set");

// Category mapping test
assert(resolveQuestAttribute("learning") === "intellect", "Learning -> Intellect");
assert(resolveQuestAttribute("fitness") === "strength", "Fitness -> Strength");
assert(resolveQuestAttribute("productivity") === "focus", "Productivity -> Focus");
assert(resolveQuestAttribute("personal") === "discipline", "Personal -> Discipline");
assert(resolveQuestAttribute("social") === "energy", "Social -> Energy");
console.log("✓ Rewards calculation, attribute mapping, and cap (100) verified.");

// 6. STREAK ENGINE TESTS
console.log("6. Testing Streak Engine...");
// First completion ever
const streak1 = calculateStreakUpdate(0, 0, null, "UTC", "2026-09-12");
assert(streak1.currentStreak === 1 && streak1.longestStreak === 1, "First completion sets streak to 1");
assert(streak1.isStreakExtended === true && streak1.isNewRecord === true, "First completion flags new record");

// Second completion on same day
const streakSameDay = calculateStreakUpdate(1, 1, "2026-09-12", "UTC", "2026-09-12");
assert(streakSameDay.currentStreak === 1, "Same day completion does NOT increment streak");
assert(streakSameDay.isStreakExtended === false, "Not extended on same day");

// Third completion on consecutive day
const streakNextDay = calculateStreakUpdate(1, 1, "2026-09-12", "UTC", "2026-09-13");
assert(streakNextDay.currentStreak === 2, "Consecutive day increments streak to 2");
assert(streakNextDay.longestStreak === 2, "Longest streak updated to 2");
assert(streakNextDay.isStreakExtended === true && streakNextDay.isNewRecord === true, "New record on consecutive day");

// Completion after missing 2 days
const streakMissedDay = calculateStreakUpdate(5, 7, "2026-09-10", "UTC", "2026-09-13");
assert(streakMissedDay.currentStreak === 1, "Missed day resets current streak to 1");
assert(streakMissedDay.longestStreak === 7, "Longest streak remains preserved at 7");
assert(streakMissedDay.isNewRecord === false, "Not a new record");

// Calendar difference tests
assert(getCalendarDayDifference("2026-09-13", "2026-09-12") === 1, "1 day difference");
assert(getCalendarDayDifference("2026-09-12", "2026-09-12") === 0, "0 day difference");
assert(getCalendarDayDifference("2026-10-01", "2026-09-30") === 1, "Month boundary difference is 1");
console.log("✓ Streak engine correctly handles same day, consecutive day, missed days, and month boundaries.");

console.log("\n>>> ALL LIFEFORGE RPG TESTS PASSED SUCCESSFULLY! <<<\n");
