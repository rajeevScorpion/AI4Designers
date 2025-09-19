import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface DayFlagsProps {
  currentDay: number
  completedDays: number[]
}

export function DayFlags({ currentDay, completedDays }: DayFlagsProps) {
  const router = useRouter()
  const [animatingDay, setAnimatingDay] = useState<number | null>(null)

  const handleFlagClick = (day: number) => {
    router.push(`/day/${day}`)
  }

  useEffect(() => {
    // Trigger animation when a day is completed
    const lastCompleted = completedDays[completedDays.length - 1]
    if (lastCompleted && !animatingDay) {
      setAnimatingDay(lastCompleted)
      setTimeout(() => setAnimatingDay(null), 600)
    }
  }, [completedDays, animatingDay])

  const getFlagColor = (day: number) => {
    if (completedDays.includes(day)) {
      // Use theme colors for completed days
      const colors = [
        "hsl(var(--primary))",      // Day 1 - Primary blue-green
        "hsl(var(--accent))",       // Day 2 - Purple accent
        "hsl(var(--chart-3))",      // Day 3 - Green chart color
        "hsl(var(--chart-4))",      // Day 4 - Pink chart color
        "hsl(var(--chart-5))"       // Day 5 - Red chart color
      ]
      return colors[day - 1] || "hsl(var(--primary))"
    }

    // Grey for incomplete days
    return "hsl(var(--grey-400))"
  }

  return (
    <div className="flex justify-center items-center gap-4 mb-4">
      {[1, 2, 3, 4, 5].map((day) => {
        const isCompleted = completedDays.includes(day)
        const isCurrent = day === currentDay
        const isAnimating = animatingDay === day

        return (
          <div key={day} className="flag-pole relative h-12">
            <button
              onClick={() => handleFlagClick(day)}
              className={cn(
                "relative px-3 py-1 rounded-t-sm font-medium text-sm transition-all duration-300 hover:scale-105",
                "flex items-center gap-1 min-w-[60px] justify-center",
                "hover-elevate",
                isAnimating && "flag-complete",
                isCompleted && "flag-wave",
                isCurrent && "ring-2 ring-primary"
              )}
              style={{
                backgroundColor: getFlagColor(day),
                color: isCompleted ? "hsl(var(--primary-foreground))" : "hsl(var(--muted-foreground))",
                boxShadow: isCompleted
                  ? "0 2px 4px rgba(0,0,0,0.1)"
                  : "0 1px 2px rgba(0,0,0,0.05)"
              }}
            >
              <span className="font-bold">Day</span>
              <span>{day.toString().padStart(2, '0')}</span>
              {isCompleted && (
                <span className="ml-1 text-xs">✓</span>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}