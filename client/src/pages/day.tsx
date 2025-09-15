import { useState, useEffect } from "react"
import { useRoute } from "wouter"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SectionContent } from "@/components/section-content"
import { ActivitySection } from "@/components/activity-section"
import { QuizSection } from "@/components/quiz-section"
import { ArrowLeft, ArrowRight, CheckCircle, LogIn } from "lucide-react"
import { useLocation } from "wouter"
import type { CourseDay, CourseSection } from "@shared/schema"
import { courseData } from "@shared/courseData"

interface DayProps {
  isAuthenticated?: boolean;
}

export default function Day({ isAuthenticated = false }: DayProps) {
  const [, params] = useRoute("/day/:dayId")
  const [, navigate] = useLocation()
  const dayId = parseInt(params?.dayId || "1")
  
  // todo: remove mock functionality - replace with real data from API
  const [completedSections, setCompletedSections] = useState<string[]>([])
  const [quizScores, setQuizScores] = useState<Record<string, number>>({})

  // Use real course data instead of mock data
  const dayData: CourseDay = {
    id: dayId,
    title: getDayTitle(dayId),
    description: getDayDescription(dayId),
    estimatedTime: getDayTime(dayId),
    sections: courseData[dayId] || []
  }

  const progress = (completedSections.length / dayData.sections.length) * 100

  const handleSectionComplete = (sectionId: string) => {
    console.log(`Section ${sectionId} completed`)
    setCompletedSections(prev => 
      prev.includes(sectionId) ? prev : [...prev, sectionId]
    )
  }

  const handleQuizComplete = (quizId: string, score: number) => {
    console.log(`Quiz ${quizId} completed with score: ${score}`)
    setQuizScores(prev => ({ ...prev, [quizId]: score }))
    handleSectionComplete(quizId)
  }

  const handlePreviousDay = () => {
    if (dayId > 1) {
      navigate(`/day/${dayId - 1}`)
    }
  }

  const handleNextDay = () => {
    if (dayId < 5) {
      navigate(`/day/${dayId + 1}`)
    } else {
      navigate('/')
    }
  }

  const canProceed = completedSections.length === dayData.sections.length

  return (
    <div className="min-h-screen bg-background">
      {/* Day Header */}
      <div className="border-b bg-card">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
              data-testid="button-back-home"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Course Home
            </Button>
            <Badge variant="outline">Day {dayId} of 5</Badge>
          </div>
          
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" data-testid={`text-day-${dayId}-title`}>
                {dayData.title}
              </h1>
              <p className="text-muted-foreground">{dayData.description}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>⏱️ {dayData.estimatedTime}</span>
                <span>📚 {dayData.sections.length} sections</span>
                <span>✅ {completedSections.length} completed</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Progress:</span>
                <div className="w-32">
                  <Progress value={progress} className="h-2" />
                </div>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Prompt for Unauthenticated Users */}
      {!isAuthenticated && (
        <div className="bg-primary/10 border-primary/20 border-b">
          <div className="max-w-4xl mx-auto p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <LogIn className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Sign in to save your progress</p>
                  <p className="text-xs text-muted-foreground">Your progress will be lost when you close this tab</p>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                size="sm"
                data-testid="button-sign-in-prompt"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Course Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-8">
          {dayData.sections.map((section: CourseSection, index: number) => {
            const isCompleted = completedSections.includes(section.id)
            
            return (
              <div key={section.id} className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {index + 1}
                  </Badge>
                  <h2 className="text-xl font-semibold">{section.title}</h2>
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-chart-3" />
                  )}
                </div>

                {/* Section Content */}
                {section.type === 'content' && (
                  <SectionContent
                    section={section}
                    isCompleted={isCompleted}
                    onMarkComplete={handleSectionComplete}
                  />
                )}

                {section.type === 'video' && (
                  <SectionContent
                    section={section}
                    isCompleted={isCompleted}
                    onMarkComplete={handleSectionComplete}
                  />
                )}

                {section.type === 'activity' && section.activity && (
                  <ActivitySection
                    activity={section.activity}
                    isCompleted={isCompleted}
                    onMarkComplete={handleSectionComplete}
                  />
                )}

                {section.type === 'quiz' && section.quiz && (
                  <QuizSection
                    quiz={section.quiz}
                    isCompleted={isCompleted}
                    score={quizScores[section.quiz.id]}
                    onQuizComplete={handleQuizComplete}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-8 mt-8 border-t">
          <Button 
            variant="outline"
            onClick={handlePreviousDay}
            disabled={dayId === 1}
            data-testid="button-previous-day"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous Day
          </Button>

          <div className="text-center space-y-2">
            {canProceed ? (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Day Complete!
              </Badge>
            ) : (
              <Badge variant="outline">
                {completedSections.length} of {dayData.sections.length} sections complete
              </Badge>
            )}
          </div>

          <Button 
            onClick={handleNextDay}
            disabled={!canProceed}
            data-testid="button-next-day"
          >
            {dayId === 5 ? 'Course Complete' : 'Next Day'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Helper functions to generate mock data based on day
function getDayTitle(dayId: number): string {
  const titles = [
    "Introduction to AI & Design",
    "Understanding AI Tools for Designers", 
    "Generative AI for Visual Design",
    "AI-Powered Design Workflows",
    "Future of AI in Design"
  ]
  return titles[dayId - 1] || "Unknown Day"
}

function getDayDescription(dayId: number): string {
  const descriptions = [
    "Explore the fundamentals of AI and how it's transforming the design industry.",
    "Discover popular AI tools and platforms used by designers today.",
    "Learn how to use AI for creating images, graphics, and visual content.",
    "Integrate AI into your design process for enhanced productivity.",
    "Explore emerging trends and prepare for the future of AI-assisted design."
  ]
  return descriptions[dayId - 1] || "Course content"
}

function getDayTime(dayId: number): string {
  const times = ["30 min", "45 min", "60 min", "50 min", "40 min"]
  return times[dayId - 1] || "30 min"
}

function getDaySections(dayId: number): CourseSection[] {
  // Mock sections based on day
  if (dayId === 1) {
    return [
      {
        id: "intro-content-1",
        type: "content",
        title: "What is Artificial Intelligence?",
        content: `
          <h3>Understanding AI Fundamentals</h3>
          <p>Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines capable of performing tasks that typically require human intelligence.</p>
          
          <h4>Key Concepts:</h4>
          <ul>
            <li><strong>Machine Learning:</strong> Algorithms that improve through experience without being explicitly programmed</li>
            <li><strong>Neural Networks:</strong> Computing systems inspired by biological neural networks</li>
            <li><strong>Deep Learning:</strong> Machine learning using multi-layered neural networks</li>
            <li><strong>Generative AI:</strong> AI systems that can create new content, images, text, or designs</li>
          </ul>
          
          <h4>AI in Creative Industries</h4>
          <p>For designers, AI opens up new possibilities for creativity, automation, and enhanced productivity. From generating initial concepts to refining final designs, AI tools are becoming essential in modern design workflows.</p>
        `
      },
      {
        id: "intro-video-1",
        type: "video",
        title: "AI Revolution in Design",
        videoUrl: "https://www.youtube.com/watch?v=example",
        description: "Watch how AI is transforming the creative industry and what it means for designers."
      },
      {
        id: "intro-quiz-1",
        type: "quiz",
        title: "AI Fundamentals Quiz",
        quiz: {
          id: "intro-quiz-1",
          questions: [
            {
              id: "q1",
              question: "What does AI stand for?",
              type: "multiple-choice",
              options: ["Artificial Intelligence", "Automated Information", "Advanced Integration", "Applied Innovation"],
              correctAnswer: 0,
              explanation: "AI stands for Artificial Intelligence, which refers to computer systems that can perform tasks typically requiring human intelligence."
            },
            {
              id: "q2",
              question: "Generative AI can create new content like images and text.",
              type: "true-false",
              options: ["True", "False"],
              correctAnswer: 0,
              explanation: "True. Generative AI specifically refers to AI systems that can create new content rather than just analyze existing data."
            }
          ]
        }
      }
    ]
  }

  // Default sections for other days
  return [
    {
      id: `day-${dayId}-content-1`,
      type: "content",
      title: "Course Content",
      content: `<p>This is the main content for Day ${dayId}. More detailed content would be added here.</p>`
    },
    {
      id: `day-${dayId}-activity-1`,
      type: "activity",
      title: "Hands-on Activity",
      activity: {
        id: `day-${dayId}-activity-1`,
        title: "Practice Activity",
        description: "Try out the concepts you've learned in this practical exercise.",
        platforms: [
          {
            name: "ChatGPT",
            url: "https://chat.openai.com",
            description: "AI assistant for creative tasks",
            isRecommended: true
          }
        ],
        instructions: [
          "Open the recommended platform",
          "Follow the guided exercise",
          "Experiment with different approaches"
        ]
      }
    }
  ]
}