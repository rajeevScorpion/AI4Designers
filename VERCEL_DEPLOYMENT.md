# Vercel Deployment Guide

## Overview
This project has been converted to use Vercel Serverless Functions for the API, allowing you to deploy both frontend and backend to Vercel.

## Setup Instructions

### 1. Push Your Changes to GitHub
```bash
git add .
git commit -m "Convert to Vercel serverless functions"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Through Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 3. Environment Variables
Add these environment variables in Vercel dashboard:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `DATABASE_URL` - Your PostgreSQL connection string
- `NODE_ENV` - Set to `production`

**Optional:**
- `SESSION_SECRET` - Generate a random string for sessions

### 4. Database Setup
Ensure your Supabase database is properly set up with all tables. Run migrations if needed:
```bash
npm run db:push
```

## Project Structure
```
├── api/                 # Vercel serverless functions
│   ├── auth/           # Authentication endpoints
│   ├── badges/         # Badge management
│   ├── certificates/   # Certificate endpoints
│   ├── progress/       # Course progress tracking
│   ├── profile/        # User profile management
│   └── quiz/           # Quiz submissions
├── client/             # React frontend
├── shared/             # Shared utilities and types
└── dist/               # Build output (frontend only)
```

## API Endpoints

All endpoints are available at `/api/*`:

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/user` - Get current user
- `PUT /api/auth/user` - Update user profile
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/callback` - OAuth callback
- `GET /api/logout` - User logout

### Course Progress
- `GET /api/progress` - Get all user progress
- `GET /api/progress/[dayId]` - Get progress for specific day
- `POST /api/progress` - Update progress
- `POST /api/progress/[dayId]/complete` - Mark day as complete

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Badges
- `GET /api/badges` - Get user badges
- `POST /api/badges` - Create badge

### Certificates
- `GET /api/certificates` - Get user certificates
- `POST /api/certificates` - Create certificate

### Quizzes
- `POST /api/quiz/[quizId]/submit` - Submit quiz score

## Notes

- No need for Railway anymore - everything runs on Vercel
- The frontend and backend are deployed together
- API routes are automatically converted to serverless functions
- CORS is handled automatically by Vercel
- The app uses Supabase for authentication and database