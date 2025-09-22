-- Add profile locking columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- Create index for faster profile status lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_locked ON users(profile_locked);
CREATE INDEX IF NOT EXISTS idx_users_profile_complete ON users(is_profile_complete);

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN users.profile_locked IS 'Indicates if the user profile has been locked and can no longer be modified';
COMMENT ON COLUMN users.is_profile_complete IS 'Indicates if the user has completed all required profile fields';