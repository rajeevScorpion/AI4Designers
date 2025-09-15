import { useQuery } from "@tanstack/react-query"
import { useAuth } from "./useAuth"

export interface UserProgress {
  id: string;
  userId: string;
  dayId: number;
  completedSections: string[];
  completedSlides: string[];
  quizScores: Record<string, number>;
  currentSlide: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export function useCourseProgress() {
  const { isAuthenticated } = useAuth()

  const { data: allProgress = [], isLoading, error } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    enabled: isAuthenticated,
    retry: false,
  })

  // Transform progress data for sidebar
  const sidebarData = {
    days: [1, 2, 3, 4, 5].map(dayId => {
      const dayProgress = allProgress.find((p: any) => p.dayId === dayId)
      const completedSections = dayProgress?.completedSections || []
      const totalSections = getSectionCountForDay(dayId)
      
      // Filter out any invalid or duplicate section IDs
      const validSectionIds = getDaySections(dayId, []).map(s => s.id)
      const uniqueCompletedSections = Array.from(new Set(completedSections)).filter(sectionId => 
        validSectionIds.includes(sectionId)
      )
      
      // Calculate progress based on unique, valid sections only
      const validCompletedCount = uniqueCompletedSections.length
      const progress = totalSections > 0 ? (validCompletedCount / totalSections) * 100 : 0
      
      // Debug logging for progress issues
      if (completedSections.length !== uniqueCompletedSections.length) {
        console.warn(`Day ${dayId} has invalid or duplicate sections:`, {
          original: completedSections,
          filtered: uniqueCompletedSections,
          validSectionIds,
          progress: Math.round(progress)
        })
      }
      
      return {
        id: dayId,
        title: getDayTitle(dayId),
        sections: getDaySections(dayId, uniqueCompletedSections),
        isCompleted: dayProgress?.isCompleted || false,
        progress: Math.min(Math.round(progress), 100) // Cap at 100% as safety measure
      }
    }),
    currentDay: getCurrentDay(allProgress)
  }

  return {
    sidebarData,
    allProgress,
    isLoading,
    error
  }
}

function getDayTitle(dayId: number): string {
  const titles = {
    1: "Introduction to AI",
    2: "Types of AI & How They Work", 
    3: "AI Tools for Designers",
    4: "Ethical AI & Responsible Design",
    5: "The Future of AI in Design"
  }
  return titles[dayId as keyof typeof titles] || `Day ${dayId}`
}

function getSectionCountForDay(dayId: number): number {
  // Based on courseData structure - all days have 5 sections
  const sectionCounts = {
    1: 5, // intro, history, video, activity, quiz
    2: 5, // intro, generative, video, activity, quiz
    3: 5, // intro, workflows, video, activity, quiz
    4: 5, // intro, guidelines, video, activity, quiz
    5: 5  // intro, career, video, activity, final-quiz
  }
  return sectionCounts[dayId as keyof typeof sectionCounts] || 0
}

function getDaySections(dayId: number, completedSections: string[] = []) {
  // Simplified section structure for sidebar
  const sections = {
    1: [
      { id: "day1-intro", title: "What is AI?", type: "content" as const },
      { id: "day1-history", title: "Brief History", type: "content" as const },
      { id: "day1-video", title: "AI in Creative Industries", type: "video" as const },
      { id: "day1-activity", title: "Explore AI Tools", type: "activity" as const },
      { id: "day1-quiz", title: "Knowledge Check", type: "quiz" as const }
    ],
    2: [
      { id: "day2-intro", title: "Types of AI", type: "content" as const },
      { id: "day2-generative", title: "Generative AI Deep Dive", type: "content" as const },
      { id: "day2-video", title: "How Neural Networks Learn", type: "video" as const },
      { id: "day2-activity", title: "AI Image Generation", type: "activity" as const },
      { id: "day2-quiz", title: "Knowledge Check", type: "quiz" as const }
    ],
    3: [
      { id: "day3-intro", title: "AI Tools for Designers", type: "content" as const },
      { id: "day3-workflows", title: "AI-Enhanced Workflows", type: "content" as const },
      { id: "day3-video", title: "AI Tools in Action", type: "video" as const },
      { id: "day3-activity", title: "Build AI Workflow", type: "activity" as const },
      { id: "day3-quiz", title: "Knowledge Check", type: "quiz" as const }
    ],
    4: [
      { id: "day4-intro", title: "Ethical AI", type: "content" as const },
      { id: "day4-guidelines", title: "Responsible Guidelines", type: "content" as const },
      { id: "day4-video", title: "Ethics in AI Design", type: "video" as const },
      { id: "day4-activity", title: "Create Ethics Framework", type: "activity" as const },
      { id: "day4-quiz", title: "Knowledge Check", type: "quiz" as const }
    ],
    5: [
      { id: "day5-intro", title: "Future of AI in Design", type: "content" as const },
      { id: "day5-career", title: "Building AI-Enhanced Career", type: "content" as const },
      { id: "day5-video", title: "Future of Creative Work", type: "video" as const },
      { id: "day5-activity", title: "Design Learning Plan", type: "activity" as const },
      { id: "day5-final-quiz", title: "Final Assessment", type: "quiz" as const }
    ]
  }
  const baseSections = sections[dayId as keyof typeof sections] || []
  return baseSections.map(section => ({
    ...section,
    isCompleted: completedSections.includes(section.id)
  }))
}

function getCurrentDay(allProgress: any[]): number {
  // Find the first incomplete day, or default to day 1
  for (let dayId = 1; dayId <= 5; dayId++) {
    const dayProgress = allProgress.find(p => p.dayId === dayId)
    if (!dayProgress?.isCompleted) {
      return dayId
    }
  }
  return 5 // All complete, stay on last day
}