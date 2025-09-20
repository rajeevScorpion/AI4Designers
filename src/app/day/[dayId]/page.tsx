'use client'

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SectionContent } from "@/components/section-content"
import { ActivitySection } from "@/components/activity-section"
import { QuizSection } from "@/components/quiz-section"
import { TabbedVideoSection } from "@/components/tabbed-video-section"
import { DayStickyNav } from "@/components/day-sticky-nav"
import { ClickableProgress } from "@/components/ui/clickable-progress"
import { Header } from "@/components/header"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { useConfetti } from "@/hooks/use-confetti"
import { useRouter, useSearchParams } from "next/navigation"
import type { CourseDay } from "@shared/schema"
import { courseData } from "@shared/courseData"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoginModal } from "@/components/login-modal"
import { smoothScrollToTop } from "@/lib/smooth-scroll"

interface DayProps {
  params: {
    dayId: string
  }
}

export default function Day({ params }: DayProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dayId = parseInt(params.dayId)

  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [quizScores, setQuizScores] = useState<Record<string, number>>({})
  const [currentPage, setCurrentPage] = useState(0)
  const [completedDays, setCompletedDays] = useState<number[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { celebrateCompletion, smallCelebration } = useConfetti()

  // Handle anchor links
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const element = document.querySelector(hash)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    }
  }, [searchParams])

  // Show login modal when navigating to a new day (track last seen day)
  useEffect(() => {
    const lastSeenDay = sessionStorage.getItem('lastSeenDay')
    if (lastSeenDay !== dayId.toString()) {
      // Add a small delay to ensure the modal appears after page load
      const timer = setTimeout(() => {
        setShowLoginModal(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [dayId])

  // Helper functions for day data
  const getDayTitle = (dayId: number) => {
    const titles = [
      "Day 1: Introduction to AI",
      "Day 2: AI-Powered Design Tools",
      "Day 3: Prompt Engineering for Designers",
      "Day 4: AI Ethics and Responsible Design",
      "Day 5: Future of AI in Design"
    ]
    return titles[dayId - 1] || `Day ${dayId}`
  }

  const getDayDescription = (dayId: number) => {
    const descriptions = [
      "Understand the fundamentals of Artificial Intelligence and its impact on the design industry.",
      "Explore popular AI tools that are revolutionizing the design workflow.",
      "Learn how to communicate effectively with AI to get the best design outcomes.",
      "Understand the ethical implications of AI in design and how to use it responsibly.",
      "Look ahead at emerging trends and prepare for the future of AI-driven design."
    ]
    return descriptions[dayId - 1] || ""
  }

  const getDayTime = (dayId: number) => {
    const times = ["45-60 minutes", "60-75 minutes", "75-90 minutes", "60-75 minutes", "45-60 minutes"]
    return times[dayId - 1] || "60 minutes"
  }

  // Static demo data - no authentication
  const isLoading = false

  // Use real course data
  const dayData: CourseDay = {
    id: dayId,
    title: getDayTitle(dayId),
    description: getDayDescription(dayId),
    estimatedTime: getDayTime(dayId),
    sections: courseData[dayId] || []
  }

  // Pagination: Split sections into pages (1 section per page, max 5 pages)
  const sectionsPerPage = 1
  const totalPages = Math.min(dayData.sections.length, 5)
  const startIndex = currentPage * sectionsPerPage
  const endIndex = startIndex + sectionsPerPage
  const currentSections = dayData.sections.slice(startIndex, endIndex)

  // Check if all sections on current page are completed
  const currentPageSections = currentSections.map(section => section.id)
  const currentPageCompleted = currentPageSections.every(sectionId =>
    completedSections.includes(sectionId)
  )

  const handleSectionComplete = async (sectionId: string) => {
    // Authentication removed - static demo only
    try {
      const newCompletedSections = [...completedSections]
      if (!newCompletedSections.includes(sectionId)) {
        newCompletedSections.push(sectionId)

        // Trigger confetti animation
        smallCelebration()
      }

      // Update local state only - no backend persistence
      setCompletedSections(newCompletedSections)

      console.log('Section completion tracking disabled - authentication removed')
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleQuizComplete = async (quizId: string, score: number) => {
    // Authentication removed - static demo only
    try {
      const newQuizScores = { ...quizScores, [quizId]: score }
      setQuizScores(newQuizScores)

      // Trigger confetti for quiz completion
      smallCelebration()

      console.log('Quiz completion tracking disabled - authentication removed')
    } catch (error) {
      console.error('Error submitting quiz:', error)
    }
  }

  const handleQuizRetake = async (quizId: string) => {
    // Authentication removed - static demo only
    try {
      // Remove quiz score and mark as incomplete
      const newQuizScores = { ...quizScores }
      delete newQuizScores[quizId]

      setQuizScores(newQuizScores)

      // Remove from completed sections
      setCompletedSections(prev => prev.filter(id => id !== quizId))
      console.log('Quiz retake tracking disabled - authentication removed')
    } catch (error) {
      console.error('Error retaking quiz:', error)
    }
  }

  const handleNextDay = () => {
    const nextDay = dayId + 1
    if (nextDay <= 5) {
      router.push(`/day/${nextDay}`)
    }
  }

  const checkAllSectionsCompleted = () => {
    const requiredSections = dayData.sections.filter(section =>
      section.type === 'activity' || section.type === 'quiz'
    )
    return requiredSections.every(section =>
      completedSections.includes(section.id)
    )
  }

  const isFinalPage = currentPage === totalPages - 1
  const isFinalSection = isFinalPage && currentSections.length === 1
  const allSectionsCompleted = checkAllSectionsCompleted()

  const goToNextPage = () => {
    if (currentPage < totalPages - 1 && unlockedSections.includes(currentPage + 1)) {
      setCurrentPage(currentPage + 1)
      // Use custom smooth scroll with better easing
      setTimeout(() => {
        smoothScrollToTop({
          duration: 1200,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        })
      }, 50) // Small delay to ensure page content has updated
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 0 && unlockedSections.includes(currentPage - 1)) {
      setCurrentPage(currentPage - 1)
      // Use custom smooth scroll with better easing
      setTimeout(() => {
        smoothScrollToTop({
          duration: 1200,
          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
        })
      }, 50) // Small delay to ensure page content has updated
    }
  }

  // Calculate unlocked sections based on completion status
  const getUnlockedSections = () => {
    const unlocked: number[] = []

    // First section is always unlocked
    unlocked.push(0)

    // Unlock subsequent sections only if previous ones are completed
    for (let i = 1; i < dayData.sections.length; i++) {
      const previousSectionId = dayData.sections[i - 1].id
      if (completedSections.includes(previousSectionId)) {
        unlocked.push(i)
      } else {
        break // Stop at the first incomplete section
      }
    }

    return unlocked
  }

  const unlockedSections = getUnlockedSections()

  // Check if a specific section is accessible
  const isSectionAccessible = (sectionIndex: number) => {
    return unlockedSections.includes(sectionIndex)
  }

  const handleSectionClick = (sectionIndex: number) => {
    // Only allow navigation to unlocked sections
    if (unlockedSections.includes(sectionIndex)) {
      setCurrentPage(sectionIndex)
    }
  }

  const calculateProgress = () => {
    if (dayData.sections.length === 0) return 0
    return Math.round((completedSections.length / dayData.sections.length) * 100)
  }

  if (!dayData.sections.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <h1 className="text-2xl font-bold mb-4">Day Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The requested day could not be found.
          </p>
          <Button onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DayStickyNav
        dayId={dayId}
        title={dayData.title}
        estimatedTime={dayData.estimatedTime}
        sectionsCount={dayData.sections.length}
        completedSections={completedSections}
        progress={calculateProgress()}
        isAuthenticated={false}
      />

      <div className="container mx-auto px-4 py-8 pt-24 smooth-scroll-container">
        <div className="max-w-4xl mx-auto content-fade-in">
          {/* Auth Disabled Notice */}
          <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 mb-6">
            <AlertDescription>
              Authentication has been disabled. This is now a static UI demonstration. Progress tracking is disabled.
            </AlertDescription>
          </Alert>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
              <Badge variant="secondary">
                {dayData.estimatedTime}
              </Badge>
            </div>

            <h1 className="text-4xl font-bold mb-2">{dayData.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">
              {dayData.description}
            </p>

            <div className="mb-8 -mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {calculateProgress()}%
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <ClickableProgress
                    value={calculateProgress()}
                    sections={totalPages}
                    completedSections={completedSections}
                    currentPage={currentPage}
                    currentPageCompleted={currentPageCompleted}
                    onSectionClick={handleSectionClick}
                    unlockedSections={unlockedSections}
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {currentSections.map((section, index) => (
              <Card key={section.id} className="p-6 section-card-hover">
                {section.type === 'content' && (
                  <SectionContent
                    section={section}
                    onMarkComplete={() => handleSectionComplete(section.id)}
                    isCompleted={completedSections.includes(section.id)}
                    isAccessible={isSectionAccessible(currentPage)}
                  />
                )}

                {section.type === 'activity' && section.activity && (
                  <ActivitySection
                    activity={section.activity}
                    sectionId={section.id}
                    isCompleted={completedSections.includes(section.id)}
                    isAccessible={isSectionAccessible(currentPage)}
                    onMarkComplete={handleSectionComplete}
                  />
                )}

                {section.type === 'quiz' && section.quiz && (
                  <QuizSection
                    quiz={section.quiz}
                    isCompleted={completedSections.includes(section.id)}
                    isAccessible={isSectionAccessible(currentPage)}
                    score={quizScores[section.id]}
                    onQuizComplete={(quizId, score) => handleQuizComplete(quizId, score)}
                    onQuizRetake={handleQuizRetake}
                    isFinalSection={isFinalSection}
                    allSectionsCompleted={allSectionsCompleted}
                    onNextDay={handleNextDay}
                  />
                )}

                {section.type === 'video' && (
                  <TabbedVideoSection
                    videos={section.videos || (section.videoUrl ? [{ title: section.title || 'Video', videoUrl: section.videoUrl, description: section.videoDescription }] : [])}
                    sectionId={section.id}
                    isCompleted={completedSections.includes(section.id)}
                    isAccessible={isSectionAccessible(currentPage)}
                    onMarkComplete={handleSectionComplete}
                  />
                )}
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <Button
              variant="outline"
              onClick={goToPreviousPage}
              disabled={currentPage === 0 || !unlockedSections.includes(currentPage - 1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

  
            <div className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </div>

            <Button
              onClick={goToNextPage}
              disabled={currentPage === totalPages - 1 || !unlockedSections.includes(currentPage + 1)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false)
          sessionStorage.setItem('lastSeenDay', dayId.toString())
        }}
      />
    </div>
  )
}