'use client'

import { createContext, useContext, ReactNode, useState } from 'react'

interface CourseContextType {
  currentDay: number | null
  setCurrentDay: (day: number | null) => void
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function CourseProvider({ children }: { children: ReactNode }) {
  const [currentDay, setCurrentDay] = useState<number | null>(null)

  return (
    <CourseContext.Provider value={{ currentDay, setCurrentDay }}>
      {children}
    </CourseContext.Provider>
  )
}

export const useCourse = () => {
  const context = useContext(CourseContext)
  if (context === undefined) {
    throw new Error('useCourse must be used within a CourseProvider')
  }
  return context
}