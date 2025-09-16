import { db } from "../shared/supabase.js";
import { authenticateUser } from "../auth/index.js";

export default async function handler(req, res) {
  try {
    const user = await authenticateUser(req, res);
    if (!user) return;

    const userId = user.id;

    if (req.method === 'GET') {
      const user = await db.getUser(userId);
      res.json(user);
    } else if (req.method === 'PUT') {
      const profileData = req.body;

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
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error handling profile:", error);
    res.status(500).json({ message: "Failed to handle profile request" });
  }
}