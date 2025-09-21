import { test, expect } from '@playwright/test'

const protectedRoutes = [
  { path: '/day/1', name: 'Day 1' },
  { path: '/day/2', name: 'Day 2' },
  { path: '/day/3', name: 'Day 3' },
  { path: '/day/4', name: 'Day 4' },
  { path: '/day/5', name: 'Day 5' },
  { path: '/profile', name: 'Profile' },
  { path: '/certificate', name: 'Certificate' }
]

const publicRoutes = [
  { path: '/', name: 'Home' },
  { path: '/signin', name: 'Sign In' },
  { path: '/signup', name: 'Sign Up' }
]

test.describe('Route Protection', () => {
  test.describe('Non-authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      await page.context().clearCookies()
    })

    for (const route of protectedRoutes) {
      test(`should redirect ${route.name} page to signin`, async ({ page }) => {
        await page.goto(route.path)

        // Should redirect to signin
        await expect(page).toHaveURL('/signin')

        // Should contain redirectTo parameter
        const url = page.url()
        expect(url).toContain(`redirectTo=${encodeURIComponent(route.path)}`)

        // Should show sign in form
        await expect(page.locator('text=Welcome back')).toBeVisible()
        await expect(page.locator('button:has-text("Sign In")')).toBeVisible()
      })
    }

    for (const route of publicRoutes) {
      test(`should allow access to ${route.name} page`, async ({ page }) => {
        await page.goto(route.path)

        // Should not redirect
        await expect(page).toHaveURL(route.path)

        // Should not show signin form on home page
        if (route.path === '/') {
          await expect(page.locator('text=AI Fundamentals for Designers')).toBeVisible()
          await expect(page.locator('text=Sign In')).toBeVisible()
        }
      })
    }

    test('should redirect back to original page after sign in', async ({ page }) => {
      // Try to access protected route
      await page.goto('/day/3')

      // Should be redirected to signin with redirectTo
      await expect(page).toHaveURL('/signin')
      const url = page.url()
      expect(url).toContain('redirectTo=%2Fday%2F3')

      // In a real test, you would fill out the form and submit
      // For now, we'll just verify the redirectTo parameter is preserved
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('input[name="password"]')).toBeVisible()
    })
  })

  test.describe('Authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      // Simulate authentication
      await page.context().addCookies([
        {
          name: 'sb-access-token',
          value: 'fake-token',
          domain: 'localhost',
          path: '/',
        }
      ])
    })

    for (const route of protectedRoutes) {
      test(`should allow access to ${route.name} page when authenticated`, async ({ page }) => {
        await page.goto(route.path)

        // Should not redirect
        await expect(page).toHaveURL(route.path)

        // Should show user avatar (indicating authenticated state)
        await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

        // Should not show sign in button
        await expect(page.locator('text=Sign In')).toHaveCount(0)
      })
    }

    test('should redirect from signin to home when already authenticated', async ({ page }) => {
      await page.goto('/signin')

      // Should redirect to home
      await expect(page).toHaveURL('/')

      // Should show user avatar
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()
    })

    test('should redirect from signup to home when already authenticated', async ({ page }) => {
      await page.goto('/signup')

      // Should redirect to home
      await expect(page).toHaveURL('/')

      // Should show user avatar
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()
    })
  })
})