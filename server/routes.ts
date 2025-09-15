import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "../shared/supabase.js";
import { setupAuthRoutes, authenticateUser } from "./supabaseAuth";
import {
  progressUpdateSchema,
  createProgressSchema,
  createBadgeSchema,
  createCertificateSchema
} from "@shared/schema";
import { courseData } from "@shared/courseData";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuthRoutes(app);

  // Auth routes
  app.get('/api/auth/user', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await db.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.get('/api/profile', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await db.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put('/api/profile', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = req.body;

      // Update user profile
      const updatedUser = await db.updateUser(userId, {
        full_name: profileData.fullName,
        phone: profileData.phone,
        profession: profileData.profession,
        course_type: profileData.courseType,
        stream: profileData.stream,
        field_of_work: profileData.fieldOfWork,
        designation: profileData.designation,
        organization: profileData.organization,
        date_of_birth: profileData.dateOfBirth
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Course progress routes
  app.get('/api/progress', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progress = await db.getAllUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get('/api/progress/:dayId', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const dayId = parseInt(req.params.dayId);
      const progress = await db.getUserProgress(userId, dayId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching day progress:", error);
      res.status(500).json({ message: "Failed to fetch day progress" });
    }
  });

  app.post('/api/progress', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validation = progressUpdateSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid request",
          errors: validation.error.errors
        });
      }

      const { dayId, slideId, completed } = validation.data;

      // Get existing progress or create new one
      let progress = await db.getUserProgress(userId, dayId);

      if (!progress) {
        progress = await db.createUserProgress({
          user_id: userId,
          day_id: dayId,
          completedSections: [],
          completedSlides: [],
          quiz_scores: {},
        });
      }

      // Get expected sections for validation
      const expectedSections = courseData[dayId];
      const validSectionIds = expectedSections ? expectedSections.map(s => s.id) : [];

      // Update completed sections/slides
      const completedSections = [...(progress.completed_sections || [])];
      const completedSlides = [...(progress.completed_slides || [])];

      // Validate that the slideId is a valid section for this day
      if (!validSectionIds.includes(slideId)) {
        return res.status(400).json({
          message: `Invalid section ID '${slideId}' for day ${dayId}`,
          validSections: validSectionIds
        });
      }

      if (completed && !completedSections.includes(slideId)) {
        completedSections.push(slideId);
      } else if (!completed) {
        const index = completedSections.indexOf(slideId);
        if (index > -1) {
          completedSections.splice(index, 1);
        }
      }

      const updatedProgress = await db.updateUserProgress(userId, dayId, {
        completed_sections: completedSections,
        completed_slides: completedSlides,
      });

      res.json(updatedProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.post('/api/quiz/:quizId/submit', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { quizId } = req.params;
      const { dayId, score } = req.body;

      let progress = await db.getUserProgress(userId, dayId);

      if (!progress) {
        progress = await db.createUserProgress({
          user_id: userId,
          day_id: dayId,
          completed_sections: [],
          completed_slides: [],
          quiz_scores: {},
        });
      }

      // Get expected sections for validation
      const expectedSections = courseData[dayId];
      const validSectionIds = expectedSections ? expectedSections.map(s => s.id) : [];

      const quizScores = { ...progress.quiz_scores, [quizId]: score };
      const completedSections = [...(progress.completed_sections || [])];

      // Validate that the quizId is a valid section for this day
      if (validSectionIds.includes(quizId) && !completedSections.includes(quizId)) {
        completedSections.push(quizId);
      } else if (!validSectionIds.includes(quizId)) {
        console.warn(`Quiz ID '${quizId}' is not a valid section for day ${dayId}`);
      }

      const updatedProgress = await db.updateUserProgress(userId, dayId, {
        quiz_scores: quizScores,
        completed_sections: completedSections,
      });

      // Check if day is complete and award badge
      if (score >= 70) { // 70% passing score
        const hasBadge = await db.hasBadge(userId, 'quiz_master');
        if (!hasBadge) {
          await db.createUserBadge({
            user_id: userId,
            badge_type: 'quiz_master',
            badge_data: {
              title: 'Quiz Master',
              description: 'Scored 70% or higher on a quiz',
              iconName: 'brain',
              color: 'blue',
            },
          });
        }
      }

      res.json(updatedProgress);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // Badges routes
  app.get('/api/badges', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const badges = await db.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.post('/api/badges', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validation = createBadgeSchema.safeParse({
        ...req.body,
        userId,
      });

      if (!validation.success) {
        return res.status(400).json({
          message: "Invalid request",
          errors: validation.error.errors
        });
      }

      const badge = await db.createUserBadge({
        ...validation.data,
        badge_data: validation.data.badgeData as {
          dayId?: number;
          title: string;
          description: string;
          iconName: string;
          color: string;
        }
      });
      res.json(badge);
    } catch (error) {
      console.error("Error creating badge:", error);
      res.status(500).json({ message: "Failed to create badge" });
    }
  });

  // Certificates routes
  app.get('/api/certificates', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const certificates = await db.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post('/api/certificates', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await db.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if certificate already exists to prevent duplicates
      const existingCertificate = await db.hasCertificate(userId, "ai-fundamentals-5day");
      if (existingCertificate) {
        const certificates = await db.getUserCertificates(userId);
        return res.status(400).json({
          message: "Certificate already issued",
          certificate: certificates[0] // Return the existing certificate
        });
      }

      // Check if user has completed all 5 days specifically (days 1-5)
      const allProgress = await db.getAllUserProgress(userId);

      // Create a map of progress by dayId for easy lookup
      const progressByDay = new Map(allProgress.map(p => [p.day_id, p]));

      // Check each day (1-5) specifically
      const incompleteDays: number[] = [];
      for (let dayId = 1; dayId <= 5; dayId++) {
        const dayProgress = progressByDay.get(dayId);
        if (!dayProgress || !dayProgress.is_completed) {
          incompleteDays.push(dayId);
        }
      }

      if (incompleteDays.length > 0) {
        return res.status(400).json({
          message: `Course not complete. Missing days: ${incompleteDays.join(', ')}`,
          completedDays: 5 - incompleteDays.length,
          requiredDays: 5,
          incompleteDays: incompleteDays
        });
      }

      // Validate that each completed day actually has the expected sections completed
      for (let dayId = 1; dayId <= 5; dayId++) {
        const dayProgress = progressByDay.get(dayId);
        const expectedSections = courseData[dayId];

        if (expectedSections) {
          const expectedSectionIds = expectedSections.map(section => section.id);
          const completedSections = dayProgress?.completed_sections || [];
          const allSectionsCompleted = expectedSectionIds.every(sectionId =>
            completedSections.includes(sectionId)
          );

          if (!allSectionsCompleted) {
            const missingSections = expectedSectionIds.filter(sectionId =>
              !completedSections.includes(sectionId)
            );
            return res.status(400).json({
              message: `Day ${dayId} marked as complete but missing sections: ${missingSections.join(', ')}`,
              dayId,
              missingSections
            });
          }
        }
      }

      // Calculate overall score from completed quizzes
      const totalQuizzes = allProgress.reduce((acc, p) =>
        acc + Object.keys(p.quiz_scores || {}).length, 0
      );
      const totalScore = allProgress.reduce((acc, p) =>
        acc + Object.values(p.quiz_scores || {}).reduce((sum, score) => sum + score, 0), 0
      );
      const overallScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

      // All validations passed, create the certificate
      const certificate = await db.createUserCertificate({
        user_id: userId,
        course_id: "ai-fundamentals-5day",
        certificate_data: {
          userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Student',
          courseName: "AI Fundamentals for Designers - 5-Day Crash Course",
          completionDate: new Date().toLocaleDateString(),
          overallScore,
          totalDays: 5,
        },
      });

      res.json(certificate);
    } catch (error) {
      console.error("Error creating certificate:", error);
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });

  // Day completion route
  app.post('/api/progress/:dayId/complete', authenticateUser, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const dayId = parseInt(req.params.dayId);

      // Get expected sections for this day
      const expectedSections = courseData[dayId];
      if (!expectedSections) {
        return res.status(400).json({ message: "Invalid day ID" });
      }

      // Get current progress for this day
      let progress = await db.getUserProgress(userId, dayId);
      if (!progress) {
        return res.status(400).json({
          message: "No progress found for this day. Please complete some sections first."
        });
      }

      // Check if all sections are completed
      const completedSections = progress.completed_sections || [];
      const expectedSectionIds = expectedSections.map(section => section.id);
      const allSectionsCompleted = expectedSectionIds.every(sectionId =>
        completedSections.includes(sectionId)
      );

      if (!allSectionsCompleted) {
        const missingSections = expectedSectionIds.filter(sectionId =>
          !completedSections.includes(sectionId)
        );
        return res.status(400).json({
          message: `Day cannot be completed. Missing sections: ${missingSections.join(', ')}`,
          completedSections: completedSections.length,
          totalSections: expectedSectionIds.length,
          missingSections
        });
      }

      // All sections are completed, mark day as complete
      const updatedProgress = await db.updateUserProgress(userId, dayId, {
        is_completed: true,
        completed_at: new Date(),
      });

      // Award day completion badge (check if already exists to avoid duplicates)
      const hasBadge = await db.hasBadge(userId, 'day_complete');
      if (!hasBadge) {
        await db.createUserBadge({
          user_id: userId,
          badge_type: 'day_complete',
          badge_data: {
            dayId: dayId as number,
            title: `Day ${dayId} Complete`,
            description: `Completed all activities for Day ${dayId}`,
            iconName: 'check-circle',
            color: 'green',
          },
        });
      }

      res.json(updatedProgress);
    } catch (error) {
      console.error("Error completing day:", error);
      res.status(500).json({ message: "Failed to complete day" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}