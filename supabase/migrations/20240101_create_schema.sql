-- Supabase migration for AI Fundamentals for Designers Course
-- This script creates the database schema required for the course application

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Session storage table - required for Replit Auth
CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP NOT NULL
);

-- Create index for sessions expire time
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);

-- Users table (replaces auth.users for custom user data)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE,
    first_name VARCHAR,
    last_name VARCHAR,
    profile_image_url VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course progress tracking table
CREATE TABLE IF NOT EXISTS user_progress (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_id INTEGER NOT NULL,
    completed_sections TEXT[] DEFAULT '{}',
    completed_slides TEXT[] DEFAULT '{}',
    quiz_scores JSONB DEFAULT '{}',
    current_slide INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Badges earned by users
CREATE TABLE IF NOT EXISTS user_badges (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_type VARCHAR NOT NULL,
    badge_data JSONB NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates for course completion
CREATE TABLE IF NOT EXISTS user_certificates (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id VARCHAR NOT NULL DEFAULT 'ai-fundamentals-5day',
    certificate_data JSONB NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_day ON user_progress(user_id, day_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_type ON user_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_user_certificates_user ON user_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_course ON user_certificates(course_id);

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions table (Replit Auth)
CREATE POLICY "Users can view own sessions" ON sessions
    FOR SELECT USING (true); -- Sessions are managed by auth system

CREATE POLICY "Users can insert own sessions" ON sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own sessions" ON sessions
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE USING (true);

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id);

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

-- RLS Policies for user_certificates table
CREATE POLICY "Users can view own certificates" ON user_certificates
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own certificates" ON user_certificates
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own certificates" ON user_certificates
    FOR DELETE USING (auth.uid()::text = user_id);

-- Function to create user profile after signup
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON sessions TO anon;
GRANT ALL ON sessions TO authenticated;
GRANT ALL ON users TO anon;
GRANT ALL ON users TO authenticated;
GRANT ALL ON user_progress TO anon;
GRANT ALL ON user_progress TO authenticated;
GRANT ALL ON user_badges TO anon;
GRANT ALL ON user_badges TO authenticated;
GRANT ALL ON user_certificates TO anon;
GRANT ALL ON user_certificates TO authenticated;