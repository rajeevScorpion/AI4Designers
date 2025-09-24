-- =============================================
-- AI4Designers Database Schema Migration
-- Complete schema rebuild for consistent naming and functionality
-- Run this in your Supabase SQL editor
-- =============================================

-- Note: Cleanup should be done first using 000_cleanup_existing.sql
-- This file only creates the new schema

-- =============================================
-- TABLE: users
-- Stores user profile information
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    fullname TEXT,
    phone TEXT,
    profession TEXT DEFAULT 'student' CHECK (profession IN ('student', 'working')),
    organization TEXT,
    date_of_birth DATE,
    profile_locked BOOLEAN DEFAULT false,
    is_profile_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_profession ON users(profession);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- =============================================
-- TABLE: user_progress
-- Tracks learning progress across 5-day course
-- =============================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_id INTEGER NOT NULL CHECK (day_id >= 1 AND day_id <= 5),
    current_slide INTEGER DEFAULT 0 CHECK (current_slide >= 0),
    completed_sections TEXT[] DEFAULT '{}',
    completed_slides TEXT[] DEFAULT '{}',
    quiz_scores JSONB DEFAULT '{}',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_day_id ON user_progress(day_id);
CREATE INDEX idx_user_progress_completed ON user_progress(is_completed);

-- Add unique constraint separately
ALTER TABLE user_progress ADD CONSTRAINT user_progress_user_day_unique UNIQUE (user_id, day_id);

-- Add trigger for updated_at
CREATE TRIGGER handle_user_progress_updated_at
    BEFORE UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- =============================================
-- TABLE: user_badges
-- Stores achievement badges earned by users
-- =============================================
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    badge_description TEXT,
    badge_icon TEXT,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at);

-- =============================================
-- TABLE: user_certificates
-- Stores completion certificates for users
-- =============================================
CREATE TABLE user_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    certificate_id TEXT NOT NULL,
    certificate_name TEXT NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_user_certificates_user_id ON user_certificates(user_id);
CREATE INDEX idx_user_certificates_certificate_id ON user_certificates(certificate_id);
CREATE INDEX idx_user_certificates_issued_at ON user_certificates(issued_at);

-- =============================================
-- TABLE: sessions
-- Manages authentication sessions
-- =============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_session_token ON sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- =============================================
-- Enable Row Level Security (RLS) on all tables
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Schema Comments for Documentation
-- =============================================
COMMENT ON TABLE users IS 'User profile information for AI4Designers platform';
COMMENT ON TABLE user_progress IS 'Tracks learning progress across the 5-day AI course';
COMMENT ON TABLE user_badges IS 'Achievement badges earned by users';
COMMENT ON TABLE user_certificates IS 'Completion certificates issued to users';
COMMENT ON TABLE sessions IS 'Authentication session management';

COMMENT ON COLUMN users.id IS 'Unique identifier for the user';
COMMENT ON COLUMN users.email IS 'User email address (unique)';
COMMENT ON COLUMN users.fullname IS 'User full name';
COMMENT ON COLUMN users.profession IS 'User profession: student or working professional';
COMMENT ON COLUMN users.profile_locked IS 'Whether user profile is locked from changes';
COMMENT ON COLUMN users.is_profile_complete IS 'Whether user has completed their profile';

COMMENT ON COLUMN user_progress.id IS 'Unique identifier for progress record';
COMMENT ON COLUMN user_progress.user_id IS 'Reference to user (foreign key)';
COMMENT ON COLUMN user_progress.day_id IS 'Course day (1-5)';
COMMENT ON COLUMN user_progress.current_slide IS 'Current slide number user is on';
COMMENT ON COLUMN user_progress.completed_sections IS 'Array of completed section IDs';
COMMENT ON COLUMN user_progress.completed_slides IS 'Array of completed slide IDs';
COMMENT ON COLUMN user_progress.quiz_scores IS 'JSON object of quiz scores';
COMMENT ON COLUMN user_progress.is_completed IS 'Whether user completed this day';

-- =============================================
-- Migration Complete
-- =============================================

-- Verify schema creation
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('users', 'user_progress', 'user_badges', 'user_certificates', 'sessions')
ORDER BY table_name, ordinal_position;