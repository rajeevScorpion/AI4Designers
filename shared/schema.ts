import { z } from "zod";

// Course structure types
export interface CourseDay {
  id: number;
  title: string;
  description: string;
  sections: CourseSection[];
  estimatedTime: string;
}

export interface CourseSection {
  id: string;
  type: 'content' | 'activity' | 'quiz' | 'video';
  title: string;
  content?: string;
  videoUrl?: string;
  videoDescription?: string;
  activity?: Activity;
  quiz?: Quiz;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  platforms: ActivityPlatform[];
  instructions: string[];
}

export interface ActivityPlatform {
  name: string;
  url: string;
  description: string;
  logo?: string;
  isRecommended?: boolean;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Progress tracking types
export interface UserProgress {
  ip: string;
  completedSections: string[];
  quizScores: Record<string, number>;
  currentDay: number;
  lastAccessed: Date;
}

// Zod schemas for validation
export const quizAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.number(),
});

export const progressUpdateSchema = z.object({
  sectionId: z.string(),
  completed: z.boolean(),
});

export type QuizAnswer = z.infer<typeof quizAnswerSchema>;
export type ProgressUpdate = z.infer<typeof progressUpdateSchema>;