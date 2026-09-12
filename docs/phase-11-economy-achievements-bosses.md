# LIFEFORGE: Phase 11 — Rewards, Achievements & Boss Battles

Phase 11 completes the major gamification layer of LIFEFORGE, introducing three interconnected systems that turn real-life habit and quest completion into a tactile, rewarding RPG journey:
1. **Virtual Economy & Cosmetics Emporium**
2. **Server-Authoritative Achievements Engine**
3. **Real-Life Goal Boss Battles**

---

## Architecture Overview

```
                          ┌─────────────────────────────────────────────────┐
                          │             QUEST COMPLETION LEDGER             │
                          │   claim_quest_reward RPC / Fallback Transaction │
                          └──────────────────────┬──────────────────────────┘
                                                 │
                                                 │ triggers
                         ┌───────────────────────┴───────────────────────┐
                         ▼                                               ▼
         ┌───────────────────────────────┐               ┌───────────────────────────────┐
         │     ACHIEVEMENTS ENGINE       │               │      BOSS BATTLES ENGINE      │
         │ (user_achievements table)     │               │ (boss_battles table)          │
         │ - Evaluates real DB signals   │               │ - Matches quest category      │
         │ - Idempotent unlock insert    │               │ - Advances progress towards   │
         │ - 8 Milestone definitions     │               │   target_value (e.g. 10)      │
         │ - ON CONFLICT DO NOTHING      │               │ - Marks 'defeated' at target  │
         └───────────────────────────────┘               └───────────────┬───────────────┘
                                                                         │
                                                                         │ victory bounty
                                                                         ▼
                                                         ┌───────────────────────────────┐
                                                         │     ATOMIC BOUNTY CLAIM       │
                                                         │ claim_boss_reward RPC         │
                                                         │ - Validates 'defeated' status │
                                                         │ - reward_claimed = true       │
                                                         │ - Credits +250 XP, +100 Gold  │
                                                         │ - Unlocks 'boss_slayer'       │
                                                         └───────────────┬───────────────┘
                                                                         │
                                                                         │ accumulates Gold
                                                                         ▼
                                                         ┌───────────────────────────────┐
                                                         │      VIRTUAL SHOP & VAULT     │
                                                         │ (inventory_items table)       │
                                                         │ purchase_shop_item RPC        │
                                                         │ - Locks profile FOR UPDATE    │
                                                         │ - Validates gold >= price     │
                                                         │ - Prevents duplicate purchase │
                                                         │ - Zero client price trust     │
                                                         └───────────────────────────────┘
```

---

## 1. Virtual Economy & Shop

### How the Economy Works
- **Gold** is earned exclusively through verified quest completion (via server-side reward events) and boss defeat bounties.
- Players spend Gold in the in-world **Citadel Emporium** (`/shop`) to acquire prestige virtual cosmetic items:
  - `ember_frame` (100 Gold): Avatar frame of persistent fire
  - `scholar_sigil` (150 Gold): Sigil of accumulated study and focus
  - `warrior_crest` (175 Gold): Crest of relentless grit
  - `golden_flame` (200 Gold): Badge of an unbreakable streak
  - `forge_aura` (250 Gold): Rare atmospheric aura of an adept
  - `citadel_banner` (300 Gold): Legendary banner of citadel mastery
- Purchased cosmetics are stored permanently in the player's `inventory_items` collection and showcased in the Character sheet vault.

### How Purchases Are Secured
- **Zero Client Price Trust**: Item prices are hardcoded in the server catalog (`src/lib/economy/catalog.ts`) and checked via the PostgreSQL RPC `purchase_shop_item`. Any client-supplied price or parameter is ignored.
- **Race-Condition & Double-Spend Defense**: The purchasing transaction executes with PostgreSQL `SELECT gold FROM profiles WHERE user_id = auth.uid() FOR UPDATE`. This locks the row against concurrent balance changes.
- **No Negative Balances**: The database asserts `v_current_gold >= v_item_price` before executing `gold = gold - v_item_price`. Furthermore, `profiles.gold` is backed by a `CHECK (gold >= 0)` constraint.
- **Duplicate Prevention**: The `inventory_items` table has a `UNIQUE(user_id, item_key)` constraint. The RPC checks `IF EXISTS (SELECT 1 FROM inventory_items WHERE user_id = v_user_id AND item_key = p_item_key)` and rejects duplicate acquisitions.

---

## 2. Server-Authoritative Achievements

### How Achievements Are Detected
Rather than trusting client events, the engine evaluates real, persistent PostgreSQL records:
1. `first_quest`: Authenticated user has $\ge 1$ completed quest in `quests`.
2. `quest_hunter`: Authenticated user has $\ge 10$ completed quests.
3. `unbreakable`: Authenticated user has reached $\ge 7$ days in `profiles.current_streak`.
4. `forge_master`: Authenticated user has reached Level $\ge 5$ (derived via $\lfloor 100 \times \text{level}^{1.5} \rfloor$).
5. `level_ascended`: Authenticated user has reached Level $\ge 10$.
6. `night_owl`: Authenticated user has completed $\ge 1$ Nightly Camp plan in `nightly_plans`.
7. `adventurer`: Authenticated user has completed quests across $\ge 3$ distinct quest categories.
8. `boss_slayer`: Authenticated user has defeated $\ge 1$ boss battle in `boss_battles`.

### How Idempotency Works
- Achievements are stored in `public.user_achievements` with a unique constraint:
  ```sql
  CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_key)
  ```
- Unlocks are written using `ON CONFLICT (user_id, achievement_key) DO NOTHING`.
- A player can never receive the same achievement twice, nor can duplicate records exist in the ledger.

---

## 3. Real-Life Goal Boss Battles

### Mapping Boss Battles to Real Goals
Bosses in LIFEFORGE are not disconnected, RNG-based mini-game bosses; they represent **Major Real-Life Aspirations** (e.g., "The Portfolio Beast", "The Iron Colossus", "The Citadel Colossus").
- Each boss has a goal category (e.g., `productivity`, `fitness`, `learning`, or `all`).
- Progress is earned exclusively by completing real quests matching that category.

### Boss Progression Mechanics
- When a quest is completed, `advanceActiveBossesOnQuestCompletion` inspects active bosses for the user:
  - If `quest.category` matches `boss.goal_category` (or if `boss.goal_category == 'all'`), progress increases by 1.
  - Progress is capped at `target_value` via `Math.min(target_value, progress + 1)`.
  - When `progress == target_value`:
    - `status` transitions to `'defeated'`.
    - `defeated_at` is stamped with `now()`.
- **Client Manipulation Impossible**: Boss progress cannot be set by the client. The client can only trigger standard quest completion through authenticated game session validation.

### Single-Claim Victory Bounty
- When a boss is defeated, the player is invited to claim their victory bounty (+250 XP, +100 Gold).
- The `claim_boss_reward` RPC function locks the boss row `FOR UPDATE`, verifies `status = 'defeated'` and `reward_claimed = false`, and sets `reward_claimed = true`.
- It then updates `profiles.xp` and `profiles.gold` using the centralized non-linear formula $\lfloor 100 \times \text{level}^{1.5} \rfloor$ and unlocks the `boss_slayer` achievement.
- Any subsequent claim attempts are rejected immediately.

---

## 4. Row-Level Security (RLS) Matrix

| Table | SELECT Policy | INSERT Policy | UPDATE Policy | DELETE Policy |
| :--- | :--- | :--- | :--- | :--- |
| `inventory_items` | `auth.uid() = user_id` | `auth.uid() = user_id` | Denied | Denied |
| `user_achievements` | `auth.uid() = user_id` | `auth.uid() = user_id` | Denied | Denied |
| `boss_battles` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | Denied |

No user can read, query, update, or claim rewards belonging to another player.

---

## 5. Automated Verification Results

| Suite | Scope | Result | Assertions |
| :--- | :--- | :--- | :--- |
| `phase11_systems.test.ts` | Economy (1–7), Achievements (8–13), Bosses (14–20) | **PASSED** | 46 / 46 |
| `progression_engine.test.ts` | Phase 6 Progression Engine & Reward Ledger | **PASSED** | Full Suite |
| `evolution.test.ts` | Phase 7 Character Evolution Tiers | **PASSED** | Full Suite |
| `game_master.test.ts` | Phase 8 ARIA Contextual Motivations & Quiet Hours | **PASSED** | 33 / 33 |
| `nightly_camp.test.ts` | Phase 9 Nightly Camp Planning & Projections | **PASSED** | 35 / 35 |
| `adaptive_difficulty.test.ts` | Phase 10 Adaptive Difficulty Engine & 7-Day Signals | **PASSED** | 80 / 80 |
| `npm run build` | Next.js Turbopack Production Build | **PASSED** | 12 / 12 Routes |
