import { createClient } from '@supabase/supabase-js';
import { type Request, type Response } from 'express';
import { supabaseAdmin } from '../shared/supabase.js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });


// Helper to create a cookie-compatible storage for Express
const createCookieStorage = (req: Request, res: Response) => ({
  getCookie: (name: string) => {
    const cookie = req.headers.cookie?.split(';').find(c => c.trim().startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : undefined;
  },
  setCookie: (name: string, value: string, options: any) => {
    let cookieString = `${name}=${value}`;
    if (options.path) cookieString += `; Path=${options.path}`;
    if (options.maxAge) cookieString += `; Max-Age=${options.maxAge}`;
    if (options.domain) cookieString += `; Domain=${options.domain}`;
    if (options.secure) cookieString += `; Secure`;
    if (options.httpOnly) cookieString += `; HttpOnly`;
    if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
    res.setHeader('Set-Cookie', cookieString);
  },
  deleteCookie: (name: string, options: any) => {
    let cookieString = `${name}=; Max-Age=0`;
    if (options.path) cookieString += `; Path=${options.path}`;
    if (options.domain) cookieString += `; Domain=${options.domain}`;
    if (options.secure) cookieString += `; Secure`;
    if (options.httpOnly) cookieString += `; HttpOnly`;
    if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
    res.setHeader('Set-Cookie', cookieString);
  }
});

// Simple JWT token verification middleware
export const authenticateUser = async (req: Request, res: Response, next: Function) => {
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
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    // Add user to request object
    (req as any).user = {
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

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Optional authentication middleware (doesn't fail if not authenticated)
export const optionalAuth = async (req: Request, res: Response, next: Function) => {
  try {
    let token = null;

    // Try to get token from Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get token from cookie
      const cookie = req.headers.cookie?.split(';').find(c => c.trim().startsWith('supabase_token='));
      if (cookie) {
        token = cookie.split('=')[1];
      }
    }

    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);

      if (user) {
        (req as any).user = {
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
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

// Auth routes setup
export const setupAuthRoutes = (app: any) => {
  // Get current user
  app.get('/api/auth/user', authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  });

  // Update user profile
  app.put('/api/auth/user', authenticateUser, async (req: any, res: any) => {
    try {
      const userId = req.user.id;
      const { first_name, last_name, profile_image_url } = req.body;

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          user_metadata: {
            first_name,
            last_name,
            profile_image_url
          }
        }
      );

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.json(data.user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  // Sign up
  app.post('/api/auth/signup', async (req: Request, res: Response) => {
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
  });

  // Sign in
  app.post('/api/auth/signin', async (req: Request, res: Response) => {
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
  });

  // Google OAuth (simplified - returns OAuth URL)
  app.get('/api/auth/google', async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabaseAdmin.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${req.protocol}://${req.get('host')}/api/auth/callback`
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
  });

  // Auth callback (for OAuth)
  app.get('/api/auth/callback', async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ message: 'Authorization code required' });
      }

      const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code as string);

      if (error) {
        return res.status(400).json({ message: error.message });
      }

      res.redirect('/');
    } catch (error) {
      console.error('Auth callback error:', error);
      res.status(500).json({ message: 'Failed to complete authentication' });
    }
  });

  // Logout endpoint
  app.get('/api/logout', async (req: Request, res: Response) => {
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
  });
};