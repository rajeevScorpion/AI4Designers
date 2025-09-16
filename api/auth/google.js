import { supabaseAdmin } from "../shared/supabase.js";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const origin = req.headers.origin || 'http://localhost:5173';

    const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/api/auth/callback`
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ url: data.url });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Failed to initiate Google auth' });
  }
}