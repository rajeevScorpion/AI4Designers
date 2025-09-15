import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  progressUpdateSchema, 
  createProgressSchema,
  createBadgeSchema,
  createCertificateSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Course progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getAllUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.get('/api/progress/:dayId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dayId = parseInt(req.params.dayId);
      const progress = await storage.getUserProgress(userId, dayId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching day progress:", error);
      res.status(500).json({ message: "Failed to fetch day progress" });
    }
  });

  app.post('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validation = progressUpdateSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request", 
          errors: validation.error.errors 
        });
      }

      const { dayId, slideId, completed } = validation.data;
      
      // Get existing progress or create new one
      let progress = await storage.getUserProgress(userId, dayId);
      
      if (!progress) {
        progress = await storage.createUserProgress({
          userId,
          dayId,
          completedSections: [],
          completedSlides: [],
          quizScores: {},
        });
      }

      // Update completed sections/slides
      const completedSections = progress.completedSections || [];
      const completedSlides = progress.completedSlides || [];
      
      if (completed && !completedSections.includes(slideId)) {
        completedSections.push(slideId);
      } else if (!completed) {
        const index = completedSections.indexOf(slideId);
        if (index > -1) {
          completedSections.splice(index, 1);
        }
      }

      const updatedProgress = await storage.updateUserProgress(userId, dayId, {
        completedSections,
        completedSlides,
      });

      res.json(updatedProgress);
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  app.post('/api/quiz/:quizId/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { quizId } = req.params;
      const { dayId, score } = req.body;

      let progress = await storage.getUserProgress(userId, dayId);
      
      if (!progress) {
        progress = await storage.createUserProgress({
          userId,
          dayId,
          completedSections: [],
          completedSlides: [],
          quizScores: {},
        });
      }

      const quizScores = { ...progress.quizScores, [quizId]: score };
      const completedSections = [...(progress.completedSections || [])];
      
      if (!completedSections.includes(quizId)) {
        completedSections.push(quizId);
      }

      const updatedProgress = await storage.updateUserProgress(userId, dayId, {
        quizScores,
        completedSections,
      });

      // Check if day is complete and award badge
      if (score >= 70) { // 70% passing score
        const hasBadge = await storage.hasBadge(userId, 'quiz_master');
        if (!hasBadge) {
          await storage.createUserBadge({
            userId,
            badgeType: 'quiz_master',
            badgeData: {
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
  app.get('/api/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  app.post('/api/badges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

      const badge = await storage.createUserBadge(validation.data);
      res.json(badge);
    } catch (error) {
      console.error("Error creating badge:", error);
      res.status(500).json({ message: "Failed to create badge" });
    }
  });

  // Certificates routes
  app.get('/api/certificates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const certificates = await storage.getUserCertificates(userId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  app.post('/api/certificates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has completed all 5 days
      const allProgress = await storage.getAllUserProgress(userId);
      const completedDays = allProgress.filter(p => p.isCompleted).length;
      
      if (completedDays < 5) {
        return res.status(400).json({ 
          message: "Course not complete", 
          completedDays,
          requiredDays: 5 
        });
      }

      // Calculate overall score
      const totalQuizzes = allProgress.reduce((acc, p) => 
        acc + Object.keys(p.quizScores || {}).length, 0
      );
      const totalScore = allProgress.reduce((acc, p) => 
        acc + Object.values(p.quizScores || {}).reduce((sum, score) => sum + score, 0), 0
      );
      const overallScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

      const certificate = await storage.createUserCertificate({
        userId,
        courseId: "ai-fundamentals-5day",
        certificateData: {
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Student',
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
  app.post('/api/progress/:dayId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const dayId = parseInt(req.params.dayId);

      const updatedProgress = await storage.updateUserProgress(userId, dayId, {
        isCompleted: true,
        completedAt: new Date(),
      });

      // Award day completion badge
      await storage.createUserBadge({
        userId,
        badgeType: 'day_complete',
        badgeData: {
          dayId: dayId,
          title: `Day ${dayId} Complete`,
          description: `Completed all activities for Day ${dayId}`,
          iconName: 'check-circle',
          color: 'green',
        },
      });

      res.json(updatedProgress);
    } catch (error) {
      console.error("Error completing day:", error);
      res.status(500).json({ message: "Failed to complete day" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}