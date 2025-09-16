import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { useLocation } from "wouter"

interface DayStickyNavProps {
  dayId: number
  title: string
  estimatedTime: string
  sectionsCount: number
  completedSections: string[]
  progress: number
  isAuthenticated: boolean
}

export function DayStickyNav({
  dayId,
  title,
  estimatedTime,
  sectionsCount,
  completedSections,
  progress,
  isAuthenticated
}: DayStickyNavProps) {
  const [, navigate] = useLocation()

  return (
    <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Navigation and Day Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline">Day {dayId} of 5</Badge>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-sm truncate">{title}</h2>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>⏱️ {estimatedTime}</span>
                <span>📚 {sectionsCount} sections</span>
                <span className="flex items-center gap-1">
                  ✅ {completedSections.length} completed
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Progress */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-24">
              <Progress value={progress} className="h-2" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Authentication Prompt for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between gap-2 bg-primary/5 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">!</span>
                </div>
                <div className="text-xs">
                  <p className="font-medium text-primary">Sign in to save your progress</p>
                  <p className="text-xs text-muted-foreground">Progress lost when tab closes</p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/signin')}
                size="sm"
                variant="outline"
                className="text-xs h-7 px-3"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}