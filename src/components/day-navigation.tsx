import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Clock, ArrowRight } from "lucide-react"
import { Link } from "wouter"

interface DayNavigationProps {
  days: Array<{
    id: number
    title: string
    description: string
    estimatedTime: string
    isCompleted: boolean
    isActive: boolean
    progress: number
  }>
  onDaySelect: (dayId: number) => void
}

export function DayNavigation({ days, onDaySelect }: DayNavigationProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {days.map((day) => (
        <Card 
          key={day.id} 
          className={`p-6 hover-elevate transition-all cursor-pointer ${
            day.isActive ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onDaySelect(day.id)}
          data-testid={`card-day-${day.id}`}
        >
          <div className="flex flex-col gap-4">
            {/* Day header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {day.isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-chart-3" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <h3 className="font-semibold">Day {day.id}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {day.estimatedTime}
                  </div>
                </div>
              </div>
              {day.isActive && (
                <Badge variant="default" className="text-xs">
                  Current
                </Badge>
              )}
            </div>

            {/* Day content */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm" data-testid={`text-day-${day.id}-title`}>
                {day.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {day.description}
              </p>
            </div>

            {/* Progress and action */}
            <div className="space-y-3">
              {day.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(day.progress)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1">
                    <div 
                      className="bg-primary rounded-full h-1 transition-all" 
                      style={{ width: `${day.progress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <Button 
                variant={day.isActive ? "default" : "outline"} 
                size="sm" 
                className="w-full"
                data-testid={`button-start-day-${day.id}`}
              >
                {day.isCompleted ? 'Review' : day.isActive ? 'Continue' : 'Start Day'}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}