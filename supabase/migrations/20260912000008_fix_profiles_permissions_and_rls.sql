-- ==============================================================================
-- LIFEFORGE: Fix Profiles Table Permissions & Row Level Security (RLS)
-- Migration 8: Grant Table Privileges & Enforce Strict User Ownership RLS
-- ==============================================================================

-- 1. Grant Schema and Table Privileges to authenticated and service_role
-- Fixes PostgreSQL 42501 "permission denied for table profiles"
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- 2. Ensure Row Level Security (RLS) is Active
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Idempotently Clean Up Any Existing Policies on Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- 4. Recreate Strict, Server-Authoritative RLS Policies

-- Policy: Authenticated users can view ONLY their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Authenticated users can insert ONLY their own profile (user_id must match auth.uid())
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can update ONLY their own profile (user_id must match auth.uid())
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Authenticated users can delete ONLY their own profile
CREATE POLICY "Users can delete their own profile"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
