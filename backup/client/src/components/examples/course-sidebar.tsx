import { CourseSidebar } from '../course-sidebar'
import { SidebarProvider } from "@/components/ui/sidebar"

export default function CourseSidebarExample() {
  const mockDays = [
    {
      id: 1,
      title: "Introduction to AI",
      sections: [
        { id: "intro-1", title: "What is AI?", type: "content" as const, isCompleted: true },
        { id: "intro-2", title: "AI in Design", type: "video" as const, isCompleted: true },
        { id: "intro-3", title: "Knowledge Check", type: "quiz" as const, isCompleted: true }
      ],
      isCompleted: true,
      progress: 100
    },
    {
      id: 2,
      title: "AI Tools for Designers",
      sections: [
        { id: "tools-1", title: "Popular AI Platforms", type: "content" as const, isCompleted: true },
        { id: "tools-2", title: "Hands-on Experience", type: "activity" as const, isCompleted: false },
        { id: "tools-3", title: "Tool Comparison", type: "video" as const, isCompleted: false },
        { id: "tools-4", title: "Assessment", type: "quiz" as const, isCompleted: false }
      ],
      isCompleted: false,
      progress: 25
    },
    {
      id: 3,
      title: "Generative AI",
      sections: [
        { id: "gen-1", title: "Image Generation", type: "content" as const, isCompleted: false },
        { id: "gen-2", title: "Create AI Art", type: "activity" as const, isCompleted: false }
      ],
      isCompleted: false,
      progress: 0
    }
  ]

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-96 w-full">
        <CourseSidebar days={mockDays} currentDay={2} />
        <div className="flex-1 p-6 bg-background">
          <p className="text-muted-foreground">Main content area</p>
        </div>
      </div>
    </SidebarProvider>
  )
}