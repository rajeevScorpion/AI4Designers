'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock, ArrowRight, BookOpen, Users, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { CoursePreviewModal } from "@/components/course-preview-modal"
import { useAuth } from "@/contexts/AuthContext"
import { createClient } from "@/lib/supabase/client"

interface Day {
  id: number
  title: string
  description: string
  estimatedTime: string
  isCompleted: boolean
  isActive: boolean
  progress: number
}

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const [userProgress, setUserProgress] = useState<any>(null)
  const [progressLoading, setProgressLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchUserProgress()
    }
  }, [user])

  const fetchUserProgress = async () => {
    if (!user) return

    setProgressLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token

      const response = await fetch('/api/progress', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUserProgress(data)
      }
    } catch (error) {
      console.error('Failed to fetch user progress:', error)
    } finally {
      setProgressLoading(false)
    }
  }

  const completedDays = userProgress?.overallProgress?.totalDaysCompleted || 0
  const overallProgress = userProgress ? Math.round((completedDays / 5) * 100) : 0

  const days: Day[] = [
    {
      id: 1,
      title: "Introduction to AI & Design",
      description: "Explore the fundamentals of AI and how it's transforming the design industry. Learn key concepts and terminology.",
      estimatedTime: "30 min",
      isCompleted: userProgress?.days?.['1']?.completionPercentage === 100,
      isActive: userProgress?.currentDay === 1,
      progress: userProgress?.days?.['1']?.completionPercentage || 0
    },
    {
      id: 2,
      title: "Understanding AI Tools for Designers",
      description: "Discover popular AI tools and platforms used by designers today. Get hands-on experience with leading platforms.",
      estimatedTime: "45 min",
      isCompleted: userProgress?.days?.['2']?.completionPercentage === 100,
      isActive: userProgress?.currentDay === 2,
      progress: userProgress?.days?.['2']?.completionPercentage || 0
    },
    {
      id: 3,
      title: "Generative AI for Visual Design",
      description: "Learn how to use AI for creating images, graphics, and visual content. Master prompt engineering techniques.",
      estimatedTime: "60 min",
      isCompleted: userProgress?.days?.['3']?.completionPercentage === 100,
      isActive: userProgress?.currentDay === 3,
      progress: userProgress?.days?.['3']?.completionPercentage || 0
    },
    {
      id: 4,
      title: "AI-Powered Design Workflows",
      description: "Integrate AI into your design process for enhanced productivity. Build efficient AI-assisted workflows.",
      estimatedTime: "50 min",
      isCompleted: userProgress?.days?.['4']?.completionPercentage === 100,
      isActive: userProgress?.currentDay === 4,
      progress: userProgress?.days?.['4']?.completionPercentage || 0
    },
    {
      id: 5,
      title: "Future of AI in Design",
      description: "Explore emerging trends and prepare for the future of AI-assisted design. Ethics and best practices.",
      estimatedTime: "40 min",
      isCompleted: userProgress?.days?.['5']?.completionPercentage === 100,
      isActive: userProgress?.currentDay === 5,
      progress: userProgress?.days?.['5']?.completionPercentage || 0
    }
  ]

  // Day data for preview modal
  const dayPreviewData: Array<{
    id: number
    title: string
    description: string
    duration: string
    sections: Array<{
      type: 'intro' | 'content' | 'video' | 'activity' | 'quiz'
      title: string
      description: string
    }>
  }> = [
    {
      id: 1,
      title: "Introduction to AI & Design",
      description: "Explore the fundamentals of AI and how it's transforming the design industry. Learn key concepts and terminology.",
      duration: "30 min",
      sections: [
        {
          type: "intro",
          title: "Course Introduction",
          description: "Welcome to AI Fundamentals for Designers - overview of what you&apos;ll learn"
        },
        {
          type: "content",
          title: "What is AI?",
          description: "Understanding artificial intelligence, machine learning, and their relevance to design"
        },
        {
          type: "video",
          title: "AI in Design Industry",
          description: "Watch how AI is transforming creative workflows and design processes"
        },
        {
          type: "activity",
          title: "AI Tool Exploration",
          description: "Hands-on activity exploring basic AI tools and their capabilities"
        },
        {
          type: "quiz",
          title: "Knowledge Check",
          description: "Test your understanding of AI fundamentals covered in this day"
        }
      ]
    },
    {
      id: 2,
      title: "Understanding AI Tools for Designers",
      description: "Discover popular AI tools and platforms used by designers today. Get hands-on experience with leading platforms.",
      duration: "45 min",
      sections: [
        {
          type: "intro",
          title: "AI Tool Landscape",
          description: "Overview of AI tools available for designers and their use cases"
        },
        {
          type: "content",
          title: "Text-based AI Tools",
          description: "Exploring ChatGPT, Claude, and other language models for design workflows"
        },
        {
          type: "video",
          title: "AI Tool Demos",
          description: "Watch demonstrations of popular AI design tools in action"
        },
        {
          type: "activity",
          title: "Tool Comparison",
          description: "Compare and evaluate different AI tools for specific design tasks"
        },
        {
          type: "quiz",
          title: "Tool Selection Quiz",
          description: "Test your knowledge of selecting the right AI tools for design projects"
        }
      ]
    },
    {
      id: 3,
      title: "Generative AI for Visual Design",
      description: "Learn how to use AI for creating images, graphics, and visual content. Master prompt engineering techniques.",
      duration: "60 min",
      sections: [
        {
          type: "intro",
          title: "Generative AI Overview",
          description: "Introduction to generative AI and its applications in visual design"
        },
        {
          type: "content",
          title: "Prompt Engineering",
          description: "Learn techniques for writing effective prompts for image generation"
        },
        {
          type: "video",
          title: "Image Generation Workshop",
          description: "Step-by-step guide to creating AI-generated images and graphics"
        },
        {
          type: "activity",
          title: "Creative Project",
          description: "Create a series of AI-generated images for a design project"
        },
        {
          type: "quiz",
          title: "Generative AI Quiz",
          description: "Assess your understanding of generative AI concepts and techniques"
        }
      ]
    },
    {
      id: 4,
      title: "AI-Powered Design Workflows",
      description: "Integrate AI into your design process for enhanced productivity. Build efficient AI-assisted workflows.",
      duration: "50 min",
      sections: [
        {
          type: "intro",
          title: "Workflow Integration",
          description: "Understanding how to integrate AI into existing design workflows"
        },
        {
          type: "content",
          title: "AI in Design Process",
          description: "Mapping AI tools to different stages of the design process"
        },
        {
          type: "video",
          title: "Workflow Examples",
          description: "Real-world examples of AI-powered design workflows"
        },
        {
          type: "activity",
          title: "Workflow Design",
          description: "Design and document an AI-assisted workflow for a design project"
        },
        {
          type: "quiz",
          title: "Workflow Quiz",
          description: "Test your knowledge of AI integration in design workflows"
        }
      ]
    },
    {
      id: 5,
      title: "Future of AI in Design",
      description: "Explore emerging trends and prepare for the future of AI-assisted design. Ethics and best practices.",
      duration: "40 min",
      sections: [
        {
          type: "intro",
          title: "Future Trends",
          description: "Exploring emerging trends and technologies in AI and design"
        },
        {
          type: "content",
          title: "Ethics and Best Practices",
          description: "Understanding ethical considerations and best practices for AI in design"
        },
        {
          type: "video",
          title: "Industry Perspectives",
          description: "Insights from industry leaders on the future of AI in design"
        },
        {
          type: "activity",
          title: "Future Vision",
          description: "Create a vision board for how AI will shape your design career"
        },
        {
          type: "quiz",
          title: "Future of AI Quiz",
          description: "Final assessment covering ethics, trends, and future applications"
        }
      ]
    }
  ]

  const handleDaySelect = (dayId: number) => {
    if (loading) return

    if (user) {
      // If user is authenticated, redirect to course content
      router.push(`/day/${dayId}`)
    } else {
      // Show preview modal for non-authenticated users
      setSelectedDay(dayId)
      setPreviewModalOpen(true)
    }
  }

  const handleStartCourse = () => {
    if (loading) return

    if (user) {
      // If user is authenticated, redirect to first day
      router.push('/day/1')
    } else {
      // Show preview modal for non-authenticated users
      setSelectedDay(1)
      setPreviewModalOpen(true)
    }
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-background border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <Badge variant="outline" className="px-3 py-1">
                5-Day Crash Course
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl" data-testid="text-hero-title">
                AI Fundamentals for Designers
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Master the essentials of AI and generative technology through hands-on learning designed specifically for first-year design students.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>4-6 hours total</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Interactive content</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Beginner friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Practical activities</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button
                size="lg"
                onClick={handleStartCourse}
                data-testid="button-start-course"
              >
                Start Learning
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {!user && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Sign in required to access the full course</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

  
      {/* Course Curriculum */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold">Course Curriculum</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A structured 5-day journey through AI fundamentals, practical tools, and real-world applications for designers.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {days.map((day) => (
              <Card
                key={day.id}
                className={`p-6 hover-elevate transition-all cursor-pointer ${
                  day.isActive ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleDaySelect(day.id)}
                data-testid={`card-day-${day.id}`}
              >
                <div className="flex flex-col gap-4">
                  {/* Day header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {day.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-chart-3" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <h3 className="font-semibold">Day {day.id}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {day.estimatedTime}
                        </div>
                      </div>
                    </div>
                    {day.isActive && (
                      <Badge variant="default" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>

                  {/* Day content */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm" data-testid={`text-day-${day.id}-title`}>
                      {day.title}
                    </h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {day.description}
                    </p>
                  </div>

                  {/* Progress and action */}
                  <div className="space-y-3">
                    {day.progress > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span>{Math.round(day.progress)}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1">
                          <div
                            className="bg-primary rounded-full h-1 transition-all"
                            style={{ width: `${day.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      variant={day.isActive ? "default" : "outline"}
                      size="sm"
                      className="w-full"
                      data-testid={`button-start-day-${day.id}`}
                    >
                      {day.isCompleted ? 'Review' : day.isActive ? 'Continue' : 'Start Day'}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* What You'll Learn */}
      <div className="bg-muted/30 border-t">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold">What You'll Learn</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Build practical AI skills that you can immediately apply to your design projects.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "AI Fundamentals",
                  description: "Understand core AI concepts, machine learning, and how AI tools work behind the scenes."
                },
                {
                  title: "Popular AI Platforms",
                  description: "Get hands-on with ChatGPT, Midjourney, Figma AI, and other essential design tools."
                },
                {
                  title: "Generative Design",
                  description: "Master AI-powered image generation, prompt engineering, and creative content creation."
                },
                {
                  title: "Design Workflows",
                  description: "Learn to integrate AI seamlessly into your existing design process and workflows."
                },
                {
                  title: "Industry Applications",
                  description: "Explore real-world use cases and see how professionals use AI in their design work."
                },
                {
                  title: "Future Trends",
                  description: "Stay ahead with insights into emerging AI technologies and their impact on design."
                }
              ].map((item, index) => (
                <Card key={index} className="p-6 text-center">
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Preview Modal */}
      {selectedDay && (
        <CoursePreviewModal
          open={previewModalOpen}
          onOpenChange={setPreviewModalOpen}
          dayData={dayPreviewData.find(day => day.id === selectedDay)!}
        />
      )}
    </div>
  )
}