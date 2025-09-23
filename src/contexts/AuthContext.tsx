'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User, AuthError } from '@supabase/supabase-js'
import { authService } from '@/lib/auth'

interface AuthResult {
  success: boolean
  error?: string
  user?: User
}

interface SignUpData {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface SignInData {
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signUpWithEmail: (data: SignUpData) => Promise<AuthResult>
  signInWithEmail: (data: SignInData) => Promise<AuthResult>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  handleAuthCallback: (code: string, type: string) => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      try {
        console.log('Checking for existing session...')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session check error:', error)
          return
        }

        console.log('Session found:', session?.user?.email)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('Setting user after SIGNED_IN:', session.user.email)
          setUser(session.user)
        } else if (event === 'SIGNED_OUT') {
          console.log('Clearing user after SIGNED_OUT')
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED') {
          // Update user state when token is refreshed
          console.log('Updating user after TOKEN_REFRESHED:', session?.user?.email)
          setUser(session?.user ?? null)
        } else if (event === 'INITIAL_SESSION') {
          console.log('Setting initial session user:', session?.user?.email)
          setUser(session?.user ?? null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const signUpWithEmail = async (signUpData: SignUpData): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            first_name: signUpData.firstName,
            last_name: signUpData.lastName
          }
        }
      })

      if (error) {
        console.error('Signup error:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const signInWithEmail = async (signInData: SignInData): Promise<AuthResult> => {
    try {
      console.log('Attempting sign in for:', signInData.email)
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password
      })

      if (error) {
        console.error('Sign in error:', error)
        return { success: false, error: error.message }
      }

      console.log('Sign in success:', authData)

      if (authData.user) {
        setUser(authData.user)
        return { success: true, user: authData.user }
      }

      return { success: false, error: 'Sign in failed - no user returned' }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Get the current site URL dynamically
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ||
                     process.env.NEXT_PUBLIC_VERCEL_URL ||
                     'http://localhost:3000'

      const redirectUrl = `${siteUrl}/auth/callback`
      console.log('Attempting Google OAuth with redirect to:', redirectUrl)

      // Clear any existing auth state to prevent conflicts
      await supabase.auth.signOut({ scope: 'global' })

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Google sign in error:', error)
        throw error
      }

      if (data.url) {
        console.log('Redirecting to Google OAuth URL:', data.url)
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Sign out error:', error)
        throw error
      }

      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const handleAuthCallback = async (code: string, type: string): Promise<AuthResult> => {
    try {
      console.log('Processing auth callback, type:', type)

      // For OAuth callbacks, Supabase should automatically handle the session
      // Let's check if we already have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error('Session check error:', sessionError)
      }

      if (session?.user) {
        console.log('Session found after OAuth callback:', session.user.email)
        setUser(session.user)
        return { success: true, user: session.user }
      }

      // If no session, try to exchange the code
      console.log('No session found, attempting code exchange...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Code exchange error:', error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        console.log('Code exchange successful:', data.user.email)
        setUser(data.user)
        return { success: true, user: data.user }
      }

      return { success: false, error: 'Authentication failed - no user returned' }
    } catch (error) {
      console.error('Callback error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    handleAuthCallback
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}