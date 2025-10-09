-- =============================================
-- Migration: Check and clean ALL function conflicts
-- Version: 20250109_check_and_clean_functions
-- Date: 2025-01-09
-- Description: First check existing functions, then clean them all
-- =============================================

-- First, let's see what functions exist
SELECT '=== EXISTING FUNCTIONS ===' as info;

SELECT
    proname as function_name,
    oidvectortypes(proargtypes) as arg_types,
    prosecdef as security_definer,
    proowner::regrole as owner,
    oid as function_oid
FROM pg_proc
WHERE proname IN ('get_progress_since', 'resolve_sync_conflict', 'increment_sync_version')
ORDER BY proname;

-- Drop ALL functions by name with CASCADE
SELECT '=== DROPPING ALL FUNCTIONS ===' as info;

-- Drop get_progress_since by finding all overloads
DO $$
DECLARE
    func RECORD;
BEGIN
    FOR func IN
        SELECT oid
        FROM pg_proc
        WHERE proname = 'get_progress_since'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.oid::regprocedure || ' CASCADE';
        RAISE NOTICE 'Dropped get_progress_since %', func.oid::regprocedure;
    END LOOP;

    FOR func IN
        SELECT oid
        FROM pg_proc
        WHERE proname = 'resolve_sync_conflict'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.oid::regprocedure || ' CASCADE';
        RAISE NOTICE 'Dropped resolve_sync_conflict %', func.oid::regprocedure;
    END LOOP;

    FOR func IN
        SELECT oid
        FROM pg_proc
        WHERE proname = 'increment_sync_version'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || func.oid::regprocedure || ' CASCADE';
        RAISE NOTICE 'Dropped increment_sync_version %', func.oid::regprocedure;
    END LOOP;
END $$;

-- Verify all functions are dropped
SELECT '=== VERIFYING FUNCTIONS DROPPED ===' as info;

SELECT
    proname as function_name,
    oidvectortypes(proargtypes) as arg_types,
    COUNT(*) as count
FROM pg_proc
WHERE proname IN ('get_progress_since', 'resolve_sync_conflict', 'increment_sync_version')
GROUP BY proname, oidvectortypes(proargtypes);