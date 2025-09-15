# Design Guidelines: AI Fundamentals Course for Design Students

## Design Approach
**Selected Approach:** Hybrid - Drawing inspiration from modern educational platforms like Linear Academy and Notion's clean documentation style, combined with Material Design principles for accessibility and information density.

**Key Design Principles:**
- Educational clarity with visual hierarchy
- Progress-driven interface design
- Minimal cognitive load for learning focus
- Design-student friendly aesthetics

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: 240 100% 60% (vibrant blue for trust and learning)
- Secondary: 280 60% 65% (purple for creativity/AI theme)
- Success: 142 76% 36% (green for completed states)
- Background: 0 0% 98% (near-white for readability)
- Card backgrounds: 0 0% 100% (pure white)

**Dark Mode:**
- Primary: 240 100% 70% (lighter blue for contrast)
- Secondary: 280 60% 75% (lighter purple)
- Success: 142 60% 50% (adjusted green)
- Background: 240 10% 4% (deep dark blue-gray)
- Card backgrounds: 240 6% 10% (elevated dark surfaces)

### B. Typography
**Font Stack:** Inter via Google Fonts CDN
- Headers: 600-700 weight, sizes from text-lg to text-4xl
- Body: 400-500 weight, text-sm to text-base
- Code/Platform names: 500 weight, monospace fallback

### C. Layout System
**Spacing Primitives:** Tailwind units of 1, 2, 4, 6, 8, 12, 16
- Consistent padding: p-6 for cards, p-4 for smaller components
- Margins: mb-8 for section spacing, mb-4 for element spacing
- Grid gaps: gap-6 for main layouts, gap-4 for dense content

### D. Component Library

**Navigation:**
- Sticky top navigation with course progress indicator
- Day-based sidebar navigation with completion checkmarks
- Breadcrumb navigation within daily content

**Content Cards:**
- Rounded corners (rounded-lg)
- Subtle shadows for elevation
- Clear section dividers for activities, quizzes, videos

**Interactive Elements:**
- Primary buttons for main actions (Start Day, Submit Quiz)
- Secondary buttons for supplementary actions
- Progress bars with animated fill states
- Quiz components with immediate feedback styling

**Media Integration:**
- Embedded video containers with 16:9 aspect ratio
- Platform preview cards with logos and descriptions
- Activity instruction cards with clear CTAs

### E. Layout Structure

**Course Dashboard:**
- Hero section with course overview and overall progress
- 5-day grid layout with completion indicators
- Quick access to resources and popular AI tools

**Daily Learning Pages:**
- Fixed sidebar with day navigation
- Main content area with scrollable sections
- Floating progress indicator
- Activity zones with platform integration links

**No Hero Image:** Focus on content clarity rather than large imagery. Use subtle geometric patterns or gradients as background treatments.

## Visual Treatments

**Gradients:** Subtle linear gradients from primary to secondary colors for header backgrounds and accent elements. Avoid overwhelming the educational content.

**Interactive States:**
- Hover: Subtle scale (scale-105) and shadow increases
- Active/Completed: Success color backgrounds with checkmark icons
- Progress: Animated progress bars with smooth transitions

**Content Hierarchy:**
- Large, bold headings for daily titles
- Clear section breaks with consistent spacing
- Highlighted key concepts with colored backgrounds
- Important links and platforms emphasized with accent styling

This design system prioritizes educational effectiveness while maintaining modern, engaging aesthetics appropriate for design students learning AI fundamentals.