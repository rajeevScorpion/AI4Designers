import { supabaseAdmin } from "../shared/supabase.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, first_name, last_name } = req.body;

    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          profile_image_url: null
        }
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.json({ message: 'Sign up successful', user: data.user });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ message: 'Failed to sign up' });
  }
}