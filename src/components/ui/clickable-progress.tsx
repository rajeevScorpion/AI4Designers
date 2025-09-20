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
  sectionCompletionStatus?: boolean[] // Array indicating if each section is truly completed (including 100% quiz score)
  className?: string
}

export const ClickableProgress = React.forwardRef<
  HTMLDivElement,
  ClickableProgressProps
>(({ value, sections, completedSections, currentPage, currentPageCompleted, onSectionClick, unlockedSections, sectionCompletionStatus, className }, ref) => {
  const sectionWidth = 100 / sections
  const segments = Array.from({ length: sections }, (_, i) => ({
    index: i,
    isCompleted: sectionCompletionStatus ? sectionCompletionStatus[i] : i < completedSections.length,
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

      </div>
  )
})

ClickableProgress.displayName = "ClickableProgress"