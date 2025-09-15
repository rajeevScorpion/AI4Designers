# AI Fundamentals for Designers - Supabase Migration Guide

This guide will help you migrate the AI Fundamentals for Designers course platform from the existing Linux-based Replit Auth system to Supabase, and deploy it on Vercel with Windows compatibility.

## Prerequisites

1. Node.js 18+ installed
2. Supabase account (https://supabase.com)
3. Vercel account (https://vercel.com)
4. Git installed

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter project name: `ai-fundamentals-designers`
4. Enter database password (save this securely)
5. Select a region close to your users
6. Click "Create new project"

## Step 2: Configure Supabase Auth

1. In your Supabase project, go to "Authentication" > "Providers"
2. Enable the following providers:
   - Email/Password
   - Google (for OAuth)
3. Configure site URL: `http://localhost:5173` (development) and your production URL
4. Go to "Authentication" > "URL Configuration"
5. Set Site URL to your development/production URL
6. Set Redirect URLs to include:
   - `http://localhost:5173/**`
   - `https://your-domain.com/**`

## Step 3: Run Database Migration

1. Copy your Supabase project URL and service role key from Project Settings > API
2. Create a `.env.local` file in the project root:
   ```bash
   cp .env.example .env.local
   ```
3. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Run the migration:
   ```bash
   # On Windows
   npm run migrate:windows

   # On Linux/Mac
   npm run migrate
   ```

## Step 4: Test Locally

1. Start the development server:
   ```bash
   # On Windows
   npm run dev:windows

   # On Linux/Mac
   npm run dev
   ```
2. Open http://localhost:5173 in your browser
3. Test the following features:
   - User registration and login
   - Course progress tracking
   - Quiz functionality
   - Badge system
   - Certificate generation

## Step 5: Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your Git repository
5. Configure environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `SESSION_SECRET` (generate a random string)
   - `NODE_ENV` = `production`
6. Click "Deploy"

## Step 6: Update Production URLs

1. In your Supabase project, update the Site URL to your Vercel deployment URL
2. Update the Redirect URLs to include your production domain
3. In your deployed application, update any hardcoded URLs in the frontend

## Windows Compatibility Notes

The project has been updated with Windows-specific scripts:

- `npm run dev:windows` - Development server for Windows
- `npm run start:windows` - Production server for Windows
- `npm run migrate:windows` - Database migration for Windows

## Environment Variables

### Required Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random secret for sessions

### Optional Variables
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)

## Troubleshooting

### Common Issues

1. **Migration fails**: Check your Supabase credentials and database URL
2. **Auth not working**: Ensure Supabase Auth is properly configured
3. **Build errors**: Make sure all dependencies are installed
4. **Windows path issues**: Use the Windows-specific npm scripts

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [Vercel Documentation](https://vercel.com/docs)
- Check browser console for errors
- Review server logs in Vercel dashboard

## Features Verification

After deployment, verify these features work:

1. ✅ User authentication (signup/login)
2. ✅ Course progress tracking
3. ✅ Quiz completion and scoring
4. ✅ Badge system functionality
5. ✅ Certificate generation
6. ✅ Responsive design
7. ✅ Cross-platform compatibility

## Database Schema

The migration creates these tables:
- `users` - User profiles and authentication data
- `user_progress` - Course completion tracking
- `user_badges` - Achievement badges
- `user_certificates` - Course completion certificates

All tables include Row Level Security (RLS) policies for data protection.

## Security Considerations

1. All environment variables are properly configured
2. Row Level Security is enabled on all tables
3. Authentication is handled by Supabase
4. API routes are protected with authentication middleware
5. Database connections use secure connections

## Performance Optimizations

1. Database indexes are created for frequently queried fields
2. Static assets are served through Vercel's CDN
3. Database queries are optimized with proper indexing
4. Client-side caching is implemented where appropriate

## Monitoring and Analytics

1. Monitor your application through the Vercel dashboard
2. Track database performance through Supabase logs
3. Set up error monitoring for production issues
4. Regular backup of your Supabase database