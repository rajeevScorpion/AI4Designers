'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useCourse } from '@/contexts/CourseContext'
import { Header } from './header'
import { CourseSidebar } from './course-sidebar'
import { useQuery } from '@tanstack/react-query'
import { useSupabase } from './auth-provider'
import { useEffect } from 'react'

// Mock course data - this should come from an API or context
const mockCourseDays = [
  {
    id: 1,
    title: "Introduction to AI",
    sections: [
      { id: "intro", title: "What is AI?", type: "content", isCompleted: false },
      { id: "history", title: "History of AI", type: "content", isCompleted: false },
      { id: "types", title: "Types of AI", type: "content", isCompleted: false },
      { id: "activity1", title: "AI in Daily Life", type: "activity", isCompleted: false },
      { id: "quiz1", title: "Day 1 Quiz", type: "quiz", isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 2,
    title: "Machine Learning Basics",
    sections: [
      { id: "ml-intro", title: "What is Machine Learning?", type: "content", isCompleted: false },
      { id: "supervised", title: "Supervised Learning", type: "content", isCompleted: false },
      { id: "unsupervised", title: "Unsupervised Learning", type: "content", isCompleted: false },
      { id: "activity2", title: "ML Algorithm Identification", type: "activity", isCompleted: false },
      { id: "quiz2", title: "Day 2 Quiz", type: "quiz", isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 3,
    title: "Neural Networks & Deep Learning",
    sections: [
      { id: "nn-intro", title: "Introduction to Neural Networks", type: "content", isCompleted: false },
      { id: "dl-basics", title: "Deep Learning Fundamentals", type: "content", isCompleted: false },
      { id: "cnn", title: "Convolutional Neural Networks", type: "content", isCompleted: false },
      { id: "activity3", title: "Build a Simple NN", type: "activity", isCompleted: false },
      { id: "quiz3", title: "Day 3 Quiz", type: "quiz", isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 4,
    title: "AI in Design",
    sections: [
      { id: "ai-design", title: "AI Tools for Designers", type: "content", isCompleted: false },
      { id: "generative", title: "Generative AI", type: "content", isCompleted: false },
      { id: "ethics", title: "AI Ethics & Bias", type: "content", isCompleted: false },
      { id: "activity4", title: "AI Design Challenge", type: "activity", isCompleted: false },
      { id: "quiz4", title: "Day 4 Quiz", type: "quiz", isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  },
  {
    id: 5,
    title: "Future of AI & Capstone",
    sections: [
      { id: "future", title: "Future Trends in AI", type: "content", isCompleted: false },
      { id: "careers", title: "AI Careers in Design", type: "content", isCompleted: false },
      { id: "capstone", title: "Capstone Project", type: "activity", isCompleted: false },
      { id: "presentation", title: "Final Presentation", type: "activity", isCompleted: false },
      { id: "quiz5", title: "Day 5 Quiz", type: "quiz", isCompleted: false }
    ],
    isCompleted: false,
    progress: 0
  }
]

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const { currentDay, setCurrentDay } = useCourse()
  const { supabase } = useSupabase()

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      return data
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Update mock data with actual progress
  const courseDays = mockCourseDays.map(day => ({
    ...day,
    sections: day.sections.map(section => ({
      ...section,
      isCompleted: userProgress?.some(
        p => p.activity_id === section.id && p.completed
      ) || false
    })),
    progress: Math.round(
      (day.sections.filter(section =>
        userProgress?.some(p => p.activity_id === section.id && p.completed)
      ).length / day.sections.length) * 100
    )
  }))

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, just show header and content
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Header />
        <main>{children}</main>
      </div>
    )
  }

  // If authenticated, show header, sidebar and content
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <CourseSidebar
          days={courseDays}
          currentDay={currentDay || 1}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}