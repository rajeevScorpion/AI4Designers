import { db } from "../../shared/supabase.js";
import { authenticateUser } from "../../auth/index.js";
import { courseData } from "../../shared/courseData.js";

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req, res);
    if (!user) return;

    const userId = user.id;

    if (req.method === 'GET') {
      const progress = await db.getAllUserProgress(userId);
      res.json(progress);
    } else if (req.method === 'POST') {
      const { dayId, slideId, completed } = req.body;

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

      const expectedSections = courseData[dayId];
      const validSectionIds = expectedSections ? expectedSections.map(s => s.id) : [];

      const completedSections = [...(progress.completed_sections || [])];
      const completedSlides = [...(progress.completed_slides || [])];

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
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error handling progress:", error);
    res.status(500).json({ message: "Failed to handle progress request" });
  }
}