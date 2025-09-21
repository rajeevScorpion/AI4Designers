'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { handleAuthCallback } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code')
        const type = searchParams.get('type')

        if (!code || !type) {
          setError('Invalid callback parameters')
          return
        }

        const result = await handleAuthCallback(code, type)

        if (result.success) {
          // Check if this is after sign up
          if (type === 'signup') {
            router.push('/profile')
          } else {
            router.push('/profile')
          }
        } else {
          setError(result.error || 'Authentication failed')
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError('An error occurred during authentication')
      } finally {
        setProcessing(false)
      }
    }

    processCallback()
  }, [searchParams, handleAuthCallback, router])

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Completing authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/signin')}
              className="text-primary hover:underline"
            >
              Return to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}