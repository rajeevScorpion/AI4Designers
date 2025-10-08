-- Rollback Migration: Remove sync tracking fields
-- Version: 001_rollback_sync_tracking
-- Date: 2025-01-08
-- Author: Offline-First Refactor

-- ===== DESCRIPTION =====
-- This rollback script removes all sync tracking fields and related objects
-- added in the offline-first migration. Use this only if you need to revert
-- the offline-first architecture changes.

-- ===== ROLLBACK SCRIPT =====

-- Drop triggers
DROP TRIGGER IF EXISTS increment_user_progress_sync_version ON user_progress;

-- Drop functions
DROP FUNCTION IF EXISTS increment_sync_version();
DROP FUNCTION IF EXISTS resolve_sync_conflict(TEXT, INTEGER, JSONB, TEXT);
DROP FUNCTION IF EXISTS get_progress_since(TEXT, TIMESTAMP);

-- Drop indexes
DROP INDEX IF EXISTS idx_user_progress_client_id;
DROP INDEX IF EXISTS idx_user_progress_updated_at;
DROP INDEX IF EXISTS idx_user_progress_sync_version;

-- Drop columns from user_progress table
ALTER TABLE user_progress
DROP COLUMN IF EXISTS client_id,
DROP COLUMN IF EXISTS sync_version,
DROP COLUMN IF EXISTS last_sync_at,
DROP COLUMN IF EXISTS conflict_data;

-- ===== VERIFICATION =====
-- Verify the rollback was successful
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
    AND column_name IN ('client_id', 'sync_version', 'last_sync_at', 'conflict_data')
ORDER BY column_name;