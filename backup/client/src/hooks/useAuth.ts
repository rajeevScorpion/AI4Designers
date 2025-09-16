import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  fullName?: string;
  phone?: string;
  profession?: string;
  courseType?: string;
  stream?: string;
  fieldOfWork?: string;
  designation?: string;
  organization?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useAuth() {
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    // Uses global queryFn with proper 401 handling
    retry: false,
    staleTime: 30 * 1000, // Cache for 30 seconds (reduced for better sync)
    refetchOnWindowFocus: true, // Refetch on window focus to catch auth changes
    refetchOnMount: 'always', // Always refetch on mount to ensure fresh auth state
    refetchOnReconnect: true, // Refetch on reconnect
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch, // Expose refetch for manual refetching
  };
}