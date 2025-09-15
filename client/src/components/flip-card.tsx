import { useState } from "react"
import { Card } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FlipCardProps {
  icon: LucideIcon
  title: string
  description: string
  color?: string
  className?: string
}

export function FlipCard({ 
  icon: Icon, 
  title, 
  description, 
  color = "primary",
  className 
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleClick = () => {
    setIsFlipped(!isFlipped)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsFlipped(!isFlipped)
    }
  }

  return (
    <div
      className={cn(
        "flip-card-container h-64 w-full cursor-pointer perspective-1000",
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${title} card. ${isFlipped ? 'Showing description' : 'Click to flip and see description'}`}
      data-testid={`flip-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      style={{ minHeight: '16rem' }}
    >
      <div 
        className={cn(
          "flip-card-inner relative h-full w-full transition-transform duration-700 transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}
      >
        {/* Front Face */}
        <Card 
          className={cn(
            "flip-card-face absolute h-full w-full backface-hidden flex flex-col items-center justify-center p-6 text-center",
            "hover-elevate"
          )}
        >
          <Icon 
            className={cn(
              "w-16 h-16 mb-4",
              color === "primary" && "text-primary",
              color === "chart-1" && "text-chart-1",
              color === "chart-2" && "text-chart-2",
              color === "chart-3" && "text-chart-3",
              color === "chart-4" && "text-chart-4",
              color === "chart-5" && "text-chart-5"
            )} 
          />
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">Click to learn more</p>
        </Card>

        {/* Back Face */}
        <Card
          className={cn(
            "flip-card-face flip-card-back absolute h-full w-full backface-hidden flex flex-col p-6 rotate-y-180",
            "hover-elevate"
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <Icon
              className={cn(
                "w-6 h-6",
                color === "primary" && "text-primary",
                color === "chart-1" && "text-chart-1",
                color === "chart-2" && "text-chart-2",
                color === "chart-3" && "text-chart-3",
                color === "chart-4" && "text-chart-4",
                color === "chart-5" && "text-chart-5"
              )}
            />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
            <p className="text-sm leading-relaxed">{description}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">Click to flip back</p>
        </Card>
      </div>
    </div>
  )
}