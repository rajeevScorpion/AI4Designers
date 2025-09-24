-- =============================================
-- AI4Designers RLS Policies Migration
-- Comprehensive Row Level Security policies
-- Run this AFTER the schema migration
-- =============================================

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Service role can access all users (for administrative functions)
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================
-- USER_PROGRESS TABLE POLICIES
-- =============================================

-- Policy: Users can read their own progress
CREATE POLICY "Users can read own progress" ON user_progress
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own progress
CREATE POLICY "Users can delete own progress" ON user_progress
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Service role can manage all progress
CREATE POLICY "Service role can manage all progress" ON user_progress
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================
-- USER_BADGES TABLE POLICIES
-- =============================================

-- Policy: Users can read their own badges
CREATE POLICY "Users can read own badges" ON user_badges
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own badges (through system)
CREATE POLICY "Users can insert own badges" ON user_badges
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can manage all badges
CREATE POLICY "Service role can manage all badges" ON user_badges
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================
-- USER_CERTIFICATES TABLE POLICIES
-- =============================================

-- Policy: Users can read their own certificates
CREATE POLICY "Users can read own certificates" ON user_certificates
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own certificates (through system)
CREATE POLICY "Users can insert own certificates" ON user_certificates
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Service role can manage all certificates
CREATE POLICY "Service role can manage all certificates" ON user_certificates
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================
-- SESSIONS TABLE POLICIES
-- =============================================

-- Policy: Users can read their own sessions
CREATE POLICY "Users can read own sessions" ON sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own sessions (during login)
CREATE POLICY "Users can insert own sessions" ON sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own sessions (during logout)
CREATE POLICY "Users can delete own sessions" ON sessions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Service role can manage all sessions
CREATE POLICY "Service role can manage all sessions" ON sessions
    FOR ALL
    USING (auth.role() = 'service_role');

-- =============================================
-- ADDITIONAL SECURITY FUNCTIONS
-- =============================================

-- Function to check if user is admin (for future use)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- You can customize this function based on your admin requirements
    -- For now, only service role has admin privileges
    RETURN auth.role() = 'service_role';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user ID safely
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS UUID AS $$
BEGIN
    RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- POLICY VERIFICATION
-- =============================================

-- View to check all policies
CREATE OR REPLACE VIEW rls_policies_view AS
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- View to check RLS status
CREATE OR REPLACE VIEW rls_status_view AS
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'user_progress', 'user_badges', 'user_certificates', 'sessions')
ORDER BY tablename;

-- =============================================
-- TEST DATA (Optional - for development)
-- =============================================

-- Create a function to insert test user (for development)
CREATE OR REPLACE FUNCTION insert_test_user()
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    INSERT INTO users (email, fullname, profession, organization)
    VALUES ('test@example.com', 'Test User', 'student', 'Test Organization')
    ON CONFLICT (email) DO UPDATE
    SET fullname = EXCLUDED.fullname,
        profession = EXCLUDED.profession,
        organization = EXCLUDED.organization,
        updated_at = NOW()
    RETURNING id INTO user_id;

    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Migration Complete
-- =============================================

-- Display all created policies
SELECT 'RLS Policies Created:' as status;

SELECT
    tablename,
    policyname,
    cmd,
    string_agg(roles, ', ') as roles
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename, policyname, cmd
ORDER BY tablename, cmd;

-- Display RLS status
SELECT 'RLS Status:' as status;

SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('users', 'user_progress', 'user_badges', 'user_certificates', 'sessions')
ORDER BY tablename;