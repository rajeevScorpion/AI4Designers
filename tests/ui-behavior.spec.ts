import { test, expect } from '@playwright/test'

test.describe('UI Behavior Based on Auth State', () => {
  test.describe('Non-authenticated Users', () => {
    test.beforeEach(async ({ page }) => {
      await page.context().clearCookies()
      await page.goto('/')
    })

    test('should not show sidebar toggle button', async ({ page }) => {
      // Sidebar toggle should not be visible
      await expect(page.locator('button[aria-label="Toggle Sidebar"]')).toHaveCount(0)
    })

    test('should show disabled Course link with tooltip', async ({ page }) => {
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

    test('should show sign in button instead of user avatar', async ({ page }) => {
      // Should show sign in button
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()

      // Should not show user avatar
      await expect(page.locator('button[aria-label*="avatar"]')).toHaveCount(0)
    })

    test('should show course preview modal when clicking day cards', async ({ page }) => {
      // Click on day 1 card
      await page.click('[data-testid="card-day-1"]')

      // Modal should appear
      await expect(page.locator('[role="dialog"]')).toBeVisible()
      await expect(page.getByRole('dialog').getByText('Day 1:')).toBeVisible()

      // Should show sign in CTA in modal
      await expect(page.getByRole('dialog').getByRole('link', { name: 'Sign In to Access Course' })).toBeVisible()

      // Close modal
      await page.click('button[aria-label="Close"]')
      await expect(page.locator('[role="dialog"]')).toHaveCount(0)
    })
  })

  test.describe('Mobile Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.context().clearCookies()
      await page.goto('/')
    })

    test('should show disabled Course link in mobile menu', async ({ page }) => {
      // Open mobile menu
      await page.click('button[aria-label="Toggle mobile menu"]')

      // Course link should be disabled
      const mobileCourseLink = page.locator('.md\\:hidden.border-t >> text=Course')
      await expect(mobileCourseLink).toBeVisible()
      await expect(mobileCourseLink).toHaveClass(/text-muted-foreground/)
      await expect(mobileCourseLink).toHaveAttribute('title', 'Sign in to access the course')
    })

    test('should show sign in button in mobile menu', async ({ page }) => {
      // Open mobile menu
      await page.click('button[aria-label="Toggle mobile menu"]')

      // Should show sign in button
      await expect(page.locator('.md\\:hidden.border-t >> text=Sign In')).toBeVisible()
    })
  })
})