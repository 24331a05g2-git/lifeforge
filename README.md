# LIFEFORGE

> "Forge the life you want to live."

LIFEFORGE is a production-grade, full-stack Life RPG productivity application built with Next.js 16 (App Router & Turbopack), React 19, TypeScript, Tailwind CSS, and Supabase / PostgreSQL.

Rather than another generic SaaS task checklist, LIFEFORGE turns real-life goals, routines, and daily actions into a tactile, living RPG adventure. Your habits build character attributes, your tasks are quests, your major aspirations are boss battles, and every completed day is another level forged in fire.

---

## Table of Contents
1. [Overview](#1-overview)
2. [Core Concept](#2-core-concept)
3. [Features](#3-features)
4. [RPG Progression](#4-rpg-progression)
5. [Quest System](#5-quest-system)
6. [Activity Mini-Games](#6-activity-mini-games)
7. [Game Master](#7-game-master)
8. [Nightly Camp](#8-nightly-camp)
9. [Adaptive Difficulty](#9-adaptive-difficulty)
10. [Economy / Shop](#10-economy--shop)
11. [Achievements](#11-achievements)
12. [Boss Battles](#12-boss-battles)
13. [Tech Stack](#13-tech-stack)
14. [Architecture](#14-architecture)
15. [Security](#15-security)
16. [Database](#16-database)
17. [Local Development](#17-local-development)
18. [Environment Variables](#18-environment-variables)
19. [Deployment](#19-deployment)
20. [Demo Flow](#20-demo-flow)
21. [Project Structure](#21-project-structure)
22. [Testing](#22-testing)

---

## 1. Overview
LIFEFORGE was designed to solve the chronic engagement drop-off of traditional productivity tools. By marrying server-authoritative RPG progression mechanics with genuine task management, LIFEFORGE provides intrinsic and extrinsic motivational feedback loops while maintaining zero-trust server security.

- **URL**: `http://localhost:3000` (Default local)
- **Engine**: Server-authoritative PostgreSQL with Row-Level Security (RLS)
- **Aesthetic**: Deep obsidian fantasy UI (`#07080B`), glowing amber/gold accents, custom Cinzel typography, and particle effects.

---

## 2. Core Concept
- **The Player**: An adventurer who awakens in the citadel through a 10-question **Character Discovery Ritual**, assigning an Archetype (*The Vanguard*, *The Strategist*, *The Scholar*, etc.) and foundational attributes.
- **The Journey**: Daily real-world duties become **Quests**. Completing quests through focused mini-game arenas grants XP, Gold, and attribute gains.
- **The Living World**: A contextual Game Master companion (**ARIA**) provides encouragement, quiet-hours awareness, and adaptive difficulty recommendations.

---

## 3. Features
- **Cinematic Landing Page**: Immersive introduction with animated particle backdrop, hero typography, and live RPG preview.
- **SSR Authentication**: Supabase SSR Auth with secure HTTP-only cookies and edge middleware route protection.
- **Character Discovery**: Multi-step assessment ritual that calculates archetypes and initial attribute balances.
- **Quest Board**: Full CRUD quest management across 7 life disciplines and 4 difficulty tiers.
- **4 Focused Mini-Game Arenas**: Timed, interactive mini-games tailored to quest category and duration.
- **Server-Authoritative Progression**: Centralized non-linear leveling curve $\lfloor 100 \times \text{level}^{1.5} \rfloor$, atomic reward claims, and timezone-aware streak tracking.
- **World Command Center**: Tactical RPG dashboard answering *"What should I do today?"*.
- **Character Dossier**: In-depth character sheet displaying evolution tiers, archetype lore, and attribute growth.
- **ARIA Game Master**: Contextual, non-shaming motivational guidance and notification center.
- **Nightly Camp**: Evening review ritual, backlog rescheduling, and tomorrow planning.
- **Adaptive Difficulty Engine**: Explainable 7-day workload analysis recommending Lighter, Balanced, or Harder pacing.
- **Citadel Emporium (Shop)**: Virtual cosmetic store with atomic purchasing and duplicate prevention.
- **Feats of the Realm (Achievements)**: 8 server-verified milestone achievements with progress tracking.
- **Boss Battles**: Major real-life goal tracking powered by real quest completions.

---

## 4. RPG Progression
- **Total Cumulative XP Model**: `profiles.xp` stores total cumulative XP ever earned. Level is derived deterministically from total XP, guaranteeing that XP overflow carries across level boundaries without data loss.
- **Non-Linear Leveling Curve**:
  $$\text{XP Required}(L \rightarrow L+1) = \lfloor 100 \times L^{1.5} \rfloor$$
  - Level 1 $\rightarrow$ 2: 100 XP
  - Level 2 $\rightarrow$ 3: 282 XP
  - Level 3 $\rightarrow$ 4: 519 XP
  - Level 4 $\rightarrow$ 5: 800 XP
  - Level 5 $\rightarrow$ 6: 1118 XP
- **5 Core Attributes**: Strength, Intellect, Focus, Discipline, and Energy (scale: 0–100).
- **Streak Engine**: Calendar date calculations in the player's local timezone. Consecutively completed days increment streak; missed days reset streak without shaming.

---

## 5. Quest System
- **Categories**: Learning, Fitness, Productivity, Personal, Creative, Social, Other.
- **Difficulty Tiers & Rewards**:
  - **Easy**: 20 XP • 10 Gold
  - **Normal**: 40 XP • 18 Gold
  - **Hard**: 80 XP • 36 Gold
  - **Epic**: 180 XP • 80 Gold
- **Scheduling**: Organized by `scheduled_date` with priority badges (`low`, `medium`, `high`).

---

## 6. Activity Mini-Games
When a player clicks **Play Quest**, they enter a dedicated mini-game arena:
1. **Knowledge Dungeon** (*Learning / Intellect*): Deep study timer with comprehension rune checkpoints.
2. **Training Arena** (*Fitness / Strength*): Interval cadence timer with physical form focus.
3. **Focus Mission** (*Productivity / Focus*): Pomodoro-style flow session minimizing distractions.
4. **Habit Garden** (*Personal / Discipline*): Mindful consistency ritual cultivating inner resolve.

Completion records an atomic `game_sessions` entry and transitions quest status to `completed`.

---

## 7. Game Master
- **Companion**: **ARIA** (*Autonomous Realm Intelligence Assistant*).
- **Rule-Based & Explainable**: Evaluates real database state (empty board, active streak, evening hours, unfinished tasks) to provide contextual guidance.
- **Timezone-Aware Quiet Hours**: Respects player quiet hours (default: 22:00–07:00) and daily limit preferences.
- **Non-Shaming**: Tone focuses on momentum defense, renewal, and sustainable habits.

---

## 8. Nightly Camp
- **Route**: `/nightly-camp`
- **Evening Ritual**:
  1. **Review Today**: Celebrate today's victories and attribute growth.
  2. **Triage Unfinished Tasks**: Reschedule or abandon backlog quests with zero shame.
  3. **Adaptive Guidance**: Review tomorrow's workload recommendation.
  4. **Plan Tomorrow**: Add or adjust tomorrow's quest slate.
- **Zero Reward Invariant**: Planning tomorrow awards **strictly 0 XP and 0 Gold**, ensuring planning is intentional rather than gamified.

---

## 9. Adaptive Difficulty
- **Module**: `src/lib/adaptive/`
- **7-Day Rolling Signals**: Evaluates completion rate, daily quest density, focus minutes, and active streak.
- **Recommendations**:
  - **LIGHTER LOAD**: Triggered if completion $< 60\%$ or backlog $\ge 4$ quests. Advises 1–2 key trials to defend momentum.
  - **HARDER LOAD**: Triggered if completion $\ge 85\%$, streak $\ge 2$, and completed quests $\ge 4$. Invites challenge trials.
  - **BALANCED CADENCE**: Affirms sustainable pace during steady consistency (60%–84%).
- **Player Agency**: The engine is strictly advisory; it never autonomously alters or adds quests.

---

## 10. Economy / Shop
- **Route**: `/shop`
- **Prestige Cosmetics**:
  - `ember_frame` (100 Gold) — Avatar flame frame
  - `scholar_sigil` (150 Gold) — Sigil of accumulated wisdom
  - `warrior_crest` (175 Gold) — Crest of relentless discipline
  - `golden_flame` (200 Gold) — Badge of an unbroken streak
  - `forge_aura` (250 Gold) — Adept atmospheric aura
  - `citadel_banner` (300 Gold) — Legendary citadel standard
- **Atomic Security**: Backed by `purchase_shop_item` PL/pgSQL function with `FOR UPDATE` row locking. Client cannot manipulate prices or cause negative gold balances.

---

## 11. Achievements
- **Feats of the Realm**:
  - 🏆 **First Quest**: Complete your 1st trial
  - 🏆 **Quest Hunter**: Conquer 10 quests
  - 🏆 **Unbreakable**: Reach a 7-day streak
  - 🏆 **Forge Master**: Reach Level 5
  - 🏆 **Level Ascended**: Reach Level 10
  - 🏆 **Night Owl**: Complete 1 Nightly Camp plan
  - 🏆 **Adventurer**: Complete quests across 3+ distinct disciplines
  - 🏆 **Boss Slayer**: Vanquish 1 major goal boss
- **Idempotent**: Backed by `UNIQUE(user_id, achievement_key)` in PostgreSQL.

---

## 12. Boss Battles
- **Real-Life Aspirations**: Bosses represent major endeavors (*"The Portfolio Beast"*, *"The Citadel Colossus"*).
- **Quest-Driven Damage**: Conquering matching quests inflicts damage, advancing HP progress.
- **Victory Bounty**: Defeating a boss awards +250 XP and +100 Gold via atomic `claim_boss_reward` RPC.

---

## 13. Tech Stack
- **Framework**: Next.js 16.3.5 (App Router, Turbopack, React Server Components)
- **Language**: TypeScript 5
- **UI & Styling**: React 19, Tailwind CSS 4, Lucide React icons
- **Motion**: CSS keyframe animations with `prefers-reduced-motion` compliance
- **Backend & Database**: Supabase SSR (`@supabase/ssr`), PostgreSQL 15
- **Testing**: Native TypeScript test runner executed via `npx tsx`

---

## 14. Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER (React 19)                    │
│  - App Router Pages (/dashboard, /quests, /shop, /character)    │
│  - UI Components (AppNavbar, BossBattleCard, AchievementList)   │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Server Actions / Form Submissions
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS SERVER (Node.js)                    │
│  - Edge Middleware (src/middleware.ts / updateSession)          │
│  - Server Actions (src/actions/*)                               │
│  - Domain Engines (src/lib/rpg, adaptive, achievements, bosses) │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Authenticated Supabase Client (RLS)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE POSTGRESQL DATABASE                  │
│  - Tables: profiles, quests, game_sessions, reward_events,      │
│            inventory_items, user_achievements, boss_battles     │
│  - PL/pgSQL RPCs: claim_quest_reward, purchase_shop_item,       │
│                   claim_boss_reward                             │
│  - Row-Level Security (auth.uid() = user_id)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 15. Security
- **Zero Client Trust**: XP, Gold, attributes, level, prices, and achievement states are calculated and verified exclusively on the server.
- **Row-Level Security (RLS)**: Enforced across all tables; authenticated players cannot inspect or modify data belonging to other players.
- **Atomic Transactions & Row Locking**: PostgreSQL `FOR UPDATE` prevents double-spending or race condition exploits.
- **Secret Isolation**: `SUPABASE_SERVICE_ROLE_KEY` is completely absent from client bundles; only public anon key and secure cookies are used.

---

## 16. Database
7 clean, chronologically ordered SQL migrations:
1. `20260912000001_create_profiles.sql`: Character profiles, attributes, streaks.
2. `20260912000002_create_quests.sql`: Quests table, categories, difficulties.
3. `20260912000003_create_game_sessions.sql`: Mini-game session state tracking.
4. `20260912000004_create_reward_events.sql`: Victory ledger & `claim_quest_reward` RPC.
5. `20260912000005_create_notifications.sql`: Notification center & quiet hours.
6. `20260912000006_create_nightly_camp.sql`: Nightly planning records & bedtime.
7. `20260912000007_create_economy_achievements_bosses.sql`: Inventory, achievements, boss battles & RPCs.

---

## 17. Local Development

### Prerequisites
- Node.js 18+ (tested on Node v24)
- npm / yarn / pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/to-do-lists.git
cd to-do-lists

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# (Fill in your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 18. Environment Variables
Stored in `.env.local` (never committed to version control).
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 19. Deployment
Optimized for deployment on **Vercel**:
1. Push repository to GitHub.
2. Import project into Vercel dashboard.
3. Set Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy. Vercel automatically detects Next.js App Router and executes `npm run build`.

---

## 20. Demo Flow
To demonstrate the complete user journey:
1. **Landing & Signup**: Visit `/` $\rightarrow$ click *"Begin Your Journey"* $\rightarrow$ create account at `/signup`.
2. **Character Discovery Ritual**: Complete the 10-question assessment to reveal your Archetype and core attribute distribution.
3. **World Dashboard**: Review the hero realm card, active streak flame, ARIA companion guidance, and today's quest board.
4. **Create Quest**: Click *"Create New Quest"*, enter a task (e.g., *"Finish Technical Presentation"*), assign category (`Productivity`), and select `Normal` difficulty (+40 XP, +18 Gold).
5. **Play Mini-Game**: Click *"Play"* to enter the Focus Mission arena. Complete the session and claim reward.
6. **Progression Feedback**: Watch the non-linear XP bar fill, Gold increment, and streak advance.
7. **Refresh & Persistence**: Refresh the browser page (`F5`) to verify that all progress, XP, Gold, and quest status persist from PostgreSQL.
8. **Feats & Shop**:
   - Visit `/character` to see the newly unlocked *"First Quest"* achievement.
   - Visit `/shop` to browse virtual cosmetics and acquire an *Ember Frame*.
9. **Boss Battle**: Check the active boss card on `/dashboard` to observe damage inflicted by your completed quest.
10. **Nightly Camp**: Enter `/nightly-camp` to review today's achievements and review ARIA's adaptive difficulty guidance for tomorrow.

---

## 21. Project Structure
```
├── docs/                        # Architectural documentation per phase
├── public/                      # Static assets
├── src/
│   ├── actions/                 # Server Actions (auth, quests, economy, bosses, etc.)
│   ├── app/                     # Next.js App Router pages
│   │   ├── (auth)/              # Login and signup routes
│   │   ├── character/           # Character sheet dossier & achievements
│   │   ├── character-discovery/ # Onboarding assessment ritual
│   │   ├── dashboard/           # Main World command center
│   │   ├── nightly-camp/        # Nightly Camp & tomorrow planning
│   │   ├── quests/              # Quest management & mini-game arenas
│   │   └── shop/                # Citadel Emporium cosmetics store
│   ├── components/              # Modular UI components
│   │   ├── achievements/        # Achievement cards, lists, celebrations
│   │   ├── adaptive/            # Adaptive guidance cards
│   │   ├── bosses/              # Boss battle HP cards
│   │   ├── camp/                # Nightly camp steps & reflection
│   │   ├── character/           # Character evolution badges & stat panels
│   │   ├── game-master/         # ARIA companion card & notifications
│   │   ├── landing/             # Hero section & particle canvas
│   │   ├── navigation/          # AppNavbar (desktop & mobile)
│   │   ├── quests/              # Quest cards & creation modal
│   │   ├── rpg/                 # XP bars, victory history chronicle
│   │   └── shop/                # Shop catalog view & purchase modals
│   ├── lib/                     # Pure domain logic & Supabase clients
│   │   ├── achievements/        # Achievement definitions & evaluation engine
│   │   ├── adaptive/            # 7-day signals & difficulty rules
│   │   ├── assessment/          # Archetype scoring & questions
│   │   ├── bosses/              # Boss battle rules & goal matching
│   │   ├── camp/                # Camp reflection & bedtime logic
│   │   ├── economy/             # Shop catalog & domain types
│   │   ├── game-master/         # Context detector & advice rules
│   │   ├── games/               # Mini-game arena configurations
│   │   ├── notifications/       # Quiet hours & notification dispatch
│   │   ├── quests/              # Quest schemas & validators
│   │   ├── rpg/                 # Non-linear leveling curve & streak engine
│   │   └── supabase/            # SSR client, server, and middleware
│   └── middleware.ts            # Next.js edge route protection proxy
└── supabase/
    └── migrations/              # Chronological SQL migrations (1 to 7)
```

---

## 22. Testing
Run the complete automated test suite locally:

```bash
# Phase 11: Economy, Achievements & Boss Battles
npx tsx src/lib/economy/__tests__/phase11_systems.test.ts

# Phase 6: Non-linear RPG Progression & Streak Engine
npx tsx src/lib/rpg/__tests__/progression_engine.test.ts

# Phase 7: Character Evolution Tiers
npx tsx src/lib/rpg/__tests__/evolution.test.ts

# Phase 8: Game Master ARIA & Quiet Hours
npx tsx src/lib/game-master/__tests__/game_master.test.ts

# Phase 9: Nightly Camp & Tomorrow Planning
npx tsx src/lib/camp/__tests__/nightly_camp.test.ts

# Phase 10: Adaptive Difficulty Engine
npx tsx src/lib/adaptive/__tests__/adaptive_difficulty.test.ts

# Production Build Verification
npm run build
```

---

## License
MIT © LIFEFORGE Team. Built for the Life RPG Productivity Challenge.
