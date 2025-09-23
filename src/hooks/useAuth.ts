'use client'

import { useState, useEffect } from 'react'
import { useCourse } from '@/contexts/CourseContext'
import { AuthState } from '@/lib/progressStorage'
import { createServiceClient } from '@/lib/supabase/service'

interface UseAuthReturn {
  authState: AuthState
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  isLoading: boolean
}

export function useAuth(): UseAuthReturn {
  const { authState, setAuthState } = useCourse()
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createServiceClient()

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setAuthState({
            isAuthenticated: true,
            user: session.user,
            token: session.access_token
          })
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setAuthState({
            isAuthenticated: true,
            user: session.user,
            token: session.access_token
          })
        } else if (event === 'SIGNED_OUT') {
          setAuthState({ isAuthenticated: false })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [setAuthState])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (data.success) {
        setAuthState({
          isAuthenticated: true,
          user: data.user,
          token: data.session.access_token
        })
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      console.error('Google sign in error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (firstName: string, lastName: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ firstName, lastName, email, password })
      })

      const data = await response.json()

      if (data.success) {
        // Note: User will need to sign in after signup
        return { success: true }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      await supabase.auth.signOut()
      setAuthState({ isAuthenticated: false })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    authState,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    isLoading
  }
}