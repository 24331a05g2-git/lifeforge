-- ==============================================================================
-- LIFEFORGE: Rewards, Achievements & Boss Battles Schema
-- Phase 11: Virtual Economy, Server-Authoritative Achievements & Real-Life Goal Boss Battles
-- ==============================================================================

-- 1. INVENTORY ITEMS TABLE (Virtual Cosmetics & Badges)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item_key TEXT NOT NULL,
    item_type TEXT NOT NULL DEFAULT 'cosmetic',
    quantity INTEGER NOT NULL DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT unique_user_item UNIQUE (user_id, item_key),
    CONSTRAINT valid_item_quantity CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_user ON public.inventory_items(user_id);
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory items"
    ON public.inventory_items
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory items"
    ON public.inventory_items
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);


-- 2. USER ACHIEVEMENTS TABLE (Server-Authoritative Unlocks)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_key TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'::jsonb,

    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_key)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
    ON public.user_achievements
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
    ON public.user_achievements
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);


-- 3. BOSS BATTLES TABLE (Major Real-Life Goal Encounters)
CREATE TABLE IF NOT EXISTS public.boss_battles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    goal_category TEXT NOT NULL DEFAULT 'all',
    progress INTEGER NOT NULL DEFAULT 0,
    target_value INTEGER NOT NULL DEFAULT 10,
    xp_reward INTEGER NOT NULL DEFAULT 250,
    gold_reward INTEGER NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'active',
    reward_claimed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    defeated_at TIMESTAMPTZ,

    CONSTRAINT valid_boss_status CHECK (status IN ('active', 'defeated')),
    CONSTRAINT valid_boss_progress CHECK (progress >= 0 AND progress <= target_value),
    CONSTRAINT valid_boss_target CHECK (target_value > 0),
    CONSTRAINT valid_boss_xp CHECK (xp_reward >= 0),
    CONSTRAINT valid_boss_gold CHECK (gold_reward >= 0)
);

CREATE INDEX IF NOT EXISTS idx_boss_battles_user_status ON public.boss_battles(user_id, status);
ALTER TABLE public.boss_battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own boss battles"
    ON public.boss_battles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own boss battles"
    ON public.boss_battles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boss battles"
    ON public.boss_battles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);


-- 4. ATOMIC RPC FUNCTION: purchase_shop_item
-- Enforces row locking, validates item cost server-side, verifies sufficient gold,
-- and prevents duplicate cosmetic purchases or negative balances.
CREATE OR REPLACE FUNCTION public.purchase_shop_item(
    p_item_key TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_item_price INTEGER;
    v_current_gold INTEGER;
    v_new_item_id UUID;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to purchase items.';
    END IF;

    -- Strict Server-Authoritative Price Matrix
    CASE p_item_key
        WHEN 'ember_frame' THEN v_item_price := 100;
        WHEN 'scholar_sigil' THEN v_item_price := 150;
        WHEN 'warrior_crest' THEN v_item_price := 175;
        WHEN 'golden_flame' THEN v_item_price := 200;
        WHEN 'forge_aura' THEN v_item_price := 250;
        WHEN 'citadel_banner' THEN v_item_price := 300;
        ELSE
            RAISE EXCEPTION 'Invalid or unknown shop item: %', p_item_key;
    END CASE;

    -- Prevent duplicate cosmetic ownership
    IF EXISTS (
        SELECT 1 FROM public.inventory_items
        WHERE user_id = v_user_id AND item_key = p_item_key
    ) THEN
        RAISE EXCEPTION 'Item % is already owned.', p_item_key;
    END IF;

    -- Lock player profile row for update to prevent race conditions / double spending
    SELECT gold INTO v_current_gold
    FROM public.profiles
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_current_gold IS NULL THEN
        RAISE EXCEPTION 'Player profile not found.';
    END IF;

    IF v_current_gold < v_item_price THEN
        RAISE EXCEPTION 'Insufficient gold: have %, need %.', v_current_gold, v_item_price;
    END IF;

    -- Deduct gold atomically
    UPDATE public.profiles
    SET gold = gold - v_item_price
    WHERE user_id = v_user_id;

    -- Insert item into player's inventory
    INSERT INTO public.inventory_items (
        user_id,
        item_key,
        item_type,
        quantity,
        metadata,
        acquired_at
    ) VALUES (
        v_user_id,
        p_item_key,
        'cosmetic',
        1,
        jsonb_build_object('purchased_price', v_item_price),
        now()
    )
    RETURNING id INTO v_new_item_id;

    RETURN jsonb_build_object(
        'success', true,
        'item_id', v_new_item_id,
        'item_key', p_item_key,
        'price_paid', v_item_price,
        'remaining_gold', v_current_gold - v_item_price
    );
END;
$$;


-- 5. ATOMIC RPC FUNCTION: claim_boss_reward
-- Enforces idempotent boss victory reward claim.
CREATE OR REPLACE FUNCTION public.claim_boss_reward(
    p_boss_id UUID
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_boss RECORD;
    v_profile RECORD;
    v_new_total_xp INTEGER;
    v_new_level INTEGER;
    v_temp_cumul INTEGER;
    v_lvl_needed INTEGER;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to claim victory bounty.';
    END IF;

    -- Lock boss record for update
    SELECT * INTO v_boss
    FROM public.boss_battles
    WHERE id = p_boss_id AND user_id = v_user_id
    FOR UPDATE;

    IF v_boss IS NULL THEN
        RAISE EXCEPTION 'Boss battle not found or unauthorized.';
    END IF;

    IF v_boss.status != 'defeated' THEN
        RAISE EXCEPTION 'Boss has not been defeated yet (%/%).', v_boss.progress, v_boss.target_value;
    END IF;

    IF v_boss.reward_claimed THEN
        RAISE EXCEPTION 'Victory bounty has already been claimed for this boss.';
    END IF;

    -- Mark boss reward claimed
    UPDATE public.boss_battles
    SET reward_claimed = true
    WHERE id = p_boss_id;

    -- Lock profile and award XP & Gold
    SELECT * INTO v_profile
    FROM public.profiles
    WHERE user_id = v_user_id
    FOR UPDATE;

    IF v_profile IS NULL THEN
        RAISE EXCEPTION 'Player profile not found.';
    END IF;

    v_new_total_xp := COALESCE(v_profile.xp, 0) + v_boss.xp_reward;

    -- Compute new level using centralized non-linear formula: floor(100 * level^1.5)
    v_new_level := 1;
    v_temp_cumul := 0;
    LOOP
        v_lvl_needed := floor(100.0 * (v_new_level::numeric ^ 1.5))::integer;
        EXIT WHEN (v_temp_cumul + v_lvl_needed) > v_new_total_xp;
        v_temp_cumul := v_temp_cumul + v_lvl_needed;
        v_new_level := v_new_level + 1;
        EXIT WHEN v_new_level >= 100;
    END LOOP;

    -- Update player profile
    UPDATE public.profiles
    SET
        xp = v_new_total_xp,
        level = v_new_level,
        gold = COALESCE(v_profile.gold, 0) + v_boss.gold_reward
    WHERE user_id = v_user_id;

    -- Idempotently unlock boss_slayer achievement
    INSERT INTO public.user_achievements (user_id, achievement_key, unlocked_at)
    VALUES (v_user_id, 'boss_slayer', now())
    ON CONFLICT (user_id, achievement_key) DO NOTHING;

    RETURN jsonb_build_object(
        'success', true,
        'boss_id', p_boss_id,
        'xp_awarded', v_boss.xp_reward,
        'gold_awarded', v_boss.gold_reward,
        'new_xp', v_new_total_xp,
        'new_level', v_new_level,
        'new_gold', COALESCE(v_profile.gold, 0) + v_boss.gold_reward
    );
END;
$$;
