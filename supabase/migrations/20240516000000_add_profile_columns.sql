-- Add profile information columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS profession VARCHAR(50) DEFAULT 'student',
ADD COLUMN IF NOT EXISTS course_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS stream VARCHAR(200),
ADD COLUMN IF NOT EXISTS field_of_work VARCHAR(200),
ADD COLUMN IF NOT EXISTS designation VARCHAR(200),
ADD COLUMN IF NOT EXISTS organization VARCHAR(300),
ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR(20);

-- Create index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_profession ON users(profession);

-- Add constraint to ensure profession is either 'student' or 'working'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_profession') THEN
        ALTER TABLE users
        ADD CONSTRAINT chk_profession
        CHECK (profession IN ('student', 'working'));
    END IF;
END $$;