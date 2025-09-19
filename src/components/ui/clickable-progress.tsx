"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ClickableProgressProps {
  value: number
  sections: number
  completedSections: string[]
  currentPage: number
  currentPageCompleted: boolean
  onSectionClick: (sectionIndex: number) => void
  unlockedSections: number[]
  className?: string
}

export const ClickableProgress = React.forwardRef<
  HTMLDivElement,
  ClickableProgressProps
>(({ value, sections, completedSections, currentPage, currentPageCompleted, onSectionClick, unlockedSections, className }, ref) => {
  const sectionWidth = 100 / sections
  const segments = Array.from({ length: sections }, (_, i) => ({
    index: i,
    isCompleted: i < completedSections.length,
    isCurrent: i === currentPage,
    isUnlocked: unlockedSections.includes(i),
    width: sectionWidth
  }))

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickPercentage = (clickX / rect.width) * 100
    const sectionIndex = Math.floor(clickPercentage / sectionWidth)

    // Only allow clicking on unlocked sections
    if (unlockedSections.includes(sectionIndex)) {
      onSectionClick(sectionIndex)
    }
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* Main progress bar container */}
      <div
        ref={ref}
        className="relative h-2 w-full bg-grey-300 rounded-full overflow-hidden cursor-pointer select-none"
        onClick={handleClick}
      >
        {/* Progress segments */}
        <div className="absolute inset-0 flex">
          {segments.map((segment) => (
            <div
              key={segment.index}
              className={cn(
                "h-full border-r border-grey-400 last:border-r-0 transition-all duration-300 relative",
                segment.isUnlocked ? "hover:brightness-110 cursor-pointer" : "cursor-not-allowed"
              )}
              style={{
                width: `${segment.width}%`,
                backgroundColor: segment.isCurrent
                  ? currentPageCompleted
                    ? "#8B4513" // Brown for completed current activity
                    : segment.isUnlocked
                    ? "#FEF3C7" // Light yellow for active current activity
                    : "#9CA3AF" // Darker grey for locked current activity
                  : segment.isCompleted
                  ? "#8B4513" // Brown for completed activities
                  : segment.isUnlocked
                  ? "#D1D5DB" // Light grey for incomplete but unlocked activities
                  : "#9CA3AF" // Dark grey for locked activities
              }}
            >
              {/* Current section indicator */}
              {segment.isCurrent && !currentPageCompleted && segment.isUnlocked && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              )}
              {/* Lock overlay for locked sections */}
              {!segment.isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 bg-grey-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-grey-400 rounded-full"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section indicators below the progress bar */}
      <div className="flex justify-between mt-3 px-1">
        {segments.map((segment) => (
          <button
            key={segment.index}
            onClick={() => segment.isUnlocked && onSectionClick(segment.index)}
            disabled={!segment.isUnlocked}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-200",
              segment.isUnlocked ? "hover:scale-110" : "opacity-50 cursor-not-allowed"
            )}
            title={!segment.isUnlocked ? `Complete Activity ${segment.index} to unlock this section` : undefined}
          >
            {/* Section dot */}
            <div
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300 flex items-center justify-center",
                segment.isCompleted
                  ? "bg-amber-800 ring-2 ring-amber-800/30"
                  : segment.isCurrent
                  ? currentPageCompleted
                    ? "bg-amber-800 ring-2 ring-amber-800/20"
                    : segment.isUnlocked
                    ? "bg-amber-200 ring-2 ring-amber-200/20"
                    : "bg-grey-400"
                  : segment.isUnlocked
                  ? "bg-grey-400 hover:bg-grey-500"
                  : "bg-grey-500"
              )}
            >
              {/* Lock icon for locked sections */}
              {!segment.isUnlocked && (
                <div className="w-1.5 h-1.5 bg-grey-300 rounded-sm"></div>
              )}
            </div>
            {/* Section label */}
            <span
              className={cn(
                "text-xs font-medium transition-colors duration-200",
                segment.isCompleted
                  ? "text-amber-800"
                  : segment.isCurrent
                  ? currentPageCompleted
                    ? "text-amber-800"
                    : segment.isUnlocked
                    ? "text-amber-600"
                    : "text-grey-500"
                  : segment.isUnlocked
                  ? "text-grey-600 hover:text-grey-800"
                  : "text-grey-500"
              )}
            >
              {segment.index + 1}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
})

ClickableProgress.displayName = "ClickableProgress"