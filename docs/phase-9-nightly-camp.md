# LIFEFORGE — Phase 9: Nightly Camp & Tomorrow Planning Architectural Guide

This document provides a comprehensive technical breakdown of the **LIFEFORGE Nightly Camp** and tomorrow planning engine built in Phase 9.

---

## 1. Role of Nightly Camp in LIFEFORGE

In conventional task trackers, the end of the day is often stressful: uncompleted tasks turn red, notifications scold the user, and overdue badges accumulate, inducing procrastination and anxiety.

In **LIFEFORGE**, the day ends at **Nightly Camp**:
1. **Thematic Sanctuary**: A serene, peaceful resting ground under the stars where the player gathers by the campfire.
2. **Review & Reflect**: Celebrate real accomplishments (quests conquered, XP gained, gold acquired, streak preserved) using verified PostgreSQL data.
3. **Graceful Trial Handling**: Unfinished quests are handled with supportive language (*"Not every quest needs to be conquered today"*). The player can effortlessly move them to tomorrow or reschedule them without penalty.
4. **Tomorrow's Preparation**: Plan tomorrow's quest load, choose tomorrow's overarching adventure intensity (`EASY`, `NORMAL`, `CHALLENGE`), and commit the plan to the citadel archives.
5. **Restful Closure**: With tomorrow planned, the player rests with a clear mind: *"Tomorrow's adventure starts tonight."*

---

## 2. Nightly Camp Architecture Pipeline

```
+-----------------------------------------------------------------------------------+
|                        LIFEFORGE NIGHTLY CAMP ARCHITECTURE                        |
+-----------------------------------------------------------------------------------+

   +-------------------------------------------------------------+
   |                      PostgreSQL Database                    |
   |  - profiles (bedtime, timezone, streak, level, xp, gold)    |
   |  - quests (scheduled_date, status, category, difficulty)    |
   |  - reward_events (xp_amount, gold_amount, created_at)      |
   |  - game_sessions (duration_seconds, status, created_at)     |
   |  - nightly_plans (user_id, plan_date, target_date, diff)    |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                Server Action Aggregator                     |
   |              (actions/nightly-camp.ts)                      |
   |  - Derives todayDateStr & tomorrowDateStr in user timezone  |
   |  - Segregates today quests -> completed vs unfinished       |
   |  - Gathers tomorrow quests (scheduled_date = tomorrow)      |
   |  - Sums real today XP/Gold & session focus minutes          |
   |  - Computes tomorrow projected XP & duration                |
   |  - Checks bedtime window (isBedtimeWindow)                  |
   |  - Assembles ARIA Campfire Message                          |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                  /nightly-camp Server Page                  |
   |                   (app/nightly-camp/page.tsx)               |
   +------------------------------+------------------------------+
                                  |
                                  v
   +-------------------------------------------------------------+
   |                      NightlyCampView                        |
   |  +-------------------------------------------------------+  |
   |  | ARIA Campfire Counsel (CampAriaCompanion)             |  |
   |  +-------------------------------------------------------+  |
   |  | Step 1: Today's Adventure Review & Unfinished Trials  |  |
   |  |   [Move to Tomorrow]  [Edit]  [Remove]                |  |
   |  +-------------------------------------------------------+  |
   |  | Step 2: Tomorrow's Board & Overall Difficulty Plan    |  |
   |  |   [+ Add Quest via ForgeQuestModal]                   |  |
   |  |   [EASY]  [NORMAL]  [CHALLENGE]                       |  |
   |  |   Expected Projections: X Quests | ~Y min | +Z XP     |  |
   |  |   CTA: [FORGE TOMORROW]                               |  |
   |  +-------------------------------------------------------+  |
   +-------------------------------------------------------------+
```

---

## 3. Why Planning is Persisted Relational in the Database

Rather than storing tomorrow's planned quests as an isolated JSON blob, LIFEFORGE reuses the relational `public.quests` table:
1. **Single Source of Truth**: When tomorrow arrives, quests scheduled with `scheduled_date = tomorrowDate` automatically appear on the main `/dashboard` World Command Center.
2. **Seamless Transition**: Moving an unfinished quest from today to tomorrow is simply an `UPDATE quests SET scheduled_date = :tomorrowDate` query with strict user ownership validation.
3. **`public.nightly_plans` Table**:
   - Stores the high-level plan metadata: target date, overall adventure intensity (`easy`, `normal`, `challenge`), completion status, and personal reflection.
   - Enforces a unique constraint: `UNIQUE (user_id, target_date)`, ensuring clean upserts and idempotency.

---

## 4. How Tomorrow's Date is Handled

Because players reside in different timezones and daylight savings shifts can distort timestamp calculations, calendar math is handled strictly on calendar date strings (`YYYY-MM-DD`):
```typescript
export function getNextCalendarDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + 1));
  return nextDate.toISOString().split("T")[0];
}
```
This guarantees exact consecutive calendar days (e.g. `2026-09-12` $\rightarrow$ `2026-09-13`, or `2026-02-28` $\rightarrow$ `2026-03-01`), completely immune to UTC timestamp offsets.

---

## 5. Configurable Bedtime & Timezone Handling

1. **User Bedtime Field**: Stored in `profiles.bedtime VARCHAR(5) NOT NULL DEFAULT '22:30'`.
2. **Regex Validation**: Checked by PostgreSQL constraint: `CHECK (bedtime ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')`.
3. **Bedtime Window Detection (`isBedtimeWindow`)**:
   - Evaluates player's current local time in their configured timezone (`profile.timezone`).
   - Active when within 60 minutes before bedtime, up to 180 minutes after bedtime, or in the evening ($\ge$ 20:00).
   - Informs the ambient invitation banner on the `/dashboard` world center.
   - **No Artificial Lockout**: Nightly Camp remains accessible 24/7 so players can plan early if desired.

---

## 6. How Unfinished Quests are Moved

When a player clicks **"Move to Tomorrow"** on an incomplete quest:
1. `moveQuestToTomorrowAction(questId, tomorrowDateStr)` executes server-side.
2. Verified session retrieves `auth.uid()`.
3. Queries `quests` where `id = questId AND user_id = auth.uid()`.
4. Updates `scheduled_date = tomorrowDateStr` and updates timestamp.
5. Path caches are revalidated (`/nightly-camp`, `/dashboard`, `/quests`).
6. Zero attribute changes, XP resets, or data losses occur.

---

## 7. How Expected XP is Calculated

The expected load card aggregates tomorrow's scheduled quests:
- **Expected XP**: $\sum \text{quest.xp\_reward}$
- **Estimated Duration**: $\sum \text{quest.estimated\_duration}$
- **Expected Gold**: $\sum \text{quest.gold\_reward}$

### Transparent Projections vs Real Rewards
These values are explicitly labeled as **projections**. Saving tomorrow's plan awards **0 XP and 0 Gold**. Rewards are earned exclusively in Phase 6/5 when the player launches and completes the activity mini-game in real life tomorrow.

---

## 8. Tomorrow Adventure Intensity

The player selects an overarching tone for tomorrow:
- **EASY**: *"A lighter adventure. Focus on consistency and light steps."*
- **NORMAL**: *"A balanced day of progress and purposeful growth."*
- **CHALLENGE**: *"Push your limits. Take on ambitious quests and test your mettle."*

This preference is stored in `nightly_plans.difficulty`. It does not alter Phase 6 core leveling formulas, maintaining progression integrity.

---

## 9. ARIA Campfire Integration

ARIA acts as a gentle, encouraging mentor:
- Evaluates real metrics: `completedCount`, `unfinishedCount`, and `currentStreak`.
- Produces comforting reflections:
  - If all quests completed: Celebrates flawless discipline and streak preservation.
  - If partial quests completed: Affirms victories and encourages rest.
  - If quiet day: Emphasizes renewal, pacing, and fresh starts without guilt or shame.
- Operates under strict non-shaming rules; zero clinical or psychiatric claims.
- Never makes autonomous modifications to the player's quest board; the player remains in full control.

---

## 10. Security & Authorization

1. **Row Level Security (RLS)**:
   - `public.nightly_plans`: RLS policies enforce `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE.
   - `public.quests`: RLS policies restrict all mutations to the quest owner.
2. **Server Action Validation**:
   - `user_id` is derived exclusively from cryptographically verified Supabase session cookies (`supabase.auth.getUser()`).
   - Inputs are validated for format (`YYYY-MM-DD`, `HH:MM`, allowed difficulty enums).
   - Tampered payloads are rejected with clear error feedback.
