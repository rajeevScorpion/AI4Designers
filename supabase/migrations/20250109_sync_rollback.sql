-- =============================================
-- Rollback Migration: Revert sync changes if needed
-- Version: 20250109_sync_rollback
-- Date: 2025-01-09
-- Description: Rollback script for all sync-related changes
-- =============================================

-- =============================================
-- WARNING: This will delete all sync data!
-- Run this only if you need to completely revert the sync changes.
-- =============================================

-- Drop sync_queue table and all its data
DROP TABLE IF EXISTS sync_queue CASCADE;

-- Remove sync tracking fields from user_progress table
ALTER TABLE user_progress
DROP COLUMN IF EXISTS client_id,
DROP COLUMN IF EXISTS sync_version,
DROP COLUMN IF EXISTS last_sync_at,
DROP COLUMN IF EXISTS conflict_data;

-- Drop sync-related indexes
DROP INDEX IF EXISTS idx_user_progress_client_id;
DROP INDEX IF EXISTS idx_user_progress_sync_version;
-- Note: idx_user_progress_updated_at might be needed for other purposes

-- Drop sync-related triggers
DROP TRIGGER IF EXISTS increment_user_progress_sync_version ON user_progress;
DROP TRIGGER IF EXISTS handle_sync_queue_updated_at ON sync_queue;

-- Drop sync-related functions
DROP FUNCTION IF EXISTS get_progress_since(TEXT, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS resolve_sync_conflict(TEXT, INTEGER, JSONB, TEXT);
DROP FUNCTION IF EXISTS increment_sync_version();

-- =============================================
-- RESTORE ORIGINAL RLS POLICIES (if needed)
-- =============================================

-- Drop all sync-related policies
DROP POLICY IF EXISTS "Users can read own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;
DROP POLICY IF EXISTS "Service role can manage all progress" ON user_progress;

-- Restore original simple policies (if you had them before)
CREATE POLICY "Users can read own progress" ON user_progress
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress" ON user_progress
    FOR DELETE
    USING (auth.uid() = user_id);

-- =============================================
-- VERIFICATION
-- =============================================

-- Verify rollback was successful
SELECT 'Rollback Complete' as status;

-- Check that sync_queue table is gone
SELECT
    CASE
        WHEN NOT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'sync_queue'
        ) THEN 'sync_queue table dropped successfully'
        ELSE 'ERROR: sync_queue table still exists'
    END as table_status;

-- Check that sync columns are gone
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'user_progress'
    AND column_name IN ('client_id', 'sync_version', 'last_sync_at', 'conflict_data');

-- If no rows returned, columns were successfully dropped