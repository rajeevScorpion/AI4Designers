import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DayNavigation } from "@/components/day-navigation"
import { CourseHeader } from "@/components/course-header"
import { ArrowRight, BookOpen, Users, Clock, Award } from "lucide-react"
import { useLocation } from "wouter"

export default function Home() {
  const [, navigate] = useLocation()
  
  // todo: remove mock functionality - replace with real data from API
  const [mockProgress] = useState({
    currentDay: 1,
    overallProgress: 0,
    completedDays: 0
  })

  const mockDays = [
    {
      id: 1,
      title: "Introduction to AI & Design",
      description: "Explore the fundamentals of AI and how it's transforming the design industry. Learn key concepts and terminology.",
      estimatedTime: "30 min",
      isCompleted: false,
      isActive: true,
      progress: 0
    },
    {
      id: 2,
      title: "Understanding AI Tools for Designers",
      description: "Discover popular AI tools and platforms used by designers today. Get hands-on experience with leading platforms.",
      estimatedTime: "45 min",
      isCompleted: false,
      isActive: false,
      progress: 0
    },
    {
      id: 3,
      title: "Generative AI for Visual Design",
      description: "Learn how to use AI for creating images, graphics, and visual content. Master prompt engineering techniques.",
      estimatedTime: "60 min",
      isCompleted: false,
      isActive: false,
      progress: 0
    },
    {
      id: 4,
      title: "AI-Powered Design Workflows",
      description: "Integrate AI into your design process for enhanced productivity. Build efficient AI-assisted workflows.",
      estimatedTime: "50 min",
      isCompleted: false,
      isActive: false,
      progress: 0
    },
    {
      id: 5,
      title: "Future of AI in Design",
      description: "Explore emerging trends and prepare for the future of AI-assisted design. Ethics and best practices.",
      estimatedTime: "40 min",
      isCompleted: false,
      isActive: false,
      progress: 0
    }
  ]

  const handleDaySelect = (dayId: number) => {
    console.log(`Navigating to day ${dayId}`)
    navigate(`/day/${dayId}`)
  }

  const handleStartCourse = () => {
    console.log('Starting course from day 1')
    navigate('/day/1')
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
      {mockProgress.overallProgress > 0 && (
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold">Your Progress</h2>
                <p className="text-muted-foreground">
                  {mockProgress.completedDays} of 5 days completed
                </p>
              </div>
              <Badge variant="outline" className="self-start">
                {Math.round(mockProgress.overallProgress)}% Complete
              </Badge>
            </div>
            <Progress value={mockProgress.overallProgress} className="h-2" />
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

          <DayNavigation days={mockDays} onDaySelect={handleDaySelect} />
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