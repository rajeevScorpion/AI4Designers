'use client'

import { Suspense } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'

function AuthCallbackContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
          <AlertDescription>
            Authentication has been disabled. This callback page is now a static UI demonstration.
          </AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <p className="text-muted-foreground">
            Authentication callback functionality has been removed.
          </p>
        </div>
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