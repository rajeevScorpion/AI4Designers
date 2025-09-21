'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Header } from './header'
import { CourseSidebar } from './course-sidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { SidebarInset, Sidebar } from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

// Mock course data - this should come from an API or context
const mockCourseDays = [
  {
    id: 1,
    title: "Introduction to AI",
    sections: [
      { id: "intro", title: "What is AI?", type: "content" as const, isCompleted: false },
      { id: "history", title: "History of AI", type: "content" as const, isCompleted: false },
      { id: "types", title: "Types of AI", type: "content" as const, isCompleted: false },
      { id: "activity1", title: "AI in Daily Life", type: "activity" as const, isCompleted: false },
      { id: "quiz1", title: "Day 1 Quiz", type: "quiz" as const, isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 2,
    title: "Machine Learning Basics",
    sections: [
      { id: "ml-intro", title: "What is Machine Learning?", type: "content" as const, isCompleted: false },
      { id: "supervised", title: "Supervised Learning", type: "content" as const, isCompleted: false },
      { id: "unsupervised", title: "Unsupervised Learning", type: "content" as const, isCompleted: false },
      { id: "activity2", title: "ML Algorithm Identification", type: "activity" as const, isCompleted: false },
      { id: "quiz2", title: "Day 2 Quiz", type: "quiz" as const, isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 3,
    title: "Neural Networks & Deep Learning",
    sections: [
      { id: "nn-intro", title: "Introduction to Neural Networks", type: "content" as const, isCompleted: false },
      { id: "dl-basics", title: "Deep Learning Fundamentals", type: "content" as const, isCompleted: false },
      { id: "cnn", title: "Convolutional Neural Networks", type: "content" as const, isCompleted: false },
      { id: "activity3", title: "Build a Simple NN", type: "activity" as const, isCompleted: false },
      { id: "quiz3", title: "Day 3 Quiz", type: "quiz" as const, isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 4,
    title: "AI in Design",
    sections: [
      { id: "ai-design", title: "AI Tools for Designers", type: "content" as const, isCompleted: false },
      { id: "generative", title: "Generative AI", type: "content" as const, isCompleted: false },
      { id: "ethics", title: "AI Ethics & Bias", type: "content" as const, isCompleted: false },
      { id: "activity4", title: "AI Design Challenge", type: "activity" as const, isCompleted: false },
      { id: "quiz4", title: "Day 4 Quiz", type: "quiz" as const, isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 5,
    title: "Future of AI & Capstone",
    sections: [
      { id: "future", title: "Future Trends in AI", type: "content" as const, isCompleted: false },
      { id: "careers", title: "AI Careers in Design", type: "content" as const, isCompleted: false },
      { id: "capstone", title: "Capstone Project", type: "activity" as const, isCompleted: false },
      { id: "presentation", title: "Final Presentation", type: "activity" as const, isCompleted: false },
      { id: "quiz5", title: "Day 5 Quiz", type: "quiz" as const, isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  }
]

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  // Use mock data without authentication
  const courseDays = mockCourseDays
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar()

  // Check if we're on an auth page to avoid showing sidebar
  const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup')

  // Only show sidebar for authenticated users on non-auth pages
  const showSidebar = user && !isAuthPage

  // Layout for all pages
  return (
    <>
      {/* Desktop Sidebar - only for authenticated users */}
      {showSidebar && (
        <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
          <CourseSidebar
            days={courseDays}
            currentDay={1}
          />
        </Sidebar>
      )}

      {/* Main content area with SidebarInset for proper centering */}
      <SidebarInset className="flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-6 py-8 w-full">
          {children}
        </main>
      </SidebarInset>
    </>
  )
}