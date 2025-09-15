import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Play, ExternalLink, BookOpen } from "lucide-react"
import type { CourseSection } from "@shared/schema"

interface SectionContentProps {
  section: CourseSection
  isCompleted: boolean
  onMarkComplete: (sectionId: string) => void
}

export function SectionContent({ section, isCompleted, onMarkComplete }: SectionContentProps) {
  const handleMarkComplete = () => {
    console.log(`Marking section ${section.id} as complete`)
    onMarkComplete(section.id)
  }

  if (section.type === 'content') {
    return (
      <Card className="p-6" data-testid={`section-${section.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{section.title}</h3>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-chart-3" />}
        </div>
        
        <div className="prose prose-sm max-w-none mb-6">
          <div dangerouslySetInnerHTML={{ __html: section.content || '' }} />
        </div>
        
        {!isCompleted && (
          <Button onClick={handleMarkComplete} data-testid={`button-complete-${section.id}`}>
            Mark as Complete
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </Card>
    )
  }

  if (section.type === 'video') {
    return (
      <Card className="p-6" data-testid={`section-${section.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">{section.title}</h3>
          </div>
          {isCompleted && <CheckCircle className="w-5 h-5 text-chart-3" />}
        </div>
        
        {section.videoDescription && (
          <p className="text-muted-foreground mb-4">{section.videoDescription}</p>
        )}
        
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
          <div className="text-center">
            <Play className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Video Player</p>
            <p className="text-xs text-muted-foreground mt-1">
              {section.videoUrl}
            </p>
          </div>
        </div>
        
        {!isCompleted && (
          <Button onClick={handleMarkComplete} data-testid={`button-complete-${section.id}`}>
            Mark as Watched
            <CheckCircle className="w-4 h-4 ml-2" />
          </Button>
        )}
      </Card>
    )
  }

  return null
}