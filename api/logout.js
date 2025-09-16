export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Clear any stored token with proper cookie attributes
    res.clearCookie('supabase_token', {
      path: '/',
      secure: true,
      sameSite: 'lax'
    });

    // Redirect to home page
    res.redirect('/');
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to logout' });
  }
}