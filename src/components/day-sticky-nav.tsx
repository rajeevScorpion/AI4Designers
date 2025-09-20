import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  return (
    <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Navigation and Day Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
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

        </div>
    </div>
  )
}