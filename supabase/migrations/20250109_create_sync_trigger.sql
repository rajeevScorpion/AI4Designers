-- =============================================
-- Migration: Create trigger for sync version management
-- Version: 20250109_create_sync_trigger
-- Date: 2025-01-09
-- Description: Creates trigger to automatically increment sync_version on updates
-- =============================================

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_user_progress_update_sync ON user_progress;

-- Drop the function if it exists (we already created it, but just in case)
DROP FUNCTION IF EXISTS increment_sync_version() CASCADE;

-- Create the function (if not already created)
CREATE FUNCTION increment_sync_version()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.sync_version IS NOT NULL THEN
        NEW.sync_version = OLD.sync_version + 1;
    ELSE
        NEW.sync_version = 1;
    END IF;
    NEW.last_sync_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_sync_version TO authenticated, service_role;

-- Create the trigger
CREATE TRIGGER on_user_progress_update_sync
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION increment_sync_version();

-- Also set trigger for inserts to initialize sync_version
CREATE OR REPLACE FUNCTION initialize_sync_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.sync_version IS NULL THEN
        NEW.sync_version = 1;
    END IF;
    NEW.last_sync_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION initialize_sync_version TO authenticated, service_role;

-- Create trigger for inserts
CREATE TRIGGER on_user_progress_insert_sync
    BEFORE INSERT ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION initialize_sync_version();

-- Verify triggers
SELECT
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    tgfoid::regproc as function_name,
    tgtype::text as trigger_type
FROM pg_trigger
WHERE tgrelid = 'user_progress'::regclass
    AND NOT tgisinternal
ORDER BY tgname;