// Course content types

export interface CourseDay {
  id: number
  title: string
  description: string
  estimatedTime: string
  sections: CourseSection[]
}

export interface CourseSection {
  id: string
  type: 'content' | 'video' | 'quiz' | 'activity'
  title: string
  content?: string
  contentIntro?: string
  contentOutro?: string
  flipCards?: FlipCard[]
  videos?: Video[]
  videoUrl?: string
  videoDescription?: string
  quiz?: Quiz
  activity?: Activity
}

export interface FlipCard {
  title: string
  description: string
}

export interface Video {
  title: string
  videoUrl: string
  duration: string
  description: string
}

export interface Quiz {
  id: string
  questions: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  question: string
  type: 'multiple-choice' | 'true-false'
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface Activity {
  id: string
  title: string
  description: string
  platforms: Platform[]
  instructions: string[]
}

export interface Platform {
  name: string
  url: string
  description: string
  isRecommended: boolean
}