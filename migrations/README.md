# AI4Designers Database Migration

This migration completely rebuilds the database schema with consistent naming conventions and proper Row Level Security (RLS) policies.

## Migration Files

1. **`001_create_schema.sql`** - Creates the complete database schema
2. **`002_create_rls_policies.sql`** - Sets up Row Level Security policies
3. **`003_verification.sql`** - Verifies the migration was successful

## Migration Steps

### 1. Backup Existing Data (Optional)

If you have any data you want to keep, export it before running these migrations.

### 2. Run the Migrations

Execute these SQL files in order in your Supabase SQL editor:

```sql
-- Run this FIRST to clean up existing schema
-- File: 000_cleanup_existing.sql

-- Then run this
-- File: 001_create_schema.sql

-- Then run this
-- File: 002_create_rls_policies.sql

-- Finally run this to verify
-- File: 003_verification.sql
```

### 3. Verification

After running the migrations, check the verification output to ensure:

- ✅ All tables exist
- ✅ All columns have correct names and types
- ✅ RLS is enabled on all tables
- ✅ RLS policies are correctly configured
- ✅ Foreign key constraints are working
- ✅ Indexes are created for performance

## Schema Changes

### Tables Created

1. **`users`** - User profile information
   - `id` (UUID, primary key)
   - `email` (TEXT, unique)
   - `fullname` (TEXT)
   - `phone` (TEXT)
   - `profession` (TEXT, enum: student/working)
   - `organization` (TEXT)
   - `date_of_birth` (DATE)
   - `profile_locked` (BOOLEAN)
   - `is_profile_complete` (BOOLEAN)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

2. **`user_progress`** - Course progress tracking
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key)
   - `day_id` (INTEGER, 1-5)
   - `current_slide` (INTEGER)
   - `completed_sections` (TEXT[])
   - `completed_slides` (TEXT[])
   - `quiz_scores` (JSONB)
   - `is_completed` (BOOLEAN)
   - `completed_at` (TIMESTAMPTZ)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

3. **`user_badges`** - Achievement badges
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key)
   - `badge_id` (TEXT)
   - `badge_name` (TEXT)
   - `badge_description` (TEXT)
   - `badge_icon` (TEXT)
   - `earned_at` (TIMESTAMPTZ)
   - `created_at` (TIMESTAMPTZ)

4. **`user_certificates`** - Completion certificates
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key)
   - `certificate_id` (TEXT)
   - `certificate_name` (TEXT)
   - `issued_at` (TIMESTAMPTZ)
   - `certificate_url` (TEXT)
   - `created_at` (TIMESTAMPTZ)

5. **`sessions`** - Authentication sessions
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key)
   - `session_token` (TEXT, unique)
   - `expires_at` (TIMESTAMPTZ)
   - `created_at` (TIMESTAMPTZ)

### Naming Convention

- **Database**: `snake_case` (e.g., `user_id`, `day_id`, `created_at`)
- **TypeScript**: `camelCase` (e.g., `userId`, `dayId`, `createdAt`)
- **API**: JSON objects use camelCase keys

### RLS Policies

- Users can only access their own data
- Service role has administrative access
- All tables have proper access controls
- Authenticated users can read/write their own records

## Code Updates

The following files have been updated to work with the new schema:

### API Routes
- `/api/progress/route.ts` - Uses consistent table and column names
- `/api/progress/[dayId]/route.ts` - Updated for new schema
- `/api/create-user/route.ts` - Fixed column names

### New Files Created
- `/src/shared/databaseTypes.ts` - Standardized TypeScript interfaces
- `/src/app/supabase-test-new/page.tsx` - New test page for new schema

### Key Changes
- `userProgress` → `user_progress`
- `userBadges` → `user_badges`
- `userId` → `user_id`
- `dayId` → `day_id`
- `currentSlide` → `current_slide`
- `isCompleted` → `is_completed`
- `completedSections` → `completed_sections`
- `completedSlides` → `completed_slides`
- `quizScores` → `quiz_scores`
- `completedAt` → `completed_at`
- `updatedAt` → `updated_at`
- `createdAt` → `created_at`

## Testing

### Test Pages
- Visit `/supabase-test-new` to test CRUD operations with the new schema
- Visit `/supabase-read-test` for read-only testing
- Visit `/supabase-diagnosis` for detailed diagnosis

### API Endpoints
- `POST /api/progress` - Create/update progress
- `GET /api/progress` - Get user progress
- `POST /api/progress/[dayId]` - Update specific day progress
- `POST /api/create-user` - Create user record

## Troubleshooting

### Common Issues

1. **Column not found errors**: Make sure all column names use snake_case
2. **Table not found errors**: Verify table names (e.g., `user_progress` not `userProgress`)
3. **Permission denied**: Check RLS policies are correctly applied
4. **Foreign key violations**: Ensure user exists before creating related records

### Verification

If you encounter issues, run the verification script:

```sql
-- Execute 003_verification.sql
```

This will show:
- Table existence and structure
- RLS policy status
- Foreign key constraints
- Index and trigger status
- Test results

## Rollback

If you need to rollback, you can drop all tables and start over:

```sql
DROP TABLE IF EXISTS user_certificates CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

## Support

If you encounter any issues:
1. Check the verification output
2. Review the migration files
3. Test with the provided test pages
4. Ensure you're using the latest schema structure