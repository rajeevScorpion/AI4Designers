import { db } from "../../shared/supabase.js";
import { authenticateUser } from "../../auth/index.js";

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req, res);
    if (!user) return;

    const userId = user.id;

    if (req.method === 'GET') {
      const badges = await db.getUserBadges(userId);
      res.json(badges);
    } else if (req.method === 'POST') {
      const badgeData = req.body;

      const badge = await db.createUserBadge({
        user_id: userId,
        badge_type: badgeData.badgeType,
        badge_data: badgeData.badgeData,
      });

      res.json(badge);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error handling badges:", error);
    res.status(500).json({ message: "Failed to handle badges request" });
  }
}