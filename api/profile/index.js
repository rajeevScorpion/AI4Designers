import { db } from "../shared/supabase.js";
import { supabaseAdmin } from "../shared/supabase.js";

export default async function handler(req, res) {
  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    const userId = user.id;

    if (req.method === 'GET') {
      const userData = await db.getUser(userId);
      res.json(userData);
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