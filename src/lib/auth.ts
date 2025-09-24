import { NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/client'

export interface SignUpData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface AuthUser {
  id: string
  email?: string
  user_metadata?: any
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: AuthUser | any
  isServiceRole?: boolean
}

/**
 * Authenticate user from request with multiple strategies:
 * 1. Bearer token (for authenticated users)
 * 2. Service role key (for testing/admin operations)
 * 3. Anonymous access (for read-only operations)
 */
export async function authenticateRequest(request: NextRequest, options: {
  requireAuth?: boolean
  allowServiceRole?: boolean
} = {}): Promise<AuthResult> {
  const { requireAuth = true, allowServiceRole = true } = options

  try {
    // Strategy 1: Check for service role key (for testing/admin)
    if (allowServiceRole) {
      const serviceRoleHeader = request.headers.get('x-service-role-key')
      const envServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

      if (serviceRoleHeader === envServiceKey) {
        return {
          success: true,
          isServiceRole: true,
          user: {
            id: 'service-role',
            email: 'service@ai4designers.local',
            user_metadata: { role: 'service' }
          }
        }
      }
    }

    // Strategy 2: Bearer token authentication
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const supabase = createServiceClient()
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (user && !error) {
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata
          }
        }
      }
    }

    // No valid authentication found
    return {
      success: false,
      error: 'Authentication required'
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Middleware to check authentication and inject user info into request
 */
export async function withAuth(request: NextRequest, handler: (user: AuthUser, isServiceRole: boolean) => Promise<Response>) {
  const authResult = await authenticateRequest(request, { requireAuth: true })

  if (!authResult.success || !authResult.user) {
    return new Response(JSON.stringify({ error: authResult.error || 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    return await handler(authResult.user, authResult.isServiceRole || false)
  } catch (error) {
    console.error('Handler error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

/**
 * Create a standardized API response
 */
export function apiResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    }
  })
}

/**
 * Handle OPTIONS requests for CORS
 */
export function handleOptions(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return apiResponse({ ok: true }, 200)
  }
  return null
}

// Client-side auth utilities (no database operations)
export const authService = {
  async signUp(data: SignUpData): Promise<AuthResult> {
    // This should not be called client-side
    throw new Error('Client-side signup not supported. Use API route instead.')
  }
}