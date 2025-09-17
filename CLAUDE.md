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
npm run db:push      # Push schema changes to database (uses Drizzle)
npx drizzle-kit generate # Generate migrations

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
- `shared/` - Database schema and course data
- `supabase/` - Database migrations

### Database & Backend
- **PostgreSQL** database (Supabase)
- **Drizzle ORM** for type-safe database operations
- **Next.js API routes** for server endpoints
- Authentication currently disabled (demo mode)

### Course Content System
The application serves a structured 5-day curriculum with:
- Interactive flip cards for content exploration
- Embedded YouTube videos
- Knowledge check quizzes
- Hands-on activities using external platforms
- Progress tracking (currently disabled)

## Important Technical Details

### Authentication Status
- The app runs in **demo mode** with authentication disabled
- All user progress features are non-functional
- To enable full functionality, implement authentication in `src/lib/auth.ts`

### Database Schema
Core tables in `shared/schema.ts`:
- `users` - User profiles
- `sessions` - Session management
- `userProgress` - Course completion tracking
- `userBadges` - Achievement system
- `userCertificates` - Completion certificates

### Styling System
- Custom color palette defined in `tailwind.config.ts`
- Component-specific CSS variables in component files
- Responsive design with mobile-first approach
- Dark mode support implemented

### API Routes
- All API routes in `src/app/api/`
- Currently returns mock data for demo mode
- Integration with Supabase configured but not active

## Development Notes

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - For session management
- Supabase credentials (configured for production)

### Building for Production
- Run `npm run build` to create optimized build
- Deploy to Vercel (configuration in `vercel.json`)
- Database migrations must be applied separately

### Code Patterns
- Use TypeScript paths: `@/components`, `@/lib`, etc.
- Follow existing component structure in `src/components/ui/`
- Server components preferred for static content
- Client components used for interactivity

### Current Limitations
- No E2E tests implemented (Playwright configured)
- Authentication system disabled
- User progress tracking non-functional
- Database schema defined but not fully utilized