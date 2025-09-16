import { db } from "../../shared/supabase.js";
import { authenticateUser } from "../../auth/index.js";
import { courseData } from "../../shared/courseData.js";

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req, res);
    if (!user) return;

    const userId = user.id;
    const dayId = parseInt(req.query.dayId);

    if (req.method === 'GET') {
      const progress = await db.getUserProgress(userId, dayId);
      res.json(progress);
    } else if (req.method === 'POST' && req.url.includes('complete')) {
      const expectedSections = courseData[dayId];
      if (!expectedSections) {
        return res.status(400).json({ message: "Invalid day ID" });
      }

      let progress = await db.getUserProgress(userId, dayId);
      if (!progress) {
        return res.status(400).json({
          message: "No progress found for this day. Please complete some sections first."
        });
      }

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

      const updatedProgress = await db.updateUserProgress(userId, dayId, {
        is_completed: true,
        completed_at: new Date(),
      });

      const hasBadge = await db.hasBadge(userId, 'day_complete');
      if (!hasBadge) {
        await db.createUserBadge({
          user_id: userId,
          badge_type: 'day_complete',
          badge_data: {
            dayId: dayId,
            title: `Day ${dayId} Complete`,
            description: `Completed all activities for Day ${dayId}`,
            iconName: 'check-circle',
            color: 'green',
          },
        });
      }

      res.json(updatedProgress);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error handling progress:", error);
    res.status(500).json({ message: "Failed to handle progress request" });
  }
}