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

    // Mock Supabase auth and intercept the auth context
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
          signInWithPassword: async () => ({
            data: {
              user: {
                id: 'test-user-id',
                email: 'test@example.com',
                user_metadata: {
                  fullName: 'Test User',
                  avatar_url: null
                }
              },
              session: {
                access_token: 'mock-token',
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
          onAuthStateChange: (callback: any) => {
            // Immediately call the callback with a signed-in user
            setTimeout(() => {
              callback('SIGNED_IN', {
                user: {
                  id: 'test-user-id',
                  email: 'test@example.com',
                  user_metadata: {
                    fullName: 'Test User',
                    avatar_url: null
                  }
                }
              });
            }, 100);

            return {
              data: {
                subscription: {
                  unsubscribe: () => {}
                }
              }
            }
          }
        }
      }

      // Store auth state in localStorage for persistence
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: {
          access_token: 'mock-token',
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: {
              fullName: 'Test User',
              avatar_url: null
            }
          }
        }
      }));
    })

    // Handle the sign-in success message and redirect
    page.on('response', async (response) => {
      if (response.url().includes('/api/auth/signin') && response.status() === 200) {
        // Wait for the success message to appear
        await page.waitForSelector('text=Successfully signed in! Redirecting...', { timeout: 5000 });
      }
    });

    await use(page)
  }
})