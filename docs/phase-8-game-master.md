# LIFEFORGE — Phase 8: Game Master & Notification Foundation Architectural Guide

This document provides a comprehensive technical breakdown of the **LIFEFORGE Game Master** (ARIA) and the in-app contextual motivation and notification engine built in Phase 8.

---

## 1. Role of the Game Master in LIFEFORGE

In traditional productivity applications, task managers act as passive lists: static databases that wait for user input and apply anxiety-inducing red badges when deadlines lapse.

In **LIFEFORGE**, the **Game Master (ARIA — Adaptive Realm Intelligence Assistant)** is the player's personal companion, dungeon master, and tactical advisor. ARIA's role is:
1. **Contextual Presence**: Continually evaluate the player's real-life progression state (time of day, current streak momentum, active quests, and completed triumphs).
2. **Constructive Guidance**: Deliver timely, non-shaming, constructive encouragement that reframes goals as engaging RPG trials.
3. **Pacing and Flow**: Help the player prioritize their immediate next trial ("What should I do right now?") without overwhelming them with cognitive friction.
4. **Citadel Dispatch System**: Manage the server-authoritative notification channel to deliver meaningful alerts (streak defense, morning dawn briefing, twilight victory reviews) while respecting user boundaries and restful quiet hours.

---

## 2. Context Signals Evaluated

The Game Master does not invent data or use synthetic simulations. It evaluates verified, server-authoritative signals from PostgreSQL:

| Signal | Source | Purpose |
| :--- | :--- | :--- |
| **Local Hour** (`localHour`) | User's configured timezone (`Intl.DateTimeFormat`) | Governs dawn (`morning`), noon (`midday`), twilight (`evening`), and nighttime phases. |
| **Total Quests Today** (`questsToday`) | `quests` table (`scheduled_date = today`) | Measures total trials planned for the player's day. |
| **Completed Quests Today** (`completedToday`) | `quests` table (`status = 'completed'`) | Tracks real accomplishments and milestone momentum. |
| **Remaining Quests** (`remainingQuests`) | `questsToday - completedToday` | Determines whether the player has active objectives. |
| **Current Streak** (`currentStreak`) | `profiles.current_streak` | Evaluates streak preservation risks and momentum defense. |
| **Longest Streak** (`longestStreak`) | `profiles.longest_streak` | Provides historical milestone perspective. |
| **Player Level & XP** (`level`, `xp`) | `profiles` table | Contextualizes progression tier and attribute mastery. |
| **Primary Goals** (`goals`) | `profiles.primary_goals` | Reflects the player's core identity forged during discovery. |
| **Strongest Attributes** | `profiles` attributes | Identifies dominant attributes (Strength, Intellect, Focus, etc.). |

---

## 3. How Advice is Generated

Advice generation is handled deterministically via a dedicated pipeline:

```
+-----------------------------------------------------------------------------------+
|                           LIFEFORGE GAME MASTER PIPELINE                          |
+-----------------------------------------------------------------------------------+

   +--------------------------+
   |   PostgreSQL Database    |
   | (profiles, quests, etc.) |
   +------------+-------------+
                |
                v
   +--------------------------+
   |  Server Action Aggregator |  (actions/game-master.ts)
   | - Derives user timezone  |
   | - Calculates localHour   |
   | - Collects today metrics |
   +------------+-------------+
                |
                v
   +--------------------------+
   |     Context Detector     |  (lib/game-master/detector.ts)
   | - Evaluates state rules  |  -> Outputs: GameMasterContext
   | - Priority weighting     |     ('streak_at_risk', 'morning', etc.)
   +------------+-------------+
                |
                v
   +--------------------------+
   |    GameMasterProvider    |  (lib/game-master/provider.ts)
   | - RuleBased implementation|
   | - AI-ready interface     |  -> Generates: GameMasterMessage
   | - Curated templates      |     (title, message, action, priority)
   +------------+-------------+
                |
        +-------+---------------------------------------+
        |                                               |
        v                                               v
+-------------------------------+       +-------------------------------+
|       GameMasterCard          |       |     Rules Engine Evaluator    |
| (Interactive Companion Widget |       | - Quiet hours (time wrap)     |
|  rendered on /dashboard)      |       | - Daily limits (max 3/day)    |
+-------------------------------+       | - Deduplication (same day)    |
                                        +---------------+---------------+
                                                        | (If eligible)
                                                        v
                                        +-------------------------------+
                                        |    PostgreSQL Notifications   |
                                        | - Stored server-side          |
                                        | - Rendered in AppNavbar bell  |
                                        +-------------------------------+
```

1. **Context Detection (`detectGameMasterContext`)**: Prioritized rule evaluation:
   - If `questsToday === 0` $\rightarrow$ `"no_quests"`
   - If `currentStreak > 0 && completedToday === 0 && localHour >= 17` $\rightarrow$ `"streak_at_risk"`
   - If `localHour >= 18 && (remainingQuests === 0 || completedToday >= 2)` $\rightarrow$ `"evening_review"`
   - If `completedToday >= 2 || ratio >= 0.5` $\rightarrow$ `"good_progress"`
   - If `completedToday >= 1 && remainingQuests > 0` $\rightarrow$ `"quest_completed"`
   - If `localHour >= 5 && localHour < 12 && completedToday === 0` $\rightarrow$ `"morning"`
   - If `localHour >= 12 && localHour < 17 && remainingQuests > 0` $\rightarrow$ `"midday_progress"`
   - If `localHour >= 15 && completedToday === 0 && questsToday > 0` $\rightarrow$ `"low_progress"`
   - If `remainingQuests > 0` $\rightarrow$ `"upcoming_quest"`
   - Else fallback $\rightarrow$ `"inactive"`
2. **Template Synthesis**: Selects constructive copy from `GAME_MASTER_MESSAGES`, interpolating dynamic data (e.g. current streak, remaining count) with actionable links (`actionLabel`, `actionHref`).

---

## 4. How Notifications are Delivered

Phase 8 introduces **In-App Citadel Notifications**:
1. **Persistent Notification Ledger**: Notifications are stored in the PostgreSQL `notifications` table.
2. **Bell Trigger in `AppNavbar`**: A gold-gilded dispatch bell indicates unread counts with a glowing pulsing counter.
3. **Citadel Dispatches Slide-Out / Modal**: Clicking the bell opens an in-app drawer displaying:
   - Type-specific RPG sigils (`Flame` for streak alerts, `Sword` for quest reminders, `Compass` for ARIA tips).
   - Unread indicator dots.
   - Deep links directly to the relevant quest or character view.
   - One-click "Mark all read" and individual read toggles.
4. **Real-Time Client State**: Optimistically updates read status while synchronizing with server actions (`markNotificationReadAction`, `markAllNotificationsReadAction`).

---

## 5. Quiet Hours and Daily Limits Enforcement

To prevent burnout and respect rest, notifications are strictly governed by server-side policy:
1. **Timezone-Aware Time Translation**: The system formats current UTC time into the player's local timezone format (`"HH:MM"`).
2. **Overnight Window Wrapping**: Quiet hours frequently span midnight (e.g., `22:00` to `07:00`). The evaluator accounts for this:
   ```typescript
   if (start < end) {
     return current >= start && current < end;
   } else {
     return current >= start || current < end; // Overnight wrap
   }
   ```
3. **Server-Enforced Daily Limits**: Default maximum of 3 notifications per calendar day (`max_daily_notifications`). Before inserting any notification, the server runs an exact count of notifications created on or after `todayStartIso`. If the count is $\ge$ limit, generation is blocked.

---

## 6. Duplicate Notification Prevention & Idempotency

Spamming repeated notifications degrades trust. Phase 8 implements calendar-date deduplication:
1. When evaluating a notification of type $T$ on calendar date $D$, the system queries:
   ```sql
   SELECT id FROM notifications 
   WHERE user_id = :userId 
     AND type = :type 
     AND created_at >= :todayStartIso 
   LIMIT 1;
   ```
2. If an alert of that type already exists for today, `evaluateNotificationEligibility` returns:
   ```typescript
   { allowed: false, reason: "duplicate_today" }
   ```
3. This guarantees that a player receives at most **one** streak warning or **one** morning dispatch per calendar day.

---

## 7. Notification Preferences System

Players maintain complete control over their dispatch channel via the `notification_preferences` table:
- **Master Toggle (`enabled`)**: Immediately disables all in-app notifications if turned off.
- **Quiet Hours Toggle (`quiet_hours_enabled`)**: Enables/disables nocturnal silence.
- **Quiet Hours Time Pickers (`quiet_hours_start`, `quiet_hours_end`)**: Defaults to `22:00` and `07:00`.
- **Daily Max Slider (`max_daily_notifications`)**: Range from 1 to 10 per day.
- **Category Switches**:
  - `streak_alerts`: Streak defense warnings.
  - `quest_reminders`: Upcoming quest alerts.
  - `aria_tips`: ARIA Game Master guidance and tips.

Changes are persisted through the `updateNotificationPreferencesAction` server action with full RLS protection.

---

## 8. Provider Abstraction for Future AI Integration

The system adheres to the Dependency Inversion Principle. The Game Master interface is decoupled from its implementation:

```typescript
export interface GameMasterProvider {
  generateMessage(context: GameMasterContextData): Promise<GameMasterMessage>;
}
```

In Phase 8:
- `RuleBasedGameMasterProvider` implements this contract deterministically.
In a future phase:
- An `AIGameMasterProvider` (powered by Google Gemini, Claude, or OpenAI) can implement the exact same interface:
  ```typescript
  export class LLMGameMasterProvider implements GameMasterProvider {
    async generateMessage(context: GameMasterContextData): Promise<GameMasterMessage> {
      // Call LLM with context data and system prompt...
    }
  }
  ```
Because `getGameMasterAdviceAction` interacts solely with `GameMasterProvider`, swapping providers requires zero changes to the UI, notification rules, or database.

---

## 9. Tone Guidelines: What ARIA Must Say vs. Never Say

ARIA's voice is inspired by wise fantasy companions and mentors (e.g., Deckard Cain, Athena, Uncle Iroh).

### What ARIA Says:
- **Affirming & Constructive**: Focuses on next small steps, momentum, and agency.
- **RPG Grounded**: Uses thematic language (*trials, momentum, the citadel, the forge, attributes*).
- **Graceful in Inactivity**: Offers small starts rather than demanding perfection ("Pick the simplest task to break inertia").

### What ARIA NEVER Says:
- **No Shaming or Guilt-Tripping**: Never uses words like *"You failed"*, *"You were lazy"*, *"Disappointing"*, *"Why haven't you finished?"*.
- **No Medical or Psychological Claims**: Never provides clinical diagnoses, burnout treatments, psychiatric advice, or personality classifications. ARIA is strictly an RPG productivity companion.
- **No Aggressive Urgency**: Avoids all-caps panic or stress-inducing warnings.

---

## 10. Database Schema

### `notifications` Table
```sql
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(32) NOT NULL CHECK (type IN ('streak_alert', 'quest_reminder', 'progression', 'aria_guidance', 'system')),
  title VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  action_label VARCHAR(64),
  action_url VARCHAR(255),
  read BOOLEAN NOT NULL DEFAULT FALSE,
  priority VARCHAR(16) NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `notification_preferences` Table
```sql
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  quiet_hours_start VARCHAR(5) NOT NULL DEFAULT '22:00',
  quiet_hours_end VARCHAR(5) NOT NULL DEFAULT '07:00',
  max_daily_notifications INTEGER NOT NULL DEFAULT 3 CHECK (max_daily_notifications >= 1 AND max_daily_notifications <= 10),
  streak_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  quest_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  aria_tips BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 11. Security & Authorization

1. **Row-Level Security (RLS)**: Both tables have RLS enabled.
   - `SELECT`, `UPDATE`, `INSERT`, `DELETE` on `notifications` require `auth.uid() = user_id`.
   - `SELECT`, `UPDATE`, `INSERT` on `notification_preferences` require `auth.uid() = user_id`.
2. **Server-Authoritative Evaluation**: The browser client cannot forge notification creation or bypass quiet hours. Creation logic resides in Server Actions where `user.id` is derived from verified Supabase session cookies.

---

## 12. Why Rule-Based First?

Starting with a deterministic, rule-based Game Master before introducing large language models yields vital architectural advantages:
1. **Deterministic Correctness**: Rules guarantee that edge cases (overnight quiet hours, streak risk at 17:00, zero-quest states) are tested and verified without hallucinations.
2. **Sub-Millisecond Latency**: Local rule evaluation executes instantaneously without third-party API latency or rate limits.
3. **Zero Financial Overhead**: Eliminates recurring LLM token costs during core development.
4. **Baseline for Evaluation**: Provides an unambiguous baseline against which future AI models can be measured for prompt fidelity, response time, and tone adherence.
