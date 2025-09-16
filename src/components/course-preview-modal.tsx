'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Clock, Users, Award } from 'lucide-react'

interface CoursePreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dayData: {
    id: number
    title: string
    description: string
    duration: string
    sections: Array<{
      type: 'intro' | 'content' | 'video' | 'activity' | 'quiz'
      title: string
      description: string
    }>
  }
}

export function CoursePreviewModal({ open, onOpenChange, dayData }: CoursePreviewModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'sections'>('overview')

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'intro':
        return <BookOpen className="h-4 w-4" />
      case 'video':
        return <Clock className="h-4 w-4" />
      case 'activity':
        return <Users className="h-4 w-4" />
      case 'quiz':
        return <Award className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getSectionTypeLabel = (type: string) => {
    switch (type) {
      case 'intro':
        return 'Introduction'
      case 'content':
        return 'Content'
      case 'video':
        return 'Video'
      case 'activity':
        return 'Activity'
      case 'quiz':
        return 'Quiz'
      default:
        return 'Section'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Day {dayData.id}: {dayData.title}</DialogTitle>
            <Badge variant="outline">{dayData.duration}</Badge>
          </div>
          <DialogDescription className="text-base mt-2">
            {dayData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          <div className="flex space-x-1 border-b">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'sections'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('sections')}
            >
              Sections ({dayData.sections.length})
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What you'll learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This day covers essential concepts and hands-on activities to help you
                    understand AI fundamentals from a designer's perspective.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• No prior AI experience needed</li>
                    <li>• Basic design knowledge recommended</li>
                    <li>• 30-45 minutes of focused time</li>
                    <li>• Access to a computer with internet</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">After completing this day</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Earn a completion badge</li>
                    <li>• Unlock the next day's content</li>
                    <li>• Build practical AI skills</li>
                    <li>• Complete portfolio-ready activities</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="mt-6 space-y-3">
              {dayData.sections.map((section, index) => (
                <Card key={index} className="border-l-4 border-l-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      {getSectionIcon(section.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{section.title}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {getSectionTypeLabel(section.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link href="/signin" className="flex-1">
            <Button className="w-full" size="lg">
              Sign In to Access Course
            </Button>
          </Link>
          <Link href="/signup" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Create Account
            </Button>
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{' '}
          <Link href="/signin" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  )
}