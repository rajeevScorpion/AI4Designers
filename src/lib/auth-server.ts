import { createServiceClient } from '@/lib/supabase/service'
import { db } from '@/lib/db'
import { users } from '@/shared/schema'

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

export const authService = {
  async signUp(data: SignUpData): Promise<AuthResult> {
    try {
      const supabase = createServiceClient()

      // Create user with Supabase Auth
      const { data: authData, error } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          first_name: data.firstName,
          last_name: data.lastName,
          full_name: `${data.firstName} ${data.lastName}`
        }
      })

      if (error) {
        console.error('Signup error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, user: authData.user }
    } catch (error) {
      console.error('Signup error:', error)
      return { success: false, error: 'An unexpected error occurred during signup' }
    }
  }
}