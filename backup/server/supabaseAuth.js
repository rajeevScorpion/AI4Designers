import { supabaseAdmin } from "../shared/supabase.js";

// Simple JWT token verification middleware for Vercel
export const authenticateUser = async (req, res) => {
  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;
    let token = null;

    // Try to get token from Authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' prefix
    } else {
      // Try to get token from cookie
      const cookie = req.headers.cookie?.split(';').find(c => c.trim().startsWith('supabase_token='));
      if (cookie) {
        token = cookie.split('=')[1];
      }
    }

    if (!token) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return null;
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
      return null;
    }

    // Return user object
    return {
      id: user.id,
      email: user.email,
      claims: {
        sub: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name,
        last_name: user.user_metadata?.last_name,
        profile_image_url: user.user_metadata?.profile_image_url
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
    return null;
  }
};