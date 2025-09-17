import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  timestamp, 
  jsonb, 
  boolean,
  index,
  primaryKey
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Profile information
  fullName: varchar("full_name"),
  phone: varchar("phone"),
  profession: varchar("profession").default("student"), // 'student' or 'working'
  courseType: varchar("course_type"), // UG, PG, Diploma (for students)
  stream: varchar("stream"), // Graphic Design, UX Design, etc. (for students)
  fieldOfWork: varchar("field_of_work"), // UI/UX Design, Product Design, etc. (for professionals)
  designation: varchar("designation"), // Senior Designer, Design Lead, etc. (for professionals)
  organization: varchar("organization"), // College name or company name
  dateOfBirth: varchar("date_of_birth"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Course progress tracking
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dayId: integer("day_id").notNull(),
  completedSections: jsonb("completed_sections").$type<string[]>().default([]),
  completedSlides: jsonb("completed_slides").$type<string[]>().default([]),
  quizScores: jsonb("quiz_scores").$type<Record<string, number>>().default({}),
  currentSlide: integer("current_slide").default(0),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_user_progress_user_day").on(table.userId, table.dayId),
]);

// Badges earned by users
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeType: varchar("badge_type").notNull(), // 'day_complete', 'quiz_master', 'course_complete'
  badgeData: jsonb("badge_data").$type<{
    dayId?: number;
    title: string;
    description: string;
    iconName: string;
    color: string;
  }>().notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
}, (table) => [
  index("idx_user_badges_user").on(table.userId),
  index("idx_user_badges_type").on(table.badgeType),
]);

// Certificates for course completion
export const userCertificates = pgTable("user_certificates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  courseId: varchar("course_id").notNull().default("ai-fundamentals-5day"),
  certificateData: jsonb("certificate_data").$type<{
    userName: string;
    courseName: string;
    completionDate: string;
    overallScore: number;
    totalDays: number;
  }>().notNull(),
  issuedAt: timestamp("issued_at").defaultNow(),
}, (table) => [
  index("idx_user_certificates_user").on(table.userId),
]);

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  badges: many(userBadges),
  certificates: many(userCertificates),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
}));

export const userCertificatesRelations = relations(userCertificates, ({ one }) => ({
  user: one(users, {
    fields: [userCertificates.userId],
    references: [users.id],
  }),
}));

// Type exports for authentication
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Type exports for course functionality
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

export type UserCertificate = typeof userCertificates.$inferSelect;
export type InsertUserCertificate = typeof userCertificates.$inferInsert;

// Course structure types (kept from previous schema)
export interface CourseDay {
  id: number;
  title: string;
  description: string;
  sections: CourseSection[];
  estimatedTime: string;
}

export interface FlipCardData {
  title: string;
  description: string;
}

export interface VideoResource {
  title: string;
  videoUrl: string;
  duration?: string;
  description?: string;
}

export interface CourseSection {
  id: string;
  type: 'content' | 'activity' | 'quiz' | 'video';
  title: string;
  content?: string;
  contentIntro?: string; // Content before flip cards
  contentOutro?: string; // Content after flip cards
  flipCards?: FlipCardData[]; // Array of flip cards for the section
  videoUrl?: string; // Single video (legacy support)
  videoDescription?: string;
  videos?: VideoResource[]; // Multiple videos support
  duration?: string;
  description?: string;
  activity?: Activity;
  quiz?: Quiz;
}

export interface CourseSlide {
  id: string;
  type: 'content' | 'activity' | 'quiz' | 'video';
  title: string;
  content?: string;
  videoUrl?: string;
  videoDescription?: string;
  activity?: Activity;
  quiz?: Quiz;
  slideNumber: number;
  totalSlides: number;
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

// Zod schemas for validation
export const quizAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.number(),
});

export const progressUpdateSchema = z.object({
  dayId: z.number(),
  slideId: z.string(),
  completed: z.boolean(),
});

export const createProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const createBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const createCertificateSchema = createInsertSchema(userCertificates).omit({
  id: true,
  issuedAt: true,
});

// Direct type definitions to avoid zod inference issues
export type QuizAnswer = {
  questionId: string;
  answer: number;
};

export type ProgressUpdate = {
  dayId: number;
  slideId: string;
  completed: boolean;
};

export type CreateUserProgress = Omit<typeof userProgress.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>;
export type CreateUserBadge = Omit<typeof userBadges.$inferInsert, 'id' | 'earnedAt'>;
export type CreateUserCertificate = Omit<typeof userCertificates.$inferInsert, 'id' | 'issuedAt'>;