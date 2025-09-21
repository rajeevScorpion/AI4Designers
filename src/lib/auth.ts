export interface SignUpData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: any
}

// Client-side auth utilities (no database operations)
export const authService = {
  async signUp(data: SignUpData): Promise<AuthResult> {
    // This should not be called client-side
    throw new Error('Client-side signup not supported. Use API route instead.')
  }
}