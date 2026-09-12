-- ==============================================================================
-- LIFEFORGE: Quests Schema & Row Level Security (RLS)
-- Phase 4: Core Quest System & Category/Game/Attribute Mappings
-- ==============================================================================

-- 1. Create Quests Table
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    difficulty TEXT NOT NULL DEFAULT 'normal',
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    estimated_duration INTEGER NOT NULL DEFAULT 30,
    xp_reward INTEGER NOT NULL DEFAULT 40,
    gold_reward INTEGER NOT NULL DEFAULT 18,
    attribute TEXT NOT NULL,
    game_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Validation Constraints
    CONSTRAINT valid_quest_title CHECK (char_length(title) >= 2 AND char_length(title) <= 120),
    CONSTRAINT valid_quest_description CHECK (char_length(description) <= 1000),
    CONSTRAINT valid_quest_category CHECK (category IN (
        'learning', 'fitness', 'productivity', 'personal', 'creative', 'social', 'other'
    )),
    CONSTRAINT valid_quest_priority CHECK (priority IN ('low', 'medium', 'high')),
    CONSTRAINT valid_quest_difficulty CHECK (difficulty IN ('easy', 'normal', 'hard', 'epic')),
    CONSTRAINT valid_quest_status CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
    CONSTRAINT valid_quest_attribute CHECK (attribute IN (
        'strength', 'intellect', 'focus', 'discipline', 'energy'
    )),
    CONSTRAINT valid_quest_game_type CHECK (game_type IN (
        'knowledge_dungeon', 'training_arena', 'focus_mission', 'habit_garden'
    )),
    CONSTRAINT valid_quest_duration CHECK (estimated_duration >= 1 AND estimated_duration <= 1440),
    CONSTRAINT valid_quest_xp CHECK (xp_reward >= 0),
    CONSTRAINT valid_quest_gold CHECK (gold_reward >= 0)
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_quests_user_date ON public.quests(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_quests_user_status ON public.quests(user_id, status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Authenticated users can ONLY interact with their own quests

-- Policy: Select own quests
CREATE POLICY "Users can view their own quests"
    ON public.quests
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Insert own quests
CREATE POLICY "Users can create their own quests"
    ON public.quests
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Update own quests
CREATE POLICY "Users can update their own quests"
    ON public.quests
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Delete own quests
CREATE POLICY "Users can delete their own quests"
    ON public.quests
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 5. Updated_at Trigger
DROP TRIGGER IF EXISTS set_quests_updated_at ON public.quests;
CREATE TRIGGER set_quests_updated_at
    BEFORE UPDATE ON public.quests
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
