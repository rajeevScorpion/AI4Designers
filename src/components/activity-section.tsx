import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ExternalLink, Star, Wrench } from "lucide-react"
import type { Activity } from "@shared/schema"
import { smoothScrollToTop } from "@/lib/smooth-scroll"

interface ActivitySectionProps {
  activity: Activity
  sectionId: string
  isCompleted: boolean
  isAccessible: boolean
  onMarkComplete: (sectionId: string) => void
}

export function ActivitySection({ activity, sectionId, isCompleted, isAccessible, onMarkComplete }: ActivitySectionProps) {
  const handleMarkComplete = () => {
    console.log(`Marking section ${sectionId} as complete`)
    onMarkComplete(sectionId)
    // Scroll to top with custom smooth animation
    smoothScrollToTop({
      duration: 1200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    })
  }

  const handleMarkIncomplete = () => {
    console.log(`Marking section ${sectionId} as incomplete`)
    onMarkComplete(sectionId) // This will toggle completion status
  }

  // Show locked state if section is not accessible
  if (!isAccessible) {
    return (
      <Card className="p-6 opacity-60" data-testid={`activity-${activity.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-grey-500" />
            <h3 className="text-lg font-semibold text-grey-600">{activity.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-grey-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-grey-300 rounded-sm"></div>
            </div>
            <span className="text-sm text-grey-500">Locked</span>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="w-12 h-12 bg-grey-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-grey-400 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-grey-300 rounded-sm"></div>
            </div>
          </div>
          <p className="text-grey-600 mb-2">Complete the previous activity to unlock this section</p>
          <p className="text-sm text-grey-500">Activities must be completed in sequential order</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6" data-testid={`activity-${activity.id}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-accent-foreground" />
          <h3 className="text-lg font-semibold">{activity.title}</h3>
        </div>
        {isCompleted && <CheckCircle className="w-5 h-5 text-chart-3" />}
      </div>
      
      <p className="text-muted-foreground mb-6">{activity.description}</p>
      
      {/* Platforms */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium">Recommended Platforms</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {activity.platforms.map((platform, index) => (
            <Card key={index} className="p-4 hover-elevate">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-sm">{platform.name}</h5>
                  {platform.isRecommended && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{platform.description}</p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(platform.url, '_blank')}
                data-testid={`button-platform-${platform.name.toLowerCase().replace(/\\s+/g, '-')}`}
              >
                Try {platform.name}
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="space-y-4 mb-6">
        <h4 className="font-medium">Instructions</h4>
        <div className="space-y-2">
          {activity.instructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-3">
              <Badge variant="outline" className="text-xs min-w-[24px] h-6 flex items-center justify-center">
                {index + 1}
              </Badge>
              <p className="text-sm text-muted-foreground">{instruction}</p>
            </div>
          ))}
        </div>
      </div>
      
      <Button
        onClick={isCompleted ? handleMarkIncomplete : handleMarkComplete}
        variant={isCompleted ? "outline" : "default"}
        className={isCompleted ? "text-muted-foreground hover:text-foreground" : ""}
        data-testid={`button-complete-${activity.id}`}
      >
        {isCompleted ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed
          </>
        ) : (
          <>
            Mark Activity Complete
            <CheckCircle className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </Card>
  )
}