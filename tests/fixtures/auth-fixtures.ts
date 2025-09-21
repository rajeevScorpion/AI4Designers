import { test as base, type Page } from '@playwright/test'

export type AuthFixtures = {
  page: Page
}

// Mock authentication for testing
export const test = base.extend<AuthFixtures>({
  page: async ({ page }, use) => {
    // Mock the auth state
    await page.route('**/api/auth/**', async (route) => {
      if (route.request().url().includes('/signin')) {
        // Mock successful sign in
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: {
                fullName: 'Test User',
                avatar_url: null
              }
            }
          })
        })
      } else if (route.request().url().includes('/session')) {
        // Mock active session
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            session: {
              user: {
                id: 'test-user-id',
                email: 'test@example.com',
                user_metadata: {
                  fullName: 'Test User',
                  avatar_url: null
                }
              }
            }
          })
        })
      } else {
        // Continue with other routes
        await route.continue()
      }
    })

    // Mock Supabase auth
    await page.addInitScript(() => {
      // Mock Supabase client
      ;(window as any).supabase = {
        auth: {
          getSession: async () => ({
            data: {
              session: {
                user: {
                  id: 'test-user-id',
                  email: 'test@example.com',
                  user_metadata: {
                    fullName: 'Test User',
                    avatar_url: null
                  }
                }
              }
            },
            error: null
          }),
          onAuthStateChange: (callback: any) => ({
            data: {
              subscription: {
                unsubscribe: () => {}
              }
            }
          })
        }
      }
    })

    await use(page)
  }
})