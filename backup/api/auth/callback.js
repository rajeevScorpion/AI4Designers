import { supabaseAdmin } from "../shared/supabase.js";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // For web app, redirect to home page
    res.redirect('/');
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ message: 'Failed to complete authentication' });
  }
}