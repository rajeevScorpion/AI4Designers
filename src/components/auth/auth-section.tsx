'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { User, LogOut, Settings, Award, Trophy } from 'lucide-react'

interface UserProfile {
  id: string
  email?: string
  fullName?: string
  avatar_url?: string
}

export function AuthSection() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
      </div>
    )
  }

  if (user) {
    const userProfile = user.user_metadata as UserProfile || {}
    const initials = userProfile.fullName
      ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
      : userProfile.email
      ? userProfile.email[0].toUpperCase()
      : 'U'

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile.avatar_url} alt={userProfile.fullName || userProfile.email} />
              <AvatarFallback className="text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              {userProfile.fullName && (
                <p className="font-medium">{userProfile.fullName}</p>
              )}
              {userProfile.email && (
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  {userProfile.email}
                </p>
              )}
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile#badges">
              <Award className="mr-2 h-4 w-4" />
              <span>Badges</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/certificate">
              <Trophy className="mr-2 h-4 w-4" />
              <span>Certificate</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} disabled={isSigningOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Link href="/signin">
      <Button variant="default" size="sm">
        Sign In
      </Button>
    </Link>
  )
}