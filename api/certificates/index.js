import { db } from "../../shared/supabase.js";
import { authenticateUser } from "../../auth/index.js";
import { courseData } from "../../shared/courseData.js";

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req, res);
    if (!user) return;

    const userId = user.id;

    if (req.method === 'GET') {
      const certificates = await db.getUserCertificates(userId);
      res.json(certificates);
    } else if (req.method === 'POST') {
      const userData = await db.getUser(userId);

      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }

      const existingCertificate = await db.hasCertificate(userId, "ai-fundamentals-5day");
      if (existingCertificate) {
        const certificates = await db.getUserCertificates(userId);
        return res.status(400).json({
          message: "Certificate already issued",
          certificate: certificates[0]
        });
      }

      const allProgress = await db.getAllUserProgress(userId);
      const progressByDay = new Map(allProgress.map(p => [p.day_id, p]));

      const incompleteDays = [];
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
          incompleteDays
        });
      }

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

      const totalQuizzes = allProgress.reduce((acc, p) =>
        acc + Object.keys(p.quiz_scores || {}).length, 0
      );
      const totalScore = allProgress.reduce((acc, p) =>
        acc + Object.values(p.quiz_scores || {}).reduce((sum, score) => sum + score, 0), 0
      );
      const overallScore = totalQuizzes > 0 ? Math.round(totalScore / totalQuizzes) : 0;

      const certificate = await db.createUserCertificate({
        user_id: userId,
        course_id: "ai-fundamentals-5day",
        certificate_data: {
          userName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || userData.email || 'Student',
          courseName: "AI Fundamentals for Designers - 5-Day Crash Course",
          completionDate: new Date().toLocaleDateString(),
          overallScore,
          totalDays: 5,
        },
      });

      res.json(certificate);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error handling certificates:", error);
    res.status(500).json({ message: "Failed to handle certificates request" });
  }
}