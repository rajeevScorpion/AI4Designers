-- =============================================
-- Migration: Comprehensive fix for function conflicts
-- Version: 20250109_fix_function_conflicts
-- Date: 2025-01-09
-- Description: Drops all conflicting function versions and recreates them properly
-- =============================================

-- =============================================
-- DROP ALL EXISTING VERSIONS OF FUNCTIONS
-- =============================================

-- Drop all versions of get_progress_since function
DROP FUNCTION IF EXISTS get_progress_since(TEXT, TIMESTAMPTZ) CASCADE;
DROP FUNCTION IF EXISTS get_progress_since(UUID, TIMESTAMPTZ) CASCADE;
DROP FUNCTION IF EXISTS get_progress_since(TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_progress_since(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_progress_since() CASCADE;

-- Drop all versions of resolve_sync_conflict function
DROP FUNCTION IF EXISTS resolve_sync_conflict(TEXT, INTEGER, JSONB, TEXT) CASCADE;
DROP FUNCTION IF EXISTS resolve_sync_conflict(UUID, INTEGER, JSONB, TEXT) CASCADE;
DROP FUNCTION IF EXISTS resolve_sync_conflict(TEXT, INTEGER, JSONB) CASCADE;
DROP FUNCTION IF EXISTS resolve_sync_conflict(UUID, INTEGER, JSONB) CASCADE;

-- Drop increment_sync_version if it exists
DROP FUNCTION IF EXISTS increment_sync_version() CASCADE;

-- =============================================
-- RECREATE FUNCTIONS WITH PROPER SIGNATURES
-- =============================================

-- Create get_progress_since function (takes TEXT user_id for compatibility)
CREATE FUNCTION get_progress_since(user_id_param TEXT, since_timestamp TIMESTAMPTZ)
RETURNS TABLE (
    id UUID,
    day_id INTEGER,
    user_id UUID,
    current_slide INTEGER,
    completed_sections TEXT[],
    completed_slides TEXT[],
    quiz_scores JSONB,
    is_completed BOOLEAN,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    client_id VARCHAR,
    sync_version INTEGER,
    last_sync_at TIMESTAMPTZ,
    conflict_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.id,
        up.day_id,
        up.user_id,
        up.current_slide,
        up.completed_sections,
        up.completed_slides,
        up.quiz_scores,
        up.is_completed,
        up.completed_at,
        up.created_at,
        up.updated_at,
        up.client_id,
        up.sync_version,
        up.last_sync_at,
        up.conflict_data
    FROM user_progress up
    WHERE up.user_id::text = user_id_param
    AND up.updated_at > since_timestamp
    ORDER BY up.updated_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create resolve_sync_conflict function
CREATE FUNCTION resolve_sync_conflict(
    user_id_param TEXT,
    day_id_param INTEGER,
    client_data JSONB,
    conflict_strategy TEXT DEFAULT 'merge'
)
RETURNS TABLE (
    success BOOLEAN,
    resolved_data JSONB,
    conflict_detected BOOLEAN,
    progress_id UUID
) AS $$
DECLARE
    existing_progress RECORD;
    resolved_data JSONB;
    new_progress_id UUID;
BEGIN
    -- Get existing progress
    SELECT * INTO existing_progress
    FROM user_progress
    WHERE user_id::text = user_id_param AND day_id = day_id_param;

    IF NOT FOUND THEN
        -- No existing record, create new one
        INSERT INTO user_progress (
            user_id,
            day_id,
            current_slide,
            completed_sections,
            completed_slides,
            quiz_scores,
            is_completed,
            completed_at,
            client_id,
            sync_version,
            conflict_data
        ) VALUES (
            user_id_param::UUID,
            day_id_param,
            COALESCE((client_data->>'currentSlide')::INTEGER, 0),
            COALESCE((client_data->>'completedSections')::TEXT[], ARRAY[]::TEXT[]),
            COALESCE((client_data->>'completedSlides')::TEXT[], ARRAY[]::TEXT[]),
            COALESCE(client_data->'quizScores', '{}'::JSONB),
            COALESCE((client_data->>'isCompleted')::BOOLEAN, FALSE),
            CASE WHEN (client_data->>'isCompleted')::BOOLEAN THEN NOW() ELSE NULL END,
            client_data->>'clientId',
            COALESCE((client_data->>'syncVersion')::INTEGER, 1),
            '{}'::JSONB
        )
        RETURNING id INTO new_progress_id;

        RETURN QUERY SELECT TRUE, jsonb_build_object('id', new_progress_id), FALSE, new_progress_id;
        RETURN;
    END IF;

    -- Handle conflict resolution based on strategy
    resolved_data := jsonb_build_object(
        'id', existing_progress.id,
        'conflict_detected', TRUE
    );

    IF conflict_strategy = 'local_wins' THEN
        -- Client data overwrites server
        UPDATE user_progress SET
            current_slide = COALESCE((client_data->>'currentSlide')::INTEGER, existing_progress.current_slide),
            completed_sections = COALESCE((client_data->>'completedSections')::TEXT[], existing_progress.completed_sections),
            completed_slides = COALESCE((client_data->>'completedSlides')::TEXT[], existing_progress.completed_slides),
            quiz_scores = COALESCE(client_data->'quizScores', existing_progress.quiz_scores),
            is_completed = COALESCE((client_data->>'isCompleted')::BOOLEAN, existing_progress.is_completed),
            completed_at = CASE WHEN (client_data->>'isCompleted')::BOOLEAN AND NOT existing_progress.is_completed
                              THEN NOW()
                              ELSE existing_progress.completed_at END,
            client_id = COALESCE(client_data->>'clientId', existing_progress.client_id),
            conflict_data = jsonb_build_object(
                'client_data', client_data,
                'server_data', to_jsonb(existing_progress),
                'resolved_at', NOW(),
                'strategy', conflict_strategy
            ),
            updated_at = NOW()
        WHERE id = existing_progress.id;

        resolved_data := resolved_data ||
            jsonb_build_object(
                'current_slide', COALESCE((client_data->>'currentSlide')::INTEGER, existing_progress.current_slide),
                'completed_sections', COALESCE((client_data->>'completedSections')::TEXT[], existing_progress.completed_sections),
                'completed_slides', COALESCE((client_data->>'completedSlides')::TEXT[], existing_progress.completed_slides),
                'quiz_scores', COALESCE(client_data->'quizScores', existing_progress.quiz_scores),
                'is_completed', COALESCE((client_data->>'isCompleted')::BOOLEAN, existing_progress.is_completed)
            );

    ELSIF conflict_strategy = 'remote_wins' THEN
        -- Server data stays as is
        resolved_data := resolved_data || to_jsonb(existing_progress);
    ELSE
        -- Default: merge strategy
        resolved_data := resolved_data || jsonb_build_object(
            'current_slide', GREATEST(
                COALESCE((client_data->>'currentSlide')::INTEGER, 0),
                existing_progress.current_slide
            ),
            'completed_sections', (
                SELECT ARRAY(SELECT DISTINCT unnest(
                    array_cat(
                        COALESCE((client_data->>'completedSections')::TEXT[], ARRAY[]::TEXT[]),
                        existing_progress.completed_sections
                    )
                ))
            ),
            'completed_slides', (
                SELECT ARRAY(SELECT DISTINCT unnest(
                    array_cat(
                        COALESCE((client_data->>'completedSlides')::TEXT[], ARRAY[]::TEXT[]),
                        existing_progress.completed_slides
                    )
                ))
            ),
            'quiz_scores', (
                SELECT jsonb_object_agg(key, value)
                FROM (
                    SELECT key, value FROM jsonb_each_text(COALESCE(client_data->'quizScores', '{}'::JSONB))
                    UNION
                    SELECT key, value FROM jsonb_each_text(existing_progress.quiz_scores)
                ) t
            ),
            'is_completed', (
                COALESCE((client_data->>'isCompleted')::BOOLEAN, FALSE) OR existing_progress.is_completed
            )
        );

        UPDATE user_progress SET
            current_slide = GREATEST(
                COALESCE((client_data->>'currentSlide')::INTEGER, 0),
                existing_progress.current_slide
            ),
            completed_sections = (
                SELECT ARRAY(SELECT DISTINCT unnest(
                    array_cat(
                        COALESCE((client_data->>'completedSections')::TEXT[], ARRAY[]::TEXT[]),
                        existing_progress.completed_sections
                    )
                ))
            ),
            completed_slides = (
                SELECT ARRAY(SELECT DISTINCT unnest(
                    array_cat(
                        COALESCE((client_data->>'completedSlides')::TEXT[], ARRAY[]::TEXT[]),
                        existing_progress.completed_slides
                    )
                ))
            ),
            quiz_scores = (
                SELECT jsonb_object_agg(key, value)
                FROM (
                    SELECT key, value FROM jsonb_each_text(COALESCE(client_data->'quizScores', '{}'::JSONB))
                    UNION
                    SELECT key, value FROM jsonb_each_text(existing_progress.quiz_scores)
                ) t
            ),
            is_completed = (
                COALESCE((client_data->>'isCompleted')::BOOLEAN, FALSE) OR existing_progress.is_completed
            ),
            completed_at = CASE WHEN (COALESCE((client_data->>'isCompleted')::BOOLEAN, FALSE) OR existing_progress.is_completed)
                              AND NOT existing_progress.is_completed
                              THEN NOW()
                              ELSE existing_progress.completed_at END,
            conflict_data = jsonb_build_object(
                'client_data', client_data,
                'server_data', to_jsonb(existing_progress),
                'resolved_at', NOW(),
                'strategy', conflict_strategy
            ),
            updated_at = NOW()
        WHERE id = existing_progress.id;
    END IF;

    RETURN QUERY SELECT TRUE, resolved_data, TRUE, existing_progress.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create increment_sync_version function
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

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant execute permissions to authenticated and service roles
GRANT EXECUTE ON FUNCTION get_progress_since TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION resolve_sync_conflict TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION increment_sync_version TO authenticated, service_role;

-- =============================================
-- VERIFY FUNCTIONS
-- =============================================

-- Verify functions were created successfully
SELECT 'Functions Created/Updated Successfully:' as status;

SELECT
    proname as function_name,
    oidvectortypes(proargtypes) as arg_types,
    prosecdef as security_definer,
    proowner::regrole as owner
FROM pg_proc
WHERE proname IN ('get_progress_since', 'resolve_sync_conflict', 'increment_sync_version')
ORDER BY proname;

-- Check for any remaining duplicate functions
SELECT
    'Duplicate Functions Found:' as alert,
    proname,
    COUNT(*) as count
FROM pg_proc
WHERE proname IN ('get_progress_since', 'resolve_sync_conflict')
GROUP BY proname
HAVING COUNT(*) > 1;