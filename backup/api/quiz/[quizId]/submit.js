import { db } from "../../../shared/supabase.js";
import { authenticateUser } from "../../../auth/index.js";
import { courseData } from "../../../shared/courseData.js";

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req, res);
    if (!user) return;

    const userId = user.id;
    const { quizId } = req.query;
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

    const expectedSections = courseData[dayId];
    const validSectionIds = expectedSections ? expectedSections.map(s => s.id) : [];

    const quizScores = { ...progress.quiz_scores, [quizId]: score };
    const completedSections = [...(progress.completed_sections || [])];

    if (validSectionIds.includes(quizId) && !completedSections.includes(quizId)) {
      completedSections.push(quizId);
    } else if (!validSectionIds.includes(quizId)) {
      console.warn(`Quiz ID '${quizId}' is not a valid section for day ${dayId}`);
    }

    const updatedProgress = await db.updateUserProgress(userId, dayId, {
      quiz_scores: quizScores,
      completed_sections: completedSections,
    });

    if (score >= 70) {
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
}