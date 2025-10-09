-- =============================================
-- Migration: Fix RLS policies for proper UUID handling
-- Version: 20250109_update_rls_policies
-- Date: 2025-01-09
-- Description: Updates RLS policies to handle UUID text conversion properly
-- =============================================

-- =============================================
-- USER_PROGRESS TABLE POLICIES
-- =============================================

-- Drop existing policies to recreate them with proper UUID handling
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;
DROP POLICY IF EXISTS "Service role can manage all progress" ON user_progress;

-- Recreate policies with proper UUID text conversion
CREATE POLICY "Users can read own progress" ON user_progress
    FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own progress" ON user_progress
    FOR DELETE
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage all progress" ON user_progress
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================
-- SYNC_QUEUE TABLE POLICIES
-- =============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Users can manage own sync queue" ON sync_queue;
DROP POLICY IF EXISTS "Service role can manage all sync queue" ON sync_queue;

-- Create policies for sync_queue table
CREATE POLICY "Users can read own sync queue" ON sync_queue
    FOR SELECT
    USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own sync queue" ON sync_queue
    FOR ALL
    USING (auth.uid()::text = user_id::text)
    WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Service role can manage all sync queue" ON sync_queue
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify policies were created
SELECT 'RLS Policies Updated:' as status;

SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('user_progress', 'sync_queue')
ORDER BY tablename, policyname;

-- Show RLS status
SELECT 'RLS Status:' as status;

SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('user_progress', 'sync_queue')
ORDER BY tablename;