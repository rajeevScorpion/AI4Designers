import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { CourseSidebar } from "@/components/course-sidebar";
import { AuthHeader } from "@/components/auth-header";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";
import Home from "@/pages/home";
import Day from "@/pages/day";
import SignIn from "@/pages/signin";
import SignUp from "@/pages/signup";
import Profile from "@/pages/profile";
import Certificate from "@/pages/certificate";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/useAuth";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { useLocation } from "wouter";

function Router({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/signin" component={SignIn} />
      <Route path="/signup" component={SignUp} />
      <Route path="/profile" component={Profile} />
      <Route path="/certificate" component={Certificate} />
      <Route path="/day/:dayId">
        {(params) => <Day isAuthenticated={isAuthenticated} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { sidebarData, isLoading: progressLoading } = useCourseProgress()
  const [, navigate] = useLocation()

  // Show loading state while fetching auth data
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Authenticated users get full UI with sidebar and progress tracking
  if (isAuthenticated) {
    // Custom sidebar width for the course
    const style = {
      "--sidebar-width": "20rem",
      "--sidebar-width-icon": "4rem",
    };

    // Show loading state while fetching progress data for authenticated users
    if (progressLoading) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading course data...</p>
          </div>
        </div>
      )
    }

    return (
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <CourseSidebar 
            days={sidebarData.days} 
            currentDay={sidebarData.currentDay} 
          />
          <div className="flex flex-col flex-1">
            <header className="flex items-center justify-between p-4 border-b bg-background">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <AuthHeader />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <Router isAuthenticated={isAuthenticated} />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Unauthenticated users get simplified UI without sidebar
  return (
    <div className="min-h-screen bg-background">
  
      <header className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">AI Fundamentals Course</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AuthHeader />
        </div>
      </header>
      <main>
        <Router isAuthenticated={isAuthenticated} />
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;