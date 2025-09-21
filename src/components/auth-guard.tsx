'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Don't do anything while still loading
    if (loading) return

    // Define public pages that don't require authentication
    const publicPages = ['/', '/signin', '/signup', '/auth/callback', '/day']
    const isPublicPage = publicPages.some(page =>
      pathname === page || pathname.startsWith(page + '/')
    )

    // Allow access to day pages without authentication
    if (pathname.startsWith('/day')) {
      return
    }

    // Redirect unauthenticated users to sign in for protected pages
    if (!user && !isPublicPage) {
      router.push('/signin')
    }
  }, [user, loading, pathname, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return <>{children}</>
}