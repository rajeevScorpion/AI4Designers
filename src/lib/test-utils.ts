import { createServiceClient } from '@/lib/supabase/service'

/**
 * Test utilities for API endpoints with service role access
 */
export class TestApi {
  private serviceRoleKey: string

  constructor() {
    this.serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  }

  private async apiCall(endpoint: string, options: RequestInit = {}) {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.serviceRoleKey}`,
        'x-service-role-key': this.serviceRoleKey,
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  private async localApiCall(endpoint: string, options: RequestInit = {}) {
    const url = `/api${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-service-role-key': this.serviceRoleKey,
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Local API call failed: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async createUser(userData: any) {
    return this.localApiCall('/create-user', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  async getProgress() {
    return this.localApiCall('/progress', {
      method: 'GET'
    })
  }

  async updateProgress(progressData: any) {
    return this.localApiCall('/progress', {
      method: 'POST',
      body: JSON.stringify(progressData)
    })
  }

  async testDatabaseConnection() {
    const supabase = createServiceClient()
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1)
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createTestUser(userData: any) {
    const supabase = createServiceClient()
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()

      if (error) throw error
      return { success: true, data: data?.[0] }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async createTestProgress(progressData: any) {
    const supabase = createServiceClient()
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert([progressData])
        .select()

      if (error) throw error
      return { success: true, data: data?.[0] }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getUsers() {
    const supabase = createServiceClient()
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(10)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  async getProgress() {
    const supabase = createServiceClient()
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .limit(10)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

// Singleton instance
export const testApi = new TestApi()