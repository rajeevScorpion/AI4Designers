# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Fundamentals for Designers course application - a 5-day crash course platform specifically designed for first-year design students. The application combines educational content delivery with interactive activities, quizzes, and hands-on AI platform experiences.

## Development Commands

### Core Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

### Testing and Quality
- No explicit test commands found in package.json
- Use `npm run check` for TypeScript validation

## Architecture

### Full-Stack Structure
- **Backend**: Express.js server with WebSocket support
- **Frontend**: React 18 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build Tool**: Vite for both client and server bundling
- **Authentication**: Passport.js with session-based auth

### Key Directories
- `client/` - React frontend application
- `server/` - Express.js backend server
- `shared/` - Shared utilities and database schema
- `attached_assets/` - Course media and resources

### Frontend Architecture
- **Routing**: Wouter for client-side routing
- **State Management**: React Query for server state, React hooks for local state
- **UI Framework**: Radix UI components with Tailwind CSS
- **Styling**: Tailwind CSS with custom design system
- **Theme**: Dark/light mode support with next-themes

### Backend Architecture
- **API Structure**: RESTful API with Express routes
- **Database**: Drizzle ORM with PostgreSQL
- **Authentication**: Session-based with Passport.js
- **Real-time**: WebSocket support for live features

## Database Schema

The application uses Drizzle ORM with a PostgreSQL database. Key schema includes:
- User management and authentication
- Course progress tracking
- Activity completion states
- Quiz and assessment data

## Design System

### Color Palette
- **Primary**: Blue (trust and learning)
- **Secondary**: Purple (creativity/AI theme)
- **Success**: Green (completed states)
- **Dark mode support** with adjusted contrast ratios

### Typography
- **Primary**: Inter font family
- **Headers**: 600-700 weight
- **Body**: 400-500 weight
- **Code**: Monospace fallback for platform names

### Component Library
Built with Radix UI components and customized with Tailwind CSS:
- Navigation components with progress indicators
- Content cards with consistent styling
- Interactive elements with hover/active states
- Media integration for video and platform content

## Key Features

### Course Structure
- 5-day progressive learning curriculum
- Day-based navigation with completion tracking
- Interactive activities and quizzes
- Video content integration with tabbed display
- Progress tracking and validation

### User Experience
- Authentication-aware UI (simplified for non-authenticated users)
- Responsive design for various screen sizes
- Accessibility-focused with proper ARIA labels
- Loading states and error handling

## Development Notes

### Code Style
- TypeScript throughout with strict type checking
- Functional React components with hooks
- Consistent naming conventions (camelCase for files/functions)
- Proper error handling and user feedback

### Database Migrations
- Use `npm run db:push` to apply schema changes
- Drizzle ORM handles schema synchronization
- No separate migration files required

### Build Process
- Vite handles both client and server bundling
- ESBuild for server-side code optimization
- Hot reload in development mode
- Production builds include proper asset optimization

## Environment Configuration

The application expects:
- Database connection string
- Session secret for authentication
- Port configuration (defaults to 5000)
- Development/production environment settings