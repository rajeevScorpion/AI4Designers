-- Complete database migration for AI Fundamentals Course
-- This migration ensures compatibility between Drizzle schema and Supabase requirements
-- Includes RLS policies, auth integration, and missing table structures

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sessions table for Replit Auth (if not exists)
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create index for sessions expire time
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add timestamp update triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_progress_updated_at') THEN
        CREATE TRIGGER update_user_progress_updated_at
        BEFORE UPDATE ON user_progress
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;

-- Enable Row Level Security on all tables
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    -- Tables might not exist or RLS already enabled
    NULL;
END
$$;

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    DROP POLICY IF EXISTS "Users can view own progress" ON user_progress;
    DROP POLICY IF EXISTS "Users can insert own progress" ON user_progress;
    DROP POLICY IF EXISTS "Users can update own progress" ON user_progress;
    DROP POLICY IF EXISTS "Users can delete own progress" ON user_progress;
    DROP POLICY IF EXISTS "Users can view own badges" ON user_badges;
    DROP POLICY IF EXISTS "Users can insert own badges" ON user_badges;
    DROP POLICY IF EXISTS "Users can delete own badges" ON user_badges;
    DROP POLICY IF EXISTS "Users can view own certificates" ON user_certificates;
    DROP POLICY IF EXISTS "Users can insert own certificates" ON user_certificates;
    DROP POLICY IF EXISTS "Users can delete own certificates" ON user_certificates;
    DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
    DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
    DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
    DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;
EXCEPTION WHEN OTHERS THEN
    -- Policies might not exist
    NULL;
END
$$;

-- Create RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Allow public read access for user profiles (for display purposes)
CREATE POLICY "Public can view user profiles" ON users
    FOR SELECT USING (true);

-- RLS Policies for user_progress table
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own progress" ON user_progress
    FOR DELETE USING (auth.uid()::text = user_id);

-- RLS Policies for user_badges table
CREATE POLICY "Users can view own badges" ON user_badges
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own badges" ON user_badges
    FOR DELETE USING (auth.uid()::text = user_id);

-- Allow public read access for badges (for gamification display)
CREATE POLICY "Public can view user badges" ON user_badges
    FOR SELECT USING (true);

-- RLS Policies for user_certificates table
CREATE POLICY "Users can view own certificates" ON user_certificates
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own certificates" ON user_certificates
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own certificates" ON user_certificates
    FOR DELETE USING (auth.uid()::text = user_id);

-- Allow public read access for certificates (for verification)
CREATE POLICY "Public can view user certificates" ON user_certificates
    FOR SELECT USING (true);

-- RLS Policies for sessions table (Replit Auth)
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (true); -- Sessions are managed by auth system

CREATE POLICY "Users can insert own sessions" ON sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE USING (true);

-- Function to create user profile after Supabase auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, first_name, last_name, profile_image_url)
    VALUES (
        NEW.id::text,
        NEW.email,
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name',
        NEW.raw_user_meta_data->>'profile_image_url'
    );
    RETURN NEW;
EXCEPTION WHEN unique_violation THEN
    -- User already exists, just return
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on Supabase auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to handle user profile updates from auth
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET
        email = NEW.email,
        first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', users.first_name),
        last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', users.last_name),
        profile_image_url = COALESCE(NEW.raw_user_meta_data->>'profile_image_url', users.profile_image_url),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id::text;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user profile when auth user is updated
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- Grant necessary permissions for all roles
DO $$
BEGIN
    -- Grant schema usage
    GRANT USAGE ON SCHEMA public TO anon;
    GRANT USAGE ON SCHEMA public TO authenticated;
    GRANT USAGE ON SCHEMA public TO service_role;

    -- Grant table permissions
    GRANT ALL ON users TO anon;
    GRANT ALL ON users TO authenticated;
    GRANT ALL ON users TO service_role;

    GRANT ALL ON user_progress TO anon;
    GRANT ALL ON user_progress TO authenticated;
    GRANT ALL ON user_progress TO service_role;

    GRANT ALL ON user_badges TO anon;
    GRANT ALL ON user_badges TO authenticated;
    GRANT ALL ON user_badges TO service_role;

    GRANT ALL ON user_certificates TO anon;
    GRANT ALL ON user_certificates TO authenticated;
    GRANT ALL ON user_certificates TO service_role;

    GRANT ALL ON sessions TO anon;
    GRANT ALL ON sessions TO authenticated;
    GRANT ALL ON sessions TO service_role;

    -- Grant sequence usage if sequences exist
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
EXCEPTION WHEN OTHERS THEN
    -- Handle any permission errors gracefully
    NULL;
END
$$;

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM sessions
    WHERE expire < CURRENT_TIMESTAMP;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create index for better performance on user_progress queries
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON user_progress(is_completed, completed_at);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at);
CREATE INDEX IF NOT EXISTS idx_user_certificates_issued_at ON user_certificates(issued_at);

-- Create function to get user progress summary
CREATE OR REPLACE FUNCTION get_user_progress_summary(p_user_id TEXT)
RETURNS TABLE(
    total_days INTEGER,
    completed_days INTEGER,
    total_badges INTEGER,
    completion_percentage NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        5 as total_days, -- 5-day course
        COUNT(DISTINCT day_id) as completed_days,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = p_user_id) as total_badges,
        (COUNT(DISTINCT day_id) * 20.0) as completion_percentage -- 20% per day
    FROM user_progress
    WHERE user_id = p_user_id AND is_completed = true;
END;
$$ LANGUAGE plpgsql;

-- Create function to check if user has completed specific day
CREATE OR REPLACE FUNCTION is_day_completed(p_user_id TEXT, p_day_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    completion_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO completion_count
    FROM user_progress
    WHERE user_id = p_user_id AND day_id = p_day_id AND is_completed = true;

    RETURN completion_count > 0;
END;
$$ LANGUAGE plpgsql;