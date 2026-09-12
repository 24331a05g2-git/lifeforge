-- ==============================================================================
-- LIFEFORGE: Reward Ledger & Progression Engine
-- Phase 6: Server-Authoritative Reward Events, Streaks & Non-Linear Progression
-- ==============================================================================

-- 1. Add Progression & Streak Fields to Profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_completed_date DATE,
    ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'UTC';

-- Add check constraints if not already existing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_current_streak'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT valid_current_streak CHECK (current_streak >= 0);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_longest_streak'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT valid_longest_streak CHECK (longest_streak >= 0);
    END IF;
END $$;

-- 2. Create Reward Events Ledger Table
CREATE TABLE IF NOT EXISTS public.reward_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    game_session_id UUID NOT NULL REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL DEFAULT 'quest_completion',
    xp_amount INTEGER NOT NULL,
    gold_amount INTEGER NOT NULL,
    attribute TEXT NOT NULL,
    attribute_amount INTEGER NOT NULL,
    level_before INTEGER NOT NULL,
    level_after INTEGER NOT NULL,
    streak_before INTEGER NOT NULL DEFAULT 0,
    streak_after INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Strict Idempotency & Validation Constraints
    CONSTRAINT unique_quest_reward UNIQUE (quest_id),
    CONSTRAINT unique_session_reward UNIQUE (game_session_id),
    CONSTRAINT valid_event_type CHECK (event_type IN ('quest_completion')),
    CONSTRAINT valid_reward_xp CHECK (xp_amount >= 0),
    CONSTRAINT valid_reward_gold CHECK (gold_amount >= 0),
    CONSTRAINT valid_reward_attr_gain CHECK (attribute_amount >= 0)
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_reward_events_user_created ON public.reward_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reward_events_quest ON public.reward_events(quest_id);
CREATE INDEX IF NOT EXISTS idx_reward_events_session ON public.reward_events(game_session_id);

-- 4. Enable Row Level Security
ALTER TABLE public.reward_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Authenticated users can view their own reward history
CREATE POLICY "Users can view their own reward events"
    ON public.reward_events
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 6. Atomic PostgreSQL RPC Function for Completing Game Sessions & Claiming Rewards
CREATE OR REPLACE FUNCTION public.claim_quest_reward(
    p_session_id UUID,
    p_user_notes TEXT DEFAULT '',
    p_user_timezone TEXT DEFAULT 'UTC'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_session RECORD;
    v_quest RECORD;
    v_profile RECORD;
    v_existing_reward RECORD;
    v_ended_at TIMESTAMPTZ := now();
    v_elapsed INTEGER;
    v_xp_reward INTEGER;
    v_gold_reward INTEGER;
    v_attr_gain INTEGER;
    v_target_attr TEXT;
    v_new_total_xp INTEGER;
    v_new_level INTEGER;
    v_temp_cumul INTEGER;
    v_lvl_needed INTEGER;
    v_today DATE;
    v_new_streak INTEGER;
    v_new_longest INTEGER;
    v_is_extended BOOLEAN;
    v_is_record BOOLEAN;
    v_day_diff INTEGER;
    v_reward_event_id UUID;
    v_xp_into_level INTEGER;
    v_xp_required_next INTEGER;
    v_levels_gained INTEGER;
BEGIN
    -- 1. Authenticate user
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to claim rewards.';
    END IF;

    -- 2. Lock & Validate Session
    SELECT * INTO v_session
    FROM public.game_sessions
    WHERE id = p_session_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Game session not found or unauthorized.';
    END IF;

    IF v_session.status = 'abandoned' THEN
        RAISE EXCEPTION 'Cannot claim reward for an abandoned session.';
    END IF;

    -- 3. Lock & Validate Quest
    SELECT * INTO v_quest
    FROM public.quests
    WHERE id = v_session.quest_id AND user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Associated quest not found or unauthorized.';
    END IF;

    -- 4. Idempotency Check: Verify reward has not already been issued
    SELECT * INTO v_existing_reward
    FROM public.reward_events
    WHERE quest_id = v_quest.id;

    IF FOUND THEN
        RAISE EXCEPTION 'Reward has already been claimed for this quest.';
    END IF;

    -- 5. Lock & Validate Profile
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Player character profile not found.';
    END IF;

    -- 6. Compute Elapsed Duration & Complete Session
    v_elapsed := GREATEST(1, ROUND(EXTRACT(EPOCH FROM (v_ended_at - v_session.started_at))));
    UPDATE public.game_sessions
    SET status = 'completed',
        ended_at = v_ended_at,
        duration_seconds = v_elapsed,
        user_notes = COALESCE(NULLIF(TRIM(p_user_notes), ''), v_session.user_notes)
    WHERE id = v_session.id;

    -- 7. Complete Quest
    UPDATE public.quests
    SET status = 'completed',
        completed_at = v_ended_at
    WHERE id = v_quest.id;

    -- 8. Deterministic Reward Calculation
    IF v_quest.difficulty = 'easy' THEN
        v_xp_reward := 20;
        v_gold_reward := 8;
        v_attr_gain := 1;
    ELSIF v_quest.difficulty = 'hard' THEN
        v_xp_reward := 80;
        v_gold_reward := 40;
        v_attr_gain := 2;
    ELSIF v_quest.difficulty = 'epic' THEN
        v_xp_reward := 180;
        v_gold_reward := 100;
        v_attr_gain := 3;
    ELSE -- 'normal' is default
        v_xp_reward := 40;
        v_gold_reward := 18;
        v_attr_gain := 1;
    END IF;

    v_target_attr := v_quest.attribute;

    -- 9. Level Progression via floor(100 * level^1.5)
    v_new_total_xp := v_profile.xp + v_xp_reward;
    v_new_level := 1;
    v_temp_cumul := 0;

    LOOP
        v_lvl_needed := FLOOR(100 * POWER(v_new_level, 1.5))::INTEGER;
        IF v_temp_cumul + v_lvl_needed > v_new_total_xp THEN
            EXIT;
        END IF;
        v_temp_cumul := v_temp_cumul + v_lvl_needed;
        v_new_level := v_new_level + 1;
    END LOOP;

    v_xp_into_level := v_new_total_xp - v_temp_cumul;
    v_xp_required_next := FLOOR(100 * POWER(v_new_level, 1.5))::INTEGER;
    v_levels_gained := GREATEST(0, v_new_level - v_profile.level);

    -- 10. Calendar Streak Engine
    BEGIN
        v_today := (v_ended_at AT TIME ZONE COALESCE(NULLIF(p_user_timezone, ''), 'UTC'))::DATE;
    EXCEPTION WHEN OTHERS THEN
        v_today := (v_ended_at AT TIME ZONE 'UTC')::DATE;
    END;

    IF v_profile.last_completed_date IS NULL THEN
        v_new_streak := 1;
        v_new_longest := GREATEST(COALESCE(v_profile.longest_streak, 0), 1);
        v_is_extended := true;
        v_is_record := v_new_streak > COALESCE(v_profile.longest_streak, 0);
    ELSE
        v_day_diff := v_today - v_profile.last_completed_date;
        IF v_day_diff = 0 THEN
            v_new_streak := COALESCE(v_profile.current_streak, 1);
            v_new_longest := GREATEST(COALESCE(v_profile.longest_streak, 0), v_new_streak);
            v_is_extended := false;
            v_is_record := false;
        ELSIF v_day_diff = 1 THEN
            v_new_streak := COALESCE(v_profile.current_streak, 0) + 1;
            v_new_longest := GREATEST(COALESCE(v_profile.longest_streak, 0), v_new_streak);
            v_is_extended := true;
            v_is_record := v_new_streak > COALESCE(v_profile.longest_streak, 0);
        ELSE
            v_new_streak := 1;
            v_new_longest := COALESCE(v_profile.longest_streak, 0);
            v_is_extended := true;
            v_is_record := v_new_streak > v_new_longest;
        END IF;
    END IF;

    -- 11. Update Profile (XP, Level, Gold, Attributes, Streaks)
    UPDATE public.profiles
    SET xp = v_new_total_xp,
        level = v_new_level,
        gold = v_profile.gold + v_gold_reward,
        current_streak = v_new_streak,
        longest_streak = v_new_longest,
        last_completed_date = v_today,
        timezone = COALESCE(NULLIF(p_user_timezone, ''), v_profile.timezone, 'UTC')
    WHERE id = v_profile.id;

    -- Update target attribute capped at 100
    IF v_target_attr = 'strength' THEN
        UPDATE public.profiles SET strength = LEAST(100, strength + v_attr_gain) WHERE id = v_profile.id;
    ELSIF v_target_attr = 'intellect' THEN
        UPDATE public.profiles SET intellect = LEAST(100, intellect + v_attr_gain) WHERE id = v_profile.id;
    ELSIF v_target_attr = 'focus' THEN
        UPDATE public.profiles SET focus = LEAST(100, focus + v_attr_gain) WHERE id = v_profile.id;
    ELSIF v_target_attr = 'discipline' THEN
        UPDATE public.profiles SET discipline = LEAST(100, discipline + v_attr_gain) WHERE id = v_profile.id;
    ELSIF v_target_attr = 'energy' THEN
        UPDATE public.profiles SET energy = LEAST(100, energy + v_attr_gain) WHERE id = v_profile.id;
    END IF;

    -- 12. Insert Permanent Reward Event Ledger Row
    INSERT INTO public.reward_events (
        user_id,
        quest_id,
        game_session_id,
        event_type,
        xp_amount,
        gold_amount,
        attribute,
        attribute_amount,
        level_before,
        level_after,
        streak_before,
        streak_after,
        metadata
    ) VALUES (
        v_user_id,
        v_quest.id,
        v_session.id,
        'quest_completion',
        v_xp_reward,
        v_gold_reward,
        v_target_attr,
        v_attr_gain,
        v_profile.level,
        v_new_level,
        COALESCE(v_profile.current_streak, 0),
        v_new_streak,
        jsonb_build_object(
            'quest_title', v_quest.title,
            'category', v_quest.category,
            'difficulty', v_quest.difficulty,
            'duration_seconds', v_elapsed
        )
    ) RETURNING id INTO v_reward_event_id;

    -- 13. Build and Return Structured Result
    RETURN jsonb_build_object(
        'success', true,
        'rewardEventId', v_reward_event_id,
        'reward', jsonb_build_object(
            'xp', v_xp_reward,
            'gold', v_gold_reward,
            'attribute', v_target_attr,
            'attributeGain', v_attr_gain
        ),
        'progression', jsonb_build_object(
            'previousLevel', v_profile.level,
            'newLevel', v_new_level,
            'leveledUp', (v_new_level > v_profile.level),
            'levelsGained', v_levelsGained,
            'previousTotalXp', v_profile.xp,
            'newTotalXp', v_new_total_xp,
            'xpGained', v_xp_reward,
            'xpIntoLevel', v_xp_into_level,
            'xpRequiredForNextLevel', v_xp_required_next,
            'progressPercentage', LEAST(100, ROUND((v_xp_into_level::NUMERIC / v_xp_required_next::NUMERIC) * 100))
        ),
        'streak', jsonb_build_object(
            'previousStreak', COALESCE(v_profile.current_streak, 0),
            'currentStreak', v_new_streak,
            'longestStreak', v_new_longest,
            'lastCompletedDate', v_today,
            'isStreakExtended', v_is_extended,
            'isNewRecord', v_is_record
        ),
        'session', jsonb_build_object(
            'id', v_session.id,
            'quest_id', v_quest.id,
            'status', 'completed',
            'duration_seconds', v_elapsed
        ),
        'quest', jsonb_build_object(
            'id', v_quest.id,
            'status', 'completed'
        )
    );
END;
$$;
