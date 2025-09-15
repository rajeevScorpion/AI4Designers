import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes - don't refetch auth status frequently
    refetchOnWindowFocus: false, // Prevent refetch when window gains focus
    refetchOnMount: false, // Only fetch once per session
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}