export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Clear authentication data
export function clearAuth() {
  localStorage.removeItem('supabase_token');
  document.cookie = 'supabase_token=; path=/; max-age=0; Secure; SameSite=Lax';
}

// Handle logout
export function handleLogout() {
  clearAuth();
  // Redirect to logout endpoint to clear server-side session
  window.location.href = '/api/logout';
}