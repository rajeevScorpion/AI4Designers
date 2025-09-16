import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { LogIn, LogOut, User, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/components/auth-provider"
import { useQuery } from '@tanstack/react-query'

async function fetchUser(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export function AuthHeader() {
  const router = useRouter()
  const { supabase } = useSupabase()

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-user'],
    queryFn: () => fetchUser(supabase),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <Button
        onClick={() => router.push('/signin')}
        data-testid="button-login"
      >
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>
    )
  }

  const userDisplayName = user.user_metadata?.full_name || user.email || 'User'
  const userInitials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U'

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={userDisplayName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium" data-testid="text-user-name">
              {userDisplayName}
            </p>
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground" data-testid="text-user-email">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')} className="w-full cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="w-full cursor-pointer" data-testid="link-logout">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}