import { supabaseAdmin } from "../shared/supabase.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({
      message: 'Sign in successful',
      user: data.user,
      session: data.session
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: 'Failed to sign in' });
  }
}