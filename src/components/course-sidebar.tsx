// Removed sidebar imports since we're now using a sheet
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

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
  const pathname = usePathname()
  const [currentDayFromUrl, setCurrentDayFromUrl] = useState<number | null>(null)

  // Extract current day from URL path
  useEffect(() => {
    const dayMatch = pathname.match(/\/day\/(\d+)/)
    if (dayMatch) {
      setCurrentDayFromUrl(parseInt(dayMatch[1]))
    } else {
      setCurrentDayFromUrl(null)
    }
  }, [pathname])

  // Use URL-based current day, fall back to prop-based current day
  const displayCurrentDay = currentDayFromUrl || currentDay

  return (
    <div data-testid="sidebar-course" className="space-y-6 h-full overflow-y-auto pt-6">
      {/* Course header is now shown in the sheet header */}

      {/* Course days */}
      {days.map((day) => (
        <div key={day.id} className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              {day.isCompleted ? (
                <CheckCircle className="w-4 h-4 text-amber-800" />
              ) : (
                <Circle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium">Day {day.id}</span>
            </div>
            {day.id === displayCurrentDay && (
              <Badge variant="default" className="text-xs bg-amber-200 text-amber-900">
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
                {section.isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-amber-800" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="flex-1">{section.title}</span>
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