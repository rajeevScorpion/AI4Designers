'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Header } from './header'
import { CourseSidebar } from './course-sidebar'
import { useSidebar } from '@/components/ui/sidebar'
import { SidebarInset, Sidebar } from '@/components/ui/sidebar'
import { useAuth } from '@/contexts/AuthContext'
import { useCourse } from '@/contexts/CourseContext'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

// Mock course data - this should come from an API or context
const mockCourseDays = [
  {
    id: 1,
    title: "Introduction to AI",
    sections: [
      { id: "day1-intro", title: "What is Artificial Intelligence?", type: "content" as const, isCompleted: false },
      { id: "day1-history", title: "A Brief History of AI", type: "content" as const, isCompleted: false },
      { id: "day1-video", title: "Essential AI Concepts Explained", type: "video" as const, isCompleted: false },
      { id: "day1-activity", title: "Explore AI Tools", type: "activity" as const, isCompleted: false },
      { id: "day1-quiz", title: "Day 1 Knowledge Check", type: "quiz" as const, isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 2,
    title: "Types of AI and How They Work",
    sections: [
      { id: "day2-intro", title: "Types of AI and How They Work", type: "content" as const, isCompleted: false },
      { id: "day2-generative", title: "Generative AI Deep Dive", type: "content" as const, isCompleted: false },
      { id: "day2-video", title: "Understanding Neural Networks & Machine Learning", type: "video" as const, isCompleted: false },
      { id: "day2-activity", title: "AI Image Generation Practice", type: "activity" as const, isCompleted: false },
      { id: "day2-quiz", title: "Day 2 Knowledge Check", type: "quiz" as const, isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 3,
    title: "AI Tools for Designers",
    sections: [
      { id: "day3-intro", title: "AI Tools for Designers", type: "content" as const, isCompleted: false },
      { id: "day3-workflows", title: "AI-Enhanced Design Workflows", type: "content" as const, isCompleted: false },
      { id: "day3-video", title: "AI Tools for Creative Design", type: "video" as const, isCompleted: false },
      { id: "day3-activity", title: "Build an AI-Enhanced Workflow", type: "activity" as const, isCompleted: false },
      { id: "day3-quiz", title: "Day 3 Knowledge Check", type: "quiz" as const, isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 4,
    title: "Ethical AI and Responsible Design",
    sections: [
      { id: "day4-intro", title: "Ethical AI and Responsible Design", type: "content" as const, isCompleted: false },
      { id: "day4-guidelines", title: "Responsible AI Guidelines for Designers", type: "content" as const, isCompleted: false },
      { id: "day4-video", title: "AI Ethics and Responsible Design", type: "video" as const, isCompleted: false },
      { id: "day4-activity", title: "Create Your AI Ethics Framework", type: "activity" as const, isCompleted: false },
      { id: "day4-quiz", title: "Day 4 Knowledge Check", type: "quiz" as const, isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 5,
    title: "The Future of AI in Design",
    sections: [
      { id: "day5-intro", title: "The Future of AI in Design", type: "content" as const, isCompleted: false },
      { id: "day5-career", title: "Building an AI-Enhanced Career", type: "content" as const, isCompleted: false },
      { id: "day5-video", title: "The Future of AI and Design", type: "video" as const, isCompleted: false },
      { id: "day5-activity", title: "Design Your AI Learning Plan", type: "activity" as const, isCompleted: false },
      { id: "day5-final-quiz", title: "Final Course Assessment", type: "quiz" as const, isCompleted: false }
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
  const { userProgress, getDayProgress, isLoading } = useCourse()
  const { open, setOpen, openMobile, setOpenMobile, isMobile } = useSidebar()
  const [courseDays, setCourseDays] = useState(mockCourseDays)

  // Update course days with progress data
  useEffect(() => {
    if (!isLoading && userProgress) {
      const updatedDays = mockCourseDays.map(day => {
        const dayProgress = getDayProgress(day.id)
        const completedSections = dayProgress?.completedSections || []

        const updatedSections = day.sections.map(section => ({
          ...section,
          isCompleted: completedSections.includes(section.id)
        }))

        // Calculate day progress based on completed sections
        const totalSections = day.sections.length
        const completedCount = completedSections.length
        const progressPercentage = totalSections > 0 ? Math.round((completedCount / totalSections) * 100) : 0
        const isDayCompleted = progressPercentage >= 80

        return {
          ...day,
          sections: updatedSections,
          isCompleted: isDayCompleted,
          progress: progressPercentage
        }
      })

      setCourseDays(updatedDays)
    }
  }, [userProgress, isLoading, getDayProgress])

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
            currentDay={userProgress?.currentDay || 1}
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