'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshAuth } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Refresh auth state to get the user session
        await refreshAuth()

        // Get the redirect URL from search params or default to home
        const redirectTo = searchParams.get('redirectTo') || '/'

        // Redirect to the appropriate page
        router.push(redirectTo)
      } catch (error) {
        console.error('Error handling auth callback:', error)
        router.push('/signin?error=Authentication failed')
      }
    }

    handleCallback()
  }, [router, searchParams, refreshAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Signing you in...</p>
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  )
}