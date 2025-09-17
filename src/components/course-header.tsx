import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock } from "lucide-react"

interface CourseHeaderProps {
  currentDay: number
  totalDays: number
  overallProgress: number
  dayTitle: string
  estimatedTime: string
  completedSections: number
  totalSections: number
}

export function CourseHeader({
  currentDay,
  totalDays,
  overallProgress,
  dayTitle,
  estimatedTime,
  completedSections,
  totalSections
}: CourseHeaderProps) {
  return (
    <div className="border-b bg-card p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          {/* Course title and progress */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-course-title">
                AI Fundamentals for Designers
              </h1>
              <p className="text-muted-foreground">
                5-Day Crash Course • Day {currentDay} of {totalDays}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {Math.round(overallProgress)}% Complete
              </Badge>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" data-testid="progress-overall" />
          </div>

          {/* Current day info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
            <div>
              <h2 className="text-xl font-semibold" data-testid="text-day-title">
                {dayTitle}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {estimatedTime}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {completedSections} of {totalSections} sections
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}