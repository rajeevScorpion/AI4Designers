# AI Fundamentals Course for Design Students

## Overview

This is a 5-day AI fundamentals crash course specifically designed for first-year design students. The application provides an interactive learning platform with educational content, hands-on activities, quizzes, and progress tracking. Students learn about artificial intelligence concepts, explore AI tools for designers, practice with generative AI, understand AI-powered workflows, and explore the future of AI in design.

The platform features a structured day-by-day curriculum with multimedia content delivery, interactive components, and comprehensive progress tracking to ensure effective learning outcomes.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state and React hooks for local state
- **Theme System**: Light/dark mode support with CSS variables and theme provider

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit OpenID Connect (OIDC) integration with Passport.js
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API with structured error handling and middleware

### Data Storage Solutions
- **Primary Database**: PostgreSQL for user data, progress tracking, and course content
- **Schema Design**: Separate tables for users, progress tracking, badges, certificates, and sessions
- **ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Migrations**: Drizzle-kit for database schema management

### Course Content Management
- **Structure**: Day-based curriculum with sections, activities, quizzes, and videos
- **Content Types**: Support for HTML content, interactive activities, multi-choice quizzes, and video embeds
- **Progress Tracking**: Section completion, quiz scores, and overall progress calculation
- **Gamification**: Badge system and completion certificates

### Component Architecture
- **Design System**: shadcn/ui components with custom styling and theming
- **Course Navigation**: Sidebar-based navigation with progress indicators
- **Content Delivery**: Slide-based viewer with navigation controls
- **Interactive Elements**: Quiz components, activity sections, and progress tracking

## External Dependencies

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL database provider
- **WebSocket Support**: For real-time database connections

### Authentication Services
- **Replit OIDC**: OpenID Connect authentication provider
- **Session Storage**: connect-pg-simple for PostgreSQL session storage

### UI and Styling
- **Radix UI**: Comprehensive accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Google Fonts**: Inter font family via CDN
- **Lucide Icons**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool with React plugin and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment integration with cartographer and error overlay

### State Management and Data Fetching
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form validation and management
- **Zod**: Runtime type validation and schema definition