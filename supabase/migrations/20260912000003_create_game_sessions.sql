-- ==============================================================================
-- LIFEFORGE: Game Sessions Schema & Row Level Security (RLS)
-- Phase 5: Reusable Activity Mini-Game Engine & Real-World Session Verification
-- ==============================================================================

-- 1. Create Game Sessions Table
CREATE TABLE IF NOT EXISTS public.game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    user_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT valid_game_type CHECK (game_type IN (
        'knowledge_dungeon', 'training_arena', 'focus_mission', 'habit_garden'
    )),
    CONSTRAINT valid_session_status CHECK (status IN ('active', 'completed', 'abandoned')),
    CONSTRAINT valid_duration CHECK (duration_seconds >= 0)
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_quest ON public.game_sessions(user_id, quest_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_status ON public.game_sessions(user_id, status);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Authenticated users can only read and mutate their own sessions

-- Policy: Select own sessions
CREATE POLICY "Users can view their own game sessions"
    ON public.game_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Insert own sessions
CREATE POLICY "Users can insert their own game sessions"
    ON public.game_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Update own sessions
CREATE POLICY "Users can update their own game sessions"
    ON public.game_sessions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Updated_at Trigger
DROP TRIGGER IF EXISTS set_game_sessions_updated_at ON public.game_sessions;
CREATE TRIGGER set_game_sessions_updated_at
    BEFORE UPDATE ON public.game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
