import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SectionContent } from "@/components/section-content"
import { ActivitySection } from "@/components/activity-section"
import { QuizSection } from "@/components/quiz-section"
import { ChevronLeft, ChevronRight, CheckCircle, BookOpen } from "lucide-react"
import type { CourseSection } from "@shared/schema"
import { useCourse } from "@/contexts/CourseContext"

interface SlideViewerProps {
  sections: CourseSection[]
  dayTitle: string
  dayId: number
  onSectionComplete?: (sectionId: string) => void
  onQuizComplete?: (quizId: string, score: number) => void
  onQuizRetake?: (quizId: string) => void
  completedSections?: string[]
  quizScores?: Record<string, number>
}

export function SlideViewer({
  sections,
  dayTitle,
  dayId,
  onSectionComplete,
  onQuizComplete,
  onQuizRetake,
  completedSections: propCompletedSections,
  quizScores: propQuizScores
}: SlideViewerProps) {
  const { updateCurrentSlide, updateSectionCompletion, updateQuizScore, getDayProgress, isLoading } = useCourse()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Load saved slide position on mount
  useEffect(() => {
    if (!isLoading) {
      const dayProgress = getDayProgress(dayId)
      if (dayProgress && dayProgress.currentSlide !== undefined) {
        setCurrentSlide(Math.min(dayProgress.currentSlide, sections.length - 1))
      }
    }
  }, [dayId, sections.length, getDayProgress, isLoading])

  // Save slide position when it changes
  useEffect(() => {
    if (!isLoading && sections.length > 0) {
      updateCurrentSlide(dayId, currentSlide)
    }
  }, [currentSlide, dayId, sections.length, updateCurrentSlide, isLoading])

  // Use context data if available, otherwise fall back to props
  const dayProgress = getDayProgress(dayId)
  const contextCompletedSections = dayProgress?.completedSections || []
  const contextQuizScores = dayProgress?.quizScores || {}

  const completedSections = propCompletedSections || contextCompletedSections
  const quizScores = propQuizScores || contextQuizScores

  const totalSlides = sections.length
  const progress = (currentSlide / Math.max(totalSlides - 1, 1)) * 100
  const completedSlides = sections.slice(0, currentSlide + 1).filter(section =>
    completedSections.includes(section.id)
  ).length

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const handleSectionComplete = (sectionId: string) => {
    updateSectionCompletion(dayId, sectionId, true)
    onSectionComplete?.(sectionId)
  }

  const handleQuizComplete = (quizId: string, score: number) => {
    updateQuizScore(dayId, quizId, score)
    onQuizComplete?.(quizId, score)
  }

  const canGoNext = currentSlide < totalSlides - 1
  const canGoPrevious = currentSlide > 0
  const currentSection = sections[currentSlide]
  const isCurrentSlideCompleted = completedSections.includes(currentSection?.id)

  if (totalSlides === 0) {
    return (
      <Card className="p-8 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Content Available</h3>
        <p className="text-muted-foreground">
          Course content for this day is being prepared.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Slide Navigation Header */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              Slide {currentSlide + 1} of {totalSlides}
            </Badge>
            <h2 className="font-semibold" data-testid={`text-slide-title-${currentSlide}`}>
              {currentSection?.title}
            </h2>
            {isCurrentSlideCompleted && (
              <CheckCircle className="w-5 h-5 text-chart-3" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progress:</span>
            <div className="w-24">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Current Slide Content */}
      <div className="min-h-[500px]">
        {currentSection?.type === 'content' && (
          <SectionContent
            section={currentSection}
            isCompleted={isCurrentSlideCompleted}
            isAccessible={true}
            onMarkComplete={handleSectionComplete}
          />
        )}

        {currentSection?.type === 'video' && (
          <SectionContent
            section={currentSection}
            isCompleted={isCurrentSlideCompleted}
            isAccessible={true}
            onMarkComplete={handleSectionComplete}
          />
        )}

        {currentSection?.type === 'activity' && currentSection.activity && (
          <ActivitySection
            activity={currentSection.activity}
            sectionId={currentSection.id}
            isCompleted={isCurrentSlideCompleted}
            isAccessible={true}
            onMarkComplete={handleSectionComplete}
          />
        )}

        {currentSection?.type === 'quiz' && currentSection.quiz && (
          <QuizSection
            quiz={currentSection.quiz}
            dayId={dayId}
            isCompleted={isCurrentSlideCompleted}
            isAccessible={true}
            score={quizScores[currentSection.quiz.id]}
            onQuizComplete={handleQuizComplete}
            onQuizRetake={onQuizRetake || (() => {})}
          />
        )}
      </div>

      {/* Slide Navigation Footer */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button 
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            data-testid="button-slide-previous"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              <span>{completedSlides} completed</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{totalSlides} total slides</span>
            </div>
          </div>

          <Button 
            onClick={handleNext}
            disabled={!canGoNext}
            data-testid="button-slide-next"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Slide Indicator Dots */}
      <div className="flex justify-center gap-2 pt-2">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'bg-primary w-6' 
                : completedSections.includes(section.id)
                ? 'bg-chart-3'
                : 'bg-muted'
            }`}
            data-testid={`button-slide-indicator-${index}`}
          />
        ))}
      </div>
    </div>
  )
}