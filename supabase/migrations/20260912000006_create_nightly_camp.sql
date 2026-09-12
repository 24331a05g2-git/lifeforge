-- ==============================================================================
-- LIFEFORGE: Nightly Camp & Tomorrow Planning Schema & RLS
-- Phase 9: End-of-Day Review, Tomorrow Planning & Persistent Nightly Plans
-- ==============================================================================

-- 1. Add Configurable Bedtime to Profiles
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS bedtime VARCHAR(5) NOT NULL DEFAULT '22:30';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'valid_bedtime_format'
    ) THEN
        ALTER TABLE public.profiles
            ADD CONSTRAINT valid_bedtime_format CHECK (bedtime ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
    END IF;
END $$;

-- 2. Create Nightly Plans Table
CREATE TABLE IF NOT EXISTS public.nightly_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_date DATE NOT NULL,
    target_date DATE NOT NULL,
    difficulty VARCHAR(16) NOT NULL DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'challenge')),
    status VARCHAR(16) NOT NULL DEFAULT 'saved' CHECK (status IN ('draft', 'saved', 'completed')),
    reflection TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Exactly one plan per user per target date
    CONSTRAINT unique_user_target_plan UNIQUE (user_id, target_date)
);

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_nightly_plans_user_target ON public.nightly_plans(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_nightly_plans_user_created ON public.nightly_plans(user_id, created_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.nightly_plans ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Authenticated users can ONLY interact with their own nightly plans

CREATE POLICY "Users can view their own nightly plans"
    ON public.nightly_plans
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own nightly plans"
    ON public.nightly_plans
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nightly plans"
    ON public.nightly_plans
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own nightly plans"
    ON public.nightly_plans
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
