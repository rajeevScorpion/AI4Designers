import { CourseHeader } from '../course-header'

export default function CourseHeaderExample() {
  return (
    <CourseHeader
      currentDay={2}
      totalDays={5}
      overallProgress={35}
      dayTitle="Understanding AI Tools for Designers"
      estimatedTime="45 minutes"
      completedSections={2}
      totalSections={5}
    />
  )
}