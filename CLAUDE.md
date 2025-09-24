# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI4Designers is a Next.js-based educational platform offering a 5-day crash course on AI fundamentals for first-year design students. The application features interactive learning content, progress tracking, and hands-on activities.

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000
npm run build        # Production build
npm run start        # Production server
npm run lint         # Run ESLint

# Database
# Schema changes are managed through Supabase dashboard

# Testing
npx playwright test # Run E2E tests (no tests currently implemented)
```

## Architecture Overview

### Frontend Structure
- **Next.js 14** with App Router (`src/app/`)
- **TypeScript** throughout with strict configuration
- **Tailwind CSS** with custom design system (see `tailwind.config.ts`)
- **shadcn/ui** components for consistent UI
- **Radix UI** as the base component library

### Key Directories
- `src/app/` - App Router pages and API routes
- `src/components/` - Reusable React components
- `src/contexts/` - React contexts for state management
- `src/lib/` - Utility functions and helpers
- `src/shared/` - Shared types and data definitions
- `shared/` - Course data only

### Database & Backend
- **PostgreSQL** database (Supabase)
- **Supabase client** for database operations
- **Next.js API routes** for server endpoints
- Google OAuth authentication enabled

### Course Content System
The application serves a structured 5-day curriculum with:
- Interactive flip cards for content exploration
- Embedded YouTube videos
- Knowledge check quizzes
- Hands-on activities using external platforms
- Progress tracking (fully functional)

## Important Technical Details

### Authentication Status
- The app runs in **production mode** with authentication enabled
- All user progress features are fully functional
- Google OAuth authentication implemented and working

### Database Schema
Core tables (managed via Supabase dashboard):
- `users` - User profiles
- `sessions` - Session management
- `user_progress` - Course completion tracking
- `user_badges` - Achievement system
- `user_certificates` - Completion certificates

### Styling System
- Custom color palette defined in `tailwind.config.ts`
- Component-specific CSS variables in component files
- Responsive design with mobile-first approach
- Dark mode support implemented

### API Routes
- All API routes in `src/app/api/`
- Uses Supabase client for all database operations
- All endpoints require proper authentication

## Development Notes

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server only)

### Building for Production
- Run `npm run build` to create optimized build
- Deploy to Vercel (configuration in `vercel.json`)
- Schema changes must be applied via Supabase dashboard

### Code Patterns
- Use TypeScript paths: `@/components`, `@/lib`, etc.
- Follow existing component structure in `src/components/ui/`
- Server components preferred for static content
- Client components used for interactivity

### Current Limitations
- No E2E tests implemented (Playwright configured)