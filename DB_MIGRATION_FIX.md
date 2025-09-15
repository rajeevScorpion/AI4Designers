# Database Migration Fix

## Problem Identified
The error `ERROR: 42P01: relation "users" does not exist` was caused by a mismatch between the Drizzle ORM schema and the SQL migration file:

1. **Drizzle Schema** (`shared/schema.ts`): Uses `VARCHAR` for ID fields
2. **Migration File**: Was using `UUID` for ID fields

## Changes Made

### 1. Updated `supabase/migrations/20240101_create_schema.sql`:
- Changed all `UUID` types to `VARCHAR` to match Drizzle schema
- Updated `TEXT` types to `VARCHAR` for consistency
- Fixed `auth.uid()` comparisons to use `auth.uid()::text`
- Added missing `sessions` table creation
- Added proper RLS policies for all tables
- Added `gen_random_uuid()` instead of `uuid_generate_v4()`

### 2. Updated `drizzle.config.ts`:
- Added dotenv config loading to read `.env.local` file

### 3. Key Changes Summary:
```sql
-- Before (causing error):
id UUID PRIMARY KEY DEFAULT uuid_generate_v4()

-- After (fixed):
id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()
```

## Manual Migration Steps

Due to network connectivity issues, run this migration manually:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `fbcrucweylsfyvlzacxu`
3. Go to SQL Editor
4. Copy content from `supabase/migrations/20240101_create_schema_verified.sql`
5. Paste and execute

## Verification

After running the migration, verify tables exist:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected tables:
- sessions
- users
- user_progress
- user_badges
- user_certificates

## Next Steps

1. Run the migration in Supabase dashboard
2. Test the application locally
3. Verify authentication works
4. Check that progress tracking functions correctly