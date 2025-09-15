import {
  users,
  userProgress,
  userBadges,
  userCertificates,
  type User,
  type UpsertUser,
  type UserProgress,
  type InsertUserProgress,
  type UserBadge,
  type InsertUserBadge,
  type UserCertificate,
  type InsertUserCertificate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations - includes auth and course functionality
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Course progress operations
  getUserProgress(userId: string, dayId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: string, dayId: number, updates: Partial<InsertUserProgress>): Promise<UserProgress>;
  getAllUserProgress(userId: string): Promise<UserProgress[]>;
  
  // Badges operations
  getUserBadges(userId: string): Promise<UserBadge[]>;
  createUserBadge(badge: InsertUserBadge): Promise<UserBadge>;
  hasBadge(userId: string, badgeType: string, dayId?: number): Promise<boolean>;
  
  // Certificates operations
  getUserCertificates(userId: string): Promise<UserCertificate[]>;
  createUserCertificate(certificate: InsertUserCertificate): Promise<UserCertificate>;
  hasCertificate(userId: string, courseId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Course progress operations
  async getUserProgress(userId: string, dayId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.dayId, dayId)));
    return progress;
  }

  async createUserProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db
      .insert(userProgress)
      .values({
        ...progressData,
        updatedAt: new Date(),
      })
      .returning();
    return progress;
  }

  async updateUserProgress(userId: string, dayId: number, updates: Partial<InsertUserProgress>): Promise<UserProgress> {
    const [progress] = await db
      .update(userProgress)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(userProgress.userId, userId), eq(userProgress.dayId, dayId)))
      .returning();
    return progress;
  }

  async getAllUserProgress(userId: string): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(userProgress.dayId);
  }

  // Badges operations
  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
  }

  async createUserBadge(badgeData: InsertUserBadge): Promise<UserBadge> {
    const [badge] = await db
      .insert(userBadges)
      .values(badgeData)
      .returning();
    return badge;
  }

  async hasBadge(userId: string, badgeType: string, dayId?: number): Promise<boolean> {
    const query = db
      .select({ count: eq(userBadges.id, userBadges.id) })
      .from(userBadges)
      .where(and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeType, badgeType)
      ));

    // If dayId is provided, check for day-specific badges
    if (dayId !== undefined) {
      // Note: This would require a more complex query to check badgeData.dayId
      // For now, we'll do a simpler check
    }

    const [result] = await query;
    return !!result;
  }

  // Certificates operations
  async getUserCertificates(userId: string): Promise<UserCertificate[]> {
    return await db
      .select()
      .from(userCertificates)
      .where(eq(userCertificates.userId, userId))
      .orderBy(desc(userCertificates.issuedAt));
  }

  async createUserCertificate(certificateData: InsertUserCertificate): Promise<UserCertificate> {
    const [certificate] = await db
      .insert(userCertificates)
      .values(certificateData)
      .returning();
    return certificate;
  }

  async hasCertificate(userId: string, courseId: string): Promise<boolean> {
    const [result] = await db
      .select({ count: eq(userCertificates.id, userCertificates.id) })
      .from(userCertificates)
      .where(and(
        eq(userCertificates.userId, userId),
        eq(userCertificates.courseId, courseId)
      ));
    return !!result;
  }
}

export const storage = new DatabaseStorage();