-- Migration: Add sync tracking fields for offline-first architecture
-- Version: 001_sync_tracking
-- Date: 2025-01-08
-- Author: Offline-First Refactor

-- ===== DESCRIPTION =====
-- This migration adds fields required for tracking sync status and client-side
-- operations in the offline-first architecture. These fields will help manage
-- conflict resolution and incremental sync between IndexedDB and Supabase.

-- ===== MIGRATION SCRIPT =====

-- Add sync tracking fields to user_progress table
ALTER TABLE user_progress
ADD COLUMN IF NOT EXISTS client_id VARCHAR,
ADD COLUMN IF NOT EXISTS sync_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS conflict_data JSONB DEFAULT '{}';

-- Add indexes for better sync performance
CREATE INDEX IF NOT EXISTS idx_user_progress_client_id ON user_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_updated_at ON user_progress(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_progress_sync_version ON user_progress(sync_version);

-- Create function to get incremental changes since last sync
CREATE OR REPLACE FUNCTION get_progress_since(user_id_param TEXT, since_timestamp TIMESTAMP)
RETURNS TABLE (
    id VARCHAR,
    day_id INTEGER,
    completed_sections TEXT[],
    completed_slides TEXT[],
    quiz_scores JSONB,
    current_slide INTEGER,
    is_completed BOOLEAN,
    completed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    client_id VARCHAR,
    sync_version INTEGER,
    last_sync_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        up.id,
        up.day_id,
        up.completed_sections,
        up.completed_slides,
        up.quiz_scores,
        up.current_slide,
        up.is_completed,
        up.completed_at,
        up.created_at,
        up.updated_at,
        up.client_id,
        up.sync_version,
        up.last_sync_at
    FROM user_progress up
    WHERE up.user_id = user_id_param
    AND up.updated_at > since_timestamp
    ORDER BY up.updated_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle sync conflicts
CREATE OR REPLACE FUNCTION resolve_sync_conflict(
    user_id_param TEXT,
    day_id_param INTEGER,
    client_data JSONB,
    conflict_strategy TEXT DEFAULT 'merge'
)
RETURNS TABLE (
    success BOOLEAN,
    resolved_data JSONB,
    conflict_detected BOOLEAN
) AS $$
DECLARE
    existing_progress RECORD;
    resolved_data JSONB;
BEGIN
    -- Get existing progress
    SELECT * INTO existing_progress
    FROM user_progress
    WHERE user_id = user_id_param AND day_id = day_id_param;

    IF NOT FOUND THEN
        -- No existing record, create new one
        INSERT INTO user_progress (
            user_id,
            day_id,
            completed_sections,
            completed_slides,
            quiz_scores,
            current_slide,
            is_completed,
            completed_at,
            client_id,
            sync_version,
            conflict_data
        ) VALUES (
            user_id_param,
            day_id_param,
            COALESCE((client_data->>'completedSections')::TEXT[], ARRAY[]::TEXT[]),
            COALESCE((client_data->>'completedSlides')::TEXT[], ARRAY[]::TEXT[]),
            COALESCE(client_data->'quizScores', '{}'::JSONB),
            COALESCE((client_data->>'currentSlide')::INTEGER, 0),
            COALESCE((client_data->>'isCompleted')::BOOLEAN, FALSE),
            CASE WHEN (client_data->>'isCompleted')::BOOLEAN THEN NOW() ELSE NULL END,
            client_data->>'clientId',
            COALESCE((client_data->>'syncVersion')::INTEGER, 1),
            '{}'::JSONB
        )
        RETURNING * INTO existing_progress;

        RETURN QUERY SELECT TRUE, to_jsonb(existing_progress), FALSE;
        RETURN;
    END IF;

    -- Handle conflict resolution based on strategy
    conflict_detected := TRUE;

    IF conflict_strategy = 'local_wins' THEN
        -- Client data overwrites server
        resolved_data := jsonb_build_object(
            'completed_sections', COALESCE((client_data->>'completedSections')::TEXT[], existing_progress.completed_sections),
            'completed_slides', COALESCE((client_data->>'completedSlides')::TEXT[], existing_progress.completed_slides),
            'quiz_scores', COALESCE(client_data->'quizScores', existing_progress.quiz_scores),
            'current_slide', COALESCE((client_data->>'currentSlide')::INTEGER, existing_progress.current_slide),
            'is_completed', COALESCE((client_data->>'isCompleted')::BOOLEAN, existing_progress.is_completed),
            'sync_version', existing_progress.sync_version + 1
        );
    ELSIF conflict_strategy = 'remote_wins' THEN
        -- Server data stays as is
        resolved_data := to_jsonb(existing_progress);
    ELSE
        -- Default: merge strategy
        resolved_data := jsonb_build_object(
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
            'current_slide', GREATEST(
                COALESCE((client_data->>'currentSlide')::INTEGER, 0),
                existing_progress.current_slide
            ),
            'is_completed', (
                COALESCE((client_data->>'isCompleted')::BOOLEAN, FALSE) OR existing_progress.is_completed
            ),
            'sync_version', existing_progress.sync_version + 1
        );
    END IF;

    -- Update the record with resolved data
    UPDATE user_progress SET
        completed_sections = (resolved_data->>'completed_sections')::TEXT[],
        completed_slides = (resolved_data->>'completed_slides')::TEXT[],
        quiz_scores = resolved_data->>'quiz_scores',
        current_slide = (resolved_data->>'current_slide')::INTEGER,
        is_completed = (resolved_data->>'is_completed')::BOOLEAN,
        completed_at = CASE WHEN (resolved_data->>'is_completed')::BOOLEAN AND NOT existing_progress.is_completed
                          THEN NOW()
                          ELSE existing_progress.completed_at END,
        sync_version = (resolved_data->>'sync_version')::INTEGER,
        last_sync_at = NOW(),
        conflict_data = jsonb_build_object(
            'client_data', client_data,
            'server_data', to_jsonb(existing_progress),
            'resolved_at', NOW(),
            'strategy', conflict_strategy
        ),
        updated_at = NOW()
    WHERE id = existing_progress.id;

    RETURN QUERY SELECT TRUE, resolved_data, conflict_detected;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically increment sync_version on updates
CREATE OR REPLACE FUNCTION increment_sync_version()
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
$$ LANGUAGE plpgsql;

-- Apply trigger to user_progress table
DROP TRIGGER IF EXISTS increment_user_progress_sync_version ON user_progress;
CREATE TRIGGER increment_user_progress_sync_version
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION increment_sync_version();

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_progress_since TO authenticated;
GRANT EXECUTE ON FUNCTION resolve_sync_conflict TO authenticated;

-- ===== VERIFICATION =====
-- Verify the migration was successful
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_progress'
    AND column_name IN ('client_id', 'sync_version', 'last_sync_at', 'conflict_data')
ORDER BY column_name;