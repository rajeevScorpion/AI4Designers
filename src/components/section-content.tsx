import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle, Play, ExternalLink, BookOpen, Brain, Network, Cpu,
  Sparkles, Eye, MessageSquare, Layers, Zap, Bot, Lightbulb,
  Code2, Palette, Image, Wand2, Database, Cloud, Shield, TrendingUp
} from "lucide-react"
import { ConceptCard } from "@/components/concept-card"
import type { CourseSection } from "@shared/types"
import type { LucideIcon } from "lucide-react"
import { smoothScrollToTop } from "@/lib/smooth-scroll"

interface SectionContentProps {
  section: CourseSection
  isCompleted: boolean
  isAccessible: boolean
  onMarkComplete: (sectionId: string) => void
}

// Helper function to get appropriate icon for concept
function getIconForConcept(title: string): LucideIcon {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes('machine learning')) return Brain
  if (lowerTitle.includes('neural network')) return Network
  if (lowerTitle.includes('deep learning')) return Layers
  if (lowerTitle.includes('generative ai')) return Sparkles
  if (lowerTitle.includes('computer vision')) return Eye
  if (lowerTitle.includes('natural language') || lowerTitle.includes('nlp')) return MessageSquare
  if (lowerTitle.includes('artificial intelligence') || lowerTitle.includes('ai')) return Bot
  if (lowerTitle.includes('algorithm')) return Code2
  if (lowerTitle.includes('creativity') || lowerTitle.includes('creative')) return Palette
  if (lowerTitle.includes('image') || lowerTitle.includes('visual')) return Image
  if (lowerTitle.includes('automation') || lowerTitle.includes('automate')) return Zap
  if (lowerTitle.includes('transform') || lowerTitle.includes('magic')) return Wand2
  if (lowerTitle.includes('data')) return Database
  if (lowerTitle.includes('cloud') || lowerTitle.includes('api')) return Cloud
  if (lowerTitle.includes('security') || lowerTitle.includes('privacy')) return Shield
  if (lowerTitle.includes('future') || lowerTitle.includes('trend')) return TrendingUp
  if (lowerTitle.includes('idea') || lowerTitle.includes('concept')) return Lightbulb
  if (lowerTitle.includes('processing') || lowerTitle.includes('compute')) return Cpu
  
  return Brain // Default icon
}

// Helper function to get color for index
function getColorForIndex(index: number): string {
  const colors = ['primary', 'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5']
  return colors[index % colors.length]
}

export function SectionContent({ section, isCompleted, isAccessible, onMarkComplete }: SectionContentProps) {
  const handleMarkComplete = () => {
    console.log(`Marking section ${section.id} as complete`)
    onMarkComplete(section.id)
    // Scroll to top with custom smooth animation
    smoothScrollToTop({
      duration: 1200,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    })
  }

  // Show locked state if section is not accessible
  if (!isAccessible) {
    return (
      <Card className="p-6 opacity-60" data-testid={`section-${section.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-grey-500" />
            <h3 className="text-lg font-semibold text-grey-600">{section.title}</h3>
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
        
        {/* Check if section has concept cards */}
        {section.flipCards && section.flipCards.length > 0 ? (
          <>
            {/* Intro content before concept cards */}
            {section.contentIntro && (
              <div className="prose prose-sm max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: section.contentIntro }} />
              </div>
            )}

            {/* Concept cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {section.flipCards.map((card, index) => {
                const IconComponent = getIconForConcept(card.title)
                return (
                  <ConceptCard
                    key={index}
                    icon={IconComponent}
                    title={card.title}
                    description={card.description}
                  />
                )
              })}
            </div>

            {/* Outro content after concept cards */}
            {section.contentOutro && (
              <div className="prose prose-sm max-w-none mb-6">
                <div dangerouslySetInnerHTML={{ __html: section.contentOutro }} />
              </div>
            )}
          </>
        ) : (
          /* Regular content without concept cards */
          <div className="prose prose-sm max-w-none mb-6">
            <div dangerouslySetInnerHTML={{ __html: section.content || '' }} />
          </div>
        )}
        
        <Button
          onClick={handleMarkComplete}
          variant={isCompleted ? "outline" : "default"}
          className={isCompleted ? "text-muted-foreground hover:text-foreground" : ""}
          data-testid={`button-complete-${section.id}`}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              Mark as Complete
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
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
        
        <Button
          onClick={handleMarkComplete}
          variant={isCompleted ? "outline" : "default"}
          className={isCompleted ? "text-muted-foreground hover:text-foreground" : ""}
          data-testid={`button-complete-${section.id}`}
        >
          {isCompleted ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </>
          ) : (
            <>
              Mark as Watched
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </Card>
    )
  }

  return null
}