import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { CourseSidebar } from "@/components/course-sidebar";
import Home from "@/pages/home";
import Day from "@/pages/day";
import NotFound from "@/pages/not-found";
import { useState } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/day/:dayId" component={Day} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // todo: remove mock functionality - replace with real progress data
  const [mockSidebarData] = useState({
    days: [
      {
        id: 1,
        title: "Introduction to AI",
        sections: [
          { id: "intro-content-1", title: "What is AI?", type: "content" as const, isCompleted: false },
          { id: "intro-video-1", title: "AI in Design", type: "video" as const, isCompleted: false },
          { id: "intro-quiz-1", title: "Knowledge Check", type: "quiz" as const, isCompleted: false }
        ],
        isCompleted: false,
        progress: 0
      },
      {
        id: 2,
        title: "AI Tools for Designers",
        sections: [
          { id: "tools-content-1", title: "Popular Platforms", type: "content" as const, isCompleted: false },
          { id: "tools-activity-1", title: "Hands-on Practice", type: "activity" as const, isCompleted: false }
        ],
        isCompleted: false,
        progress: 0
      },
      {
        id: 3,
        title: "Generative AI",
        sections: [
          { id: "gen-content-1", title: "Image Generation", type: "content" as const, isCompleted: false },
          { id: "gen-activity-1", title: "Create AI Art", type: "activity" as const, isCompleted: false }
        ],
        isCompleted: false,
        progress: 0
      },
      {
        id: 4,
        title: "AI Workflows",
        sections: [
          { id: "workflow-content-1", title: "Integration Strategies", type: "content" as const, isCompleted: false }
        ],
        isCompleted: false,
        progress: 0
      },
      {
        id: 5,
        title: "Future of AI",
        sections: [
          { id: "future-content-1", title: "Emerging Trends", type: "content" as const, isCompleted: false }
        ],
        isCompleted: false,
        progress: 0
      }
    ],
    currentDay: 1
  });

  // Custom sidebar width for the course
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <CourseSidebar 
                days={mockSidebarData.days} 
                currentDay={mockSidebarData.currentDay} 
              />
              <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b bg-background">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
