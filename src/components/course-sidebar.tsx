// Removed sidebar imports since we're now using a sheet
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, BookOpen, Brain, Wrench, Play } from "lucide-react"
import Link from "next/link"

interface CourseSidebarProps {
  days: Array<{
    id: number
    title: string
    sections: Array<{
      id: string
      title: string
      type: 'content' | 'activity' | 'quiz' | 'video'
      isCompleted: boolean
    }>
    isCompleted: boolean
    progress: number
  }>
  currentDay: number
}

export function CourseSidebar({ days, currentDay }: CourseSidebarProps) {

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'content': return <BookOpen className="w-3 h-3" />
      case 'activity': return <Wrench className="w-3 h-3" />
      case 'quiz': return <Brain className="w-3 h-3" />
      case 'video': return <Play className="w-3 h-3" />
      default: return <Circle className="w-3 h-3" />
    }
  }

  return (
    <div data-testid="sidebar-course" className="space-y-6 h-full overflow-y-auto pt-6">
      {/* Course header is now shown in the sheet header */}

      {/* Course days */}
      {days.map((day) => (
        <div key={day.id} className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              {day.isCompleted ? (
                <CheckCircle className="w-4 h-4 text-chart-3" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium">Day {day.id}</span>
            </div>
            {day.id === currentDay && (
              <Badge variant="default" className="text-xs">
                Current
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            {/* Day link */}
            <Link
              href={`/day/${day.id}`}
              className={`block p-2 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                day.id === currentDay ? "bg-accent" : ""
              }`}
              data-testid={`button-sidebar-day-${day.id}`}
              onClick={() => {
                // Close the sidebar when navigating
                const sheet = document.querySelector('[data-state="open"] [role="dialog"]');
                if (sheet) {
                  const closeButton = sheet.querySelector('button[aria-label="Close"]');
                  if (closeButton) {
                    (closeButton as HTMLButtonElement).click();
                  }
                }
              }}
            >
              <div className="flex-1">
                <div>{day.title}</div>
                {day.progress > 0 && (
                  <div className="mt-1">
                    <Progress value={day.progress} className="h-1" />
                  </div>
                )}
              </div>
            </Link>

            {/* Sections */}
            {day.sections.map((section) => (
              <Link
                key={section.id}
                href={`/day/${day.id}#${section.id}`}
                className="flex items-center gap-2 p-2 pl-6 rounded-md text-xs transition-colors hover:bg-accent"
                data-testid={`button-sidebar-section-${section.id}`}
                onClick={() => {
                  // Close the sidebar when navigating
                  const sheet = document.querySelector('[data-state="open"] [role="dialog"]');
                  if (sheet) {
                    const closeButton = sheet.querySelector('button[aria-label="Close"]');
                    if (closeButton) {
                      (closeButton as HTMLButtonElement).click();
                    }
                  }
                }}
              >
                {getSectionIcon(section.type)}
                <span className="flex-1">{section.title}</span>
                {section.isCompleted && (
                  <CheckCircle className="w-4 h-4 text-chart-3 ml-2" />
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
      {/* Add padding at bottom for better scrolling */}
      <div className="pb-6" />
    </div>
  )
}