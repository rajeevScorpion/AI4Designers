# Next.js Migration Plan

## Current Architecture
- **Frontend**: React + Vite
- **Backend**: Express.js serverless functions in `/api` directory
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase

## Migration Goals
1. Convert to Next.js App Router for better Vercel integration
2. Move API routes to Next.js route handlers
3. Maintain existing functionality
4. Improve performance with Next.js optimizations

## Migration Steps

### Phase 1: Setup Next.js Structure
1. Initialize Next.js project
2. Install required dependencies
3. Create App Router structure
4. Move client components to Next.js format

### Phase 2: Convert API Routes
1. Convert `/api/*` to Next.js route handlers
2. Update database connection for serverless
3. Implement proper caching strategies

### Phase 3: Migrate Pages
1. Convert each page to Next.js format
2. Implement dynamic routing for course days
3. Add ISR for static content optimization

### Phase 4: Authentication Integration
1. Integrate Supabase with Next.js
2. Implement middleware for protected routes
3. Handle session management

### Phase 5: Testing & Deployment
1. Test all functionality
2. Optimize for Vercel deployment
3. Set up environment variables

## Benefits
- Unified framework for frontend and backend
- Better Vercel integration and performance
- Built-in optimizations (ISR, static generation)
- Simplified deployment process

## Implementation Log

### Day 1: 2025-09-16
- ✅ Initialized Next.js project structure
- ✅ Updated package.json with Next.js dependencies
- ✅ Created basic App Router structure
- ✅ Configured Tailwind CSS for Next.js
- ✅ Set up TypeScript paths and configuration
- ✅ Created providers component (React Query, Next Themes)
- ✅ Verified development server runs on http://localhost:3000

### Day 2: [Pending]
- Convert API routes from Express to Next.js route handlers
- Migrate client components to Next.js format
- Implement dynamic routing for course days (/day/1, /day/2, etc.)

### Day 3: [Pending]
- Integrate Supabase authentication with Next.js
- Set up middleware for protected routes
- Test authentication flow

### Day 4: [Pending]
- Migrate all pages and components
- Ensure all functionality works in Next.js
- Optimize for Vercel deployment

### Day 5: [Pending]
- Final testing and deployment
- Monitor performance and fix any issues