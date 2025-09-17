import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader
} from "@/components/ui/sidebar"
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
    <Sidebar data-testid="sidebar-course">
      <SidebarHeader className="p-6">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">AI Fundamentals</h2>
          <p className="text-sm text-muted-foreground">5-Day Crash Course</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {days.map((day) => (
          <SidebarGroup key={day.id}>
            <SidebarGroupLabel className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                {day.isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-chart-3" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
                <span>Day {day.id}</span>
              </div>
              {day.id === currentDay && (
                <Badge variant="default" className="text-xs">
                  Current
                </Badge>
              )}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={day.id === currentDay ? "bg-sidebar-accent" : ""}
                    data-testid={`button-sidebar-day-${day.id}`}
                  >
                    <Link href={`/day/${day.id}`}>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{day.title}</div>
                        {day.progress > 0 && (
                          <div className="mt-1">
                            <Progress value={day.progress} className="h-1" />
                          </div>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Show sections for all days */}
                {day.sections.map((section) => (
                  <SidebarMenuItem key={section.id}>
                    <SidebarMenuButton
                      asChild
                      className="pl-6 py-1"
                      data-testid={`button-sidebar-section-${section.id}`}
                    >
                      <Link href={`/day/${day.id}#${section.id}`}>
                        <div className="flex items-center gap-2">
                          {getSectionIcon(section.type)}
                          <span className="text-xs">{section.title}</span>
                          {section.isCompleted && (
                            <CheckCircle className="w-3 h-3 text-chart-3 ml-auto" />
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}