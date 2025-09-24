-- =============================================
-- AI4Designers Database Cleanup Script
-- Run this FIRST to clean up existing schema
-- =============================================

-- Drop all existing tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS user_certificates CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any existing policies that might conflict
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON users;
DROP POLICY IF EXISTS "Enable update access for all users" ON users;
DROP POLICY IF EXISTS "Enable delete access for all users" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert own data" ON users;
DROP POLICY IF EXISTS "Service role can manage all users" ON users;

-- Drop any existing functions
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;

-- Show cleanup completed
SELECT 'Database cleanup completed successfully!' as status;
SELECT 'All existing tables, policies, and functions have been removed.' as message;
SELECT 'You can now run the 001_create_schema.sql migration.' as next_step;