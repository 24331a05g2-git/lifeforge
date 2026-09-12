-- ==============================================================================
-- LIFEFORGE: Character Profiles Schema & Row Level Security (RLS)
-- Phase 3: Character Discovery & Persistent Character Profile
-- ==============================================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    character_name TEXT NOT NULL,
    archetype TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    xp INTEGER NOT NULL DEFAULT 0,
    gold INTEGER NOT NULL DEFAULT 0,
    strength INTEGER NOT NULL,
    intellect INTEGER NOT NULL,
    focus INTEGER NOT NULL,
    discipline INTEGER NOT NULL,
    energy INTEGER NOT NULL,
    selected_goals TEXT[] DEFAULT '{}',
    assessment_completed BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT valid_character_name CHECK (char_length(character_name) >= 2 AND char_length(character_name) <= 50),
    CONSTRAINT valid_level CHECK (level >= 1),
    CONSTRAINT valid_xp CHECK (xp >= 0),
    CONSTRAINT valid_gold CHECK (gold >= 0),
    CONSTRAINT valid_strength CHECK (strength >= 1 AND strength <= 100),
    CONSTRAINT valid_intellect CHECK (intellect >= 1 AND intellect <= 100),
    CONSTRAINT valid_focus CHECK (focus >= 1 AND focus <= 100),
    CONSTRAINT valid_discipline CHECK (discipline >= 1 AND discipline <= 100),
    CONSTRAINT valid_energy CHECK (energy >= 1 AND energy <= 100)
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Ensure users can ONLY access and modify their own character profile

-- Policy: Select own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Insert own profile
CREATE POLICY "Users can create their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Update own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
