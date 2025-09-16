import { supabaseAdmin, db } from "../shared/supabase.js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, first_name, last_name } = req.body;

    // Create auth user
    const { data, error } = await supabaseAdmin.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          full_name: `${first_name} ${last_name}`.trim(),
          profile_image_url: null
        }
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    // Create user record in the users table
    if (data.user) {
      try {
        await db.upsertUser({
          id: data.user.id,
          email: data.user.email,
          first_name,
          last_name,
          full_name: `${first_name} ${last_name}`.trim(),
          profile_image_url: null
        });
      } catch (dbError) {
        console.error('Database error creating user:', dbError);
        // Don't fail the signup if the user record creation fails
        // The user can be created later when they first sign in
      }
    }

    res.json({
      message: 'Sign up successful. Please check your email to verify your account.',
      user: data.user
    });
  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ message: 'Failed to sign up' });
  }
}