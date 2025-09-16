'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock, ArrowRight, BookOpen, Users, Award } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/auth-provider"
import { useQuery } from '@tanstack/react-query'

interface Day {
  id: number
  title: string
  description: string
  estimatedTime: string
  isCompleted: boolean
  isActive: boolean
  progress: number
}

async function fetchUserProgress(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export default function Home() {
  const router = useRouter()
  const { supabase } = useSupabase()
  const [userId, setUserId] = useState<string | null>(null)

  // Get user ID from Supabase auth
  supabase.auth.getUser().then(({ data: { user } }) => {
    setUserId(user?.id || null)
  })

  // Fetch user progress if authenticated
  const { data: progressData } = useQuery({
    queryKey: ['user-progress-home', userId],
    queryFn: () => userId ? fetchUserProgress(supabase, userId) : null,
    enabled: !!userId
  })

  // Calculate progress
  const completedDays = progressData?.filter((p: any) => {
    const completedSections = p.completed_sections || []
    return completedSections.length > 0
  }).length || 0

  const overallProgress = completedDays > 0 ? (completedDays / 5) * 100 : 0

  const days: Day[] = [
    {
      id: 1,
      title: "Introduction to AI & Design",
      description: "Explore the fundamentals of AI and how it's transforming the design industry. Learn key concepts and terminology.",
      estimatedTime: "30 min",
      isCompleted: completedDays >= 1,
      isActive: completedDays === 0,
      progress: completedDays >= 1 ? 100 : 0
    },
    {
      id: 2,
      title: "Understanding AI Tools for Designers",
      description: "Discover popular AI tools and platforms used by designers today. Get hands-on experience with leading platforms.",
      estimatedTime: "45 min",
      isCompleted: completedDays >= 2,
      isActive: completedDays === 1,
      progress: completedDays >= 2 ? 100 : (completedDays === 1 ? 50 : 0)
    },
    {
      id: 3,
      title: "Generative AI for Visual Design",
      description: "Learn how to use AI for creating images, graphics, and visual content. Master prompt engineering techniques.",
      estimatedTime: "60 min",
      isCompleted: completedDays >= 3,
      isActive: completedDays === 2,
      progress: completedDays >= 3 ? 100 : (completedDays === 2 ? 33 : 0)
    },
    {
      id: 4,
      title: "AI-Powered Design Workflows",
      description: "Integrate AI into your design process for enhanced productivity. Build efficient AI-assisted workflows.",
      estimatedTime: "50 min",
      isCompleted: completedDays >= 4,
      isActive: completedDays === 3,
      progress: completedDays >= 4 ? 100 : (completedDays === 3 ? 25 : 0)
    },
    {
      id: 5,
      title: "Future of AI in Design",
      description: "Explore emerging trends and prepare for the future of AI-assisted design. Ethics and best practices.",
      estimatedTime: "40 min",
      isCompleted: completedDays >= 5,
      isActive: completedDays === 4,
      progress: completedDays >= 5 ? 100 : (completedDays === 4 ? 20 : 0)
    }
  ]

  const handleDaySelect = (dayId: number) => {
    router.push(`/day/${dayId}`)
  }

  const handleStartCourse = () => {
    router.push('/day/1')
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>No signup required • Track progress with IP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress Overview */}
      {overallProgress > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Your Progress</h2>
                <p className="text-muted-foreground">
                  {completedDays} of 5 days completed
                </p>
              </div>
              <Badge variant="outline" className="self-start">
                {Math.round(overallProgress)}% Complete
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </Card>
        </div>
      )}

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
    </div>
  )
}