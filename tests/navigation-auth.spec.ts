import { test, expect } from '@playwright/test'

test.describe('Navigation with Authentication', () => {
  test.describe('Non-authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      await page.context().clearCookies()
      await page.goto('/')
    })

    test('should hide sidebar toggle button', async ({ page }) => {
      // Sidebar toggle should not be visible
      await expect(page.locator('button[aria-label="Toggle Sidebar"]')).toHaveCount(0)
    })

    test('should show disabled Course link in navigation', async ({ page }) => {
      // Desktop navigation
      const desktopCourseLink = page.locator('nav.hidden.md\\:flex >> text=Course')
      await expect(desktopCourseLink).toBeVisible()
      await expect(desktopCourseLink).toHaveClass(/text-muted-foreground/)
      await expect(desktopCourseLink).toHaveAttribute('title', 'Sign in to access the course')

      // Mobile navigation
      await page.click('button[aria-label="Toggle mobile menu"]')
      const mobileCourseLink = page.locator('.md\\:hidden.border-t >> text=Course')
      await expect(mobileCourseLink).toBeVisible()
      await expect(mobileCourseLink).toHaveClass(/text-muted-foreground/)
      await expect(mobileCourseLink).toHaveAttribute('title', 'Sign in to access the course')
    })

    test('should not show sidebar on any page', async ({ page }) => {
      // Check home page
      await expect(page.locator('[data-testid="sidebar-course"]')).toHaveCount(0)

      // Try to go to day page (will redirect)
      await page.goto('/day/1')
      await expect(page).toHaveURL('/signin')
      await expect(page.locator('[data-testid="sidebar-course"]')).toHaveCount(0)

      // Go back to home
      await page.goto('/')
      await expect(page.locator('[data-testid="sidebar-course"]')).toHaveCount(0)
    })
  })

  test.describe('Authenticated User', () => {
    test.beforeEach(async ({ page }) => {
      // For this test, we'll simulate authentication by setting a cookie
      // In a real scenario, you would actually sign in
      await page.context().addCookies([
        {
          name: 'sb-access-token',
          value: 'fake-token',
          domain: 'localhost',
          path: '/',
        },
        {
          name: 'sb-refresh-token',
          value: 'fake-refresh-token',
          domain: 'localhost',
          path: '/',
        }
      ])
      await page.goto('/')
    })

    test('should show sidebar toggle button', async ({ page }) => {
      // Sidebar toggle should be visible for authenticated users
      await expect(page.locator('button[aria-label="Toggle Sidebar"]')).toBeVisible()
    })

    test('should show enabled Course link in navigation', async ({ page }) => {
      // Desktop navigation
      const desktopCourseLink = page.locator('nav.hidden.md\\:flex >> text=Course')
      await expect(desktopCourseLink).toBeVisible()
      await expect(desktopCourseLink).not.toHaveClass(/text-muted-foreground/)
      await expect(desktopCourseLink).not.toHaveAttribute('title', 'Sign in to access the course')

      // Mobile navigation
      await page.click('button[aria-label="Toggle mobile menu"]')
      const mobileCourseLink = page.locator('.md\\:hidden.border-t >> text=Course')
      await expect(mobileCourseLink).toBeVisible()
      await expect(mobileCourseLink).not.toHaveClass(/text-muted-foreground/)
      await expect(mobileCourseLink).not.toHaveAttribute('title', 'Sign in to access the course')
    })

    test('should show sidebar on day pages', async ({ page }) => {
      // Navigate to day 1
      await page.click('text=Course')
      await page.click('[data-testid="button-sidebar-day-1"]')
      await expect(page).toHaveURL('/day/1')

      // Sidebar should be visible
      await expect(page.locator('[data-testid="sidebar-course"]')).toBeVisible()
    })

    test('should maintain authentication across navigation', async ({ page }) => {
      // Should show user avatar
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

      // Navigate to different pages
      await page.click('text=Course')
      await page.click('[data-testid="button-sidebar-day-1"]')
      await expect(page).toHaveURL('/day/1')

      // User avatar should still be visible
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

      // Navigate to day 2
      await page.click('[data-testid="button-sidebar-day-2"]')
      await expect(page).toHaveURL('/day/2')

      // User avatar should still be visible
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

      // Go back to home
      await page.click('text=AI4Designers')
      await expect(page).toHaveURL('/')

      // User avatar should still be visible
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()
    })
  })
})