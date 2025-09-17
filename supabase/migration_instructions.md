# Database Migration Instructions for AI Fundamentals Course

## Overview
This migration ensures your Supabase database is fully compatible with the Drizzle ORM schema and includes proper Row Level Security (RLS) policies.

## Migration File
The complete migration has been created at: `supabase/migrations/20240101_complete_migration.sql`

## Manual Execution Steps

Since there's a network connectivity issue, you'll need to run this migration manually in the Supabase dashboard:

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project: `bhoywggxxpiaphqipkwe`

2. **Open the SQL Editor**
   - Go to the "SQL Editor" section in the left sidebar
   - Click "New query"

3. **Copy and Execute the Migration**
   - Open `supabase/migrations/20240101_complete_migration.sql`
   - Copy the entire content
   - Paste it into the SQL Editor
   - Click "Run"

## What This Migration Does

### 1. **Tables Created/Updated**
- ✅ `users` - User profile storage
- ✅ `user_progress` - Course progress tracking
- ✅ `user_badges` - Gamification badges
- ✅ `user_certificates` - Course completion certificates
- ✅ `sessions` - Session storage for Replit Auth

### 2. **Row Level Security (RLS) Policies**
- **Users can only access their own data** (progress, badges, certificates)
- **Public read access** for user profiles, badges, and certificates (for display purposes)
- **Full access** for authenticated users on their own data
- **Session management** policies for Replit Auth

### 3. **Auth Integration**
- **Automatic profile creation** when users sign up via Supabase Auth
- **Profile synchronization** when auth users update their information
- **UUID to VARCHAR conversion** for compatibility with Drizzle schema

### 4. **Performance Improvements**
- **Indexes** for better query performance
- **Functions** for common operations (progress summary, completion checks)
- **Session cleanup** function for expired sessions

### 5. **Permissions**
- **Proper grants** for anon, authenticated, and service_role users
- **Schema usage** permissions for all roles
- **Sequence usage** permissions

## Verification Steps

After running the migration, verify the setup:

1. **Check Tables Exist**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_type = 'BASE TABLE'
   ORDER BY table_name;
   ```

2. **Check RLS Status**
   ```sql
   SELECT schemaname, tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```

3. **Check Policies**
   ```sql
   SELECT tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename, policyname;
   ```

## Test User

A test user has been configured:
- **Email:** `test@example.com`
- **Password:** `password123`

## Troubleshooting

If you encounter any issues:

1. **Network Issues**: The migration script handles most network-related errors gracefully
2. **Permission Issues**: The migration includes comprehensive permission grants
3. **Schema Conflicts**: The migration uses `IF NOT EXISTS` and drops conflicting policies first

## Next Steps

After the migration is complete:

1. Test the user authentication flow
2. Verify progress tracking works
3. Check that badges and certificates are created properly
4. Ensure the application can connect to the database

## Compatibility

This migration ensures compatibility between:
- **Drizzle ORM schema** (TypeScript definitions)
- **Supabase Auth** (user management)
- **Replit Auth** (session management)
- **Row Level Security** (data protection)

The database will be ready for the full AI Fundamentals for Designers course application.