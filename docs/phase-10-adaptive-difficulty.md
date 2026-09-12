# LIFEFORGE — Phase 10: Adaptive Difficulty Engine Architectural Guide

This document provides an in-depth, beginner-friendly technical guide to the **Adaptive Difficulty Engine** built in Phase 10 of LIFEFORGE.

---

## 1. What is Adaptive Difficulty in LIFEFORGE?

In conventional productivity and habit apps, goals remain static or arbitrary: you are expected to do the exact same workload every day regardless of whether you are in an unstoppable flow state or accumulating a mountain of unfinished tasks.

In **LIFEFORGE**, the **Adaptive Difficulty Engine** acts as an empathetic RPG game master. It answers a vital question before tomorrow begins:

> *"Is my current quest load too easy, balanced, or too demanding?"*

The system recommends one of three intuitive directions:
- **LIGHTER**: When recent trials have been overwhelming, completion rates dip, or unfinished quests pile up. Suggests focusing on 1–2 key trials or choosing `Easy` intensity to protect your streak.
- **BALANCED**: When you are in a steady, sustainable cadence with healthy completion rates (60%–84%). Suggests maintaining your current pace.
- **HARDER**: When your discipline is exceptional ($\ge 85\%$ completion rate across multiple trials with an active streak). Invites you to take on `Challenge` intensity or tackle higher-tier trials.
- **ESTABLISHING RHYTHM**: When fewer than 3 trials have been recorded in the past 7 days, welcoming the player without rushing to conclusions.

---

## 2. Architecture & Pipeline

```
+-----------------------------------------------------------------------------------+
|                    LIFEFORGE ADAPTIVE DIFFICULTY PIPELINE                         |
+-----------------------------------------------------------------------------------+

   +-------------------------------------------------------------+
   |                      PostgreSQL Database                    |
   |  - quests (scheduled_date, status, difficulty, duration)    |
   |  - game_sessions (duration_seconds, status, created_at)     |
   |  - profiles (current_streak, timezone)                      |
   +------------------------------+------------------------------+
                                  |
                                  | (Scoped strictly to auth.uid())
                                  v
   +-------------------------------------------------------------+
   |                Server Action Aggregator                     |
   |                  (actions/adaptive.ts)                      |
   |  - Derives 7-day rolling window in user's timezone          |
   |  - Queries verified quests and game sessions                |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                Signals Computation Module                   |
   |                (lib/adaptive/signals.ts)                    |
   |  Calculates real metrics:                                   |
   |  - completionRate (0.0 to 1.0)                              |
   |  - avgQuestsPerDay (quests / 7)                             |
   |  - unfinishedQuests count                                   |
   |  - avgDailyMinutes logged in arenas                         |
   |  - difficultyDistribution (easy, normal, hard, epic)        |
   |  - hasSufficientData (totalQuests >= 3)                     |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                Rules Evaluation Engine                      |
   |                 (lib/adaptive/rules.ts)                     |
   |  - Evaluates deterministic, explainable thresholds          |
   |  - Formulates direction, confidence, title, and copy        |
   |  - Builds human-readable "Why" reasoning bullet points      |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                   AdaptiveGuidanceCard                      |
   |            (components/adaptive/AdaptiveGuidanceCard.tsx)    |
   |  - Mounted in /nightly-camp between Step 1 and Step 2       |
   |  - Direction Badge (Lighter, Balanced, Harder)              |
   |  - Real Metrics Strip (Completion %, Cadence, Streak)       |
   |  - Expandable "Why am I seeing this?" Section               |
   |  - "Adjust Tomorrow's Plan" Action Link                     |
   +-------------------------------------------------------------+
```

---

## 3. What Signals are Evaluated?

The engine never estimates from guesswork or fabricated data. It computes verified metrics over the player's past 7 calendar days:

| Signal | Source | Purpose |
| :--- | :--- | :--- |
| **Completion Rate** | `completedQuests / totalQuests` | Measures what proportion of scheduled trials the player actually conquered. |
| **Average Quests Per Day** | `totalQuests / 7` | Measures daily quest volume and detects fatigue or overload. |
| **Unfinished Quests** | `totalQuests - completedQuests` | Detects backlog accumulation across the week. |
| **Active Focus Time** | `game_sessions.duration_seconds` | Reflects real minutes logged in mini-game activity sessions. |
| **Current Streak** | `profiles.current_streak` | Informs momentum preservation. A high streak warrants protection against burnout. |
| **Difficulty Distribution** | `quests.difficulty` | Identifies whether the player's quests are Easy, Normal, Hard, or Epic. |
| **Data Sufficiency** | `totalQuests >= 3` | Flags whether enough history exists to make confident recommendations. |

---

## 4. How the Scoring Rules Work

The engine evaluates simple, deterministic rules:

### Rule 1: Insufficient Data
- **Condition**: `totalQuests < 3` in the 7-day window.
- **Direction**: `balanced` (Confidence: `low`).
- **Explanation**: Welcomes the player with *"ARIA is Learning Your Rhythm"*, advising a steady pace while finding their stride.

### Rule 2: Lighter Load
- **Condition**: `completionRate < 60%` OR `unfinishedQuests >= 4` OR `avgQuestsPerDay > 6.0`.
- **Direction**: `lighter` (Confidence: `high`).
- **Explanation**: Suggests *"A Breath for Recovery"*. Recommends focusing on 1–2 key trials or selecting `Easy` intensity to protect streak momentum and avoid burnout.

### Rule 3: Harder Load (Ready for Challenge)
- **Condition**: `completionRate >= 85%` AND `completedQuests >= 4` AND `currentStreak >= 2` AND `avgQuestsPerDay < 6.0`.
- **Direction**: `harder` (Confidence: `high`).
- **Explanation**: Celebrates exceptional discipline with *"Ready for Greater Glory"*. Recommends adding a `Hard` or `Epic` trial, or choosing `Challenge` intensity at camp.

### Rule 4: Balanced Cadence
- **Condition**: Steady completion (60%–84%) with manageable daily volume.
- **Direction**: `balanced` (Confidence: `medium`).
- **Explanation**: Affirms sustainable pacing with *"In Sustainable Cadence"*, advising maintaining the current workload.

---

## 5. Why Rule-Based Instead of ML / LLMs?

1. **Deterministic & Explainable**: When a user clicks *"Why am I seeing this?"*, the system can state the exact reasons (e.g. `"Recent completion rate is 42%"`, `"5 unfinished quests accumulated"`). A black-box neural network cannot provide this clarity.
2. **Zero Hallucinations**: Rules never invent statistics, hallucinate non-existent quests, or confuse dates.
3. **Sub-Millisecond Latency**: Local mathematical evaluations take less than 1 millisecond, introducing zero lag to Nightly Camp.
4. **Zero Token Costs & Zero API Dependencies**: No third-party network calls, subscription fees, or rate limits.

---

## 6. Player Agency & Security Guarantees

- **Recommendation-Only Invariant**: The engine **never** autonomously creates quests, deletes quests, changes difficulties, or alters goals. The player retains complete control.
- **Zero Reward Invariant**: Consulting Adaptive Guidance awards **strictly 0 XP and 0 Gold**. Rewards remain exclusive to completing real-life activities through mini-game sessions.
- **Zero Clinical / Medical Claims**: The system never uses psychiatric, diagnostic, or clinical terminology (e.g., no mention of "burnout", "ADHD", "depression", or "mental health"). It focuses purely on quest pacing and game progression.
- **Row-Level Security**: Server actions derive `user.id` from cryptographically verified Supabase auth session cookies. No client can query or manipulate another player's signals.
