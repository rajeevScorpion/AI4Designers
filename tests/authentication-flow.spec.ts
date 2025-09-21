import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and localStorage before each test
    await page.context().clearCookies()
    await page.goto('/')
  })

  test('should show sign in button for non-authenticated users', async ({ page }) => {
    // Navigate to home page
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()

    // Verify user avatar is not visible
    await expect(page.locator('button[aria-label*="avatar"]')).toHaveCount(0)

    // Verify sidebar toggle is not visible
    await expect(page.locator('button[aria-label="Toggle Sidebar"]')).toHaveCount(0)

    // Verify Course link is disabled
    const courseLink = page.locator('nav >> text=Course')
    await expect(courseLink).toHaveClass(/text-muted-foreground/)
    await expect(courseLink).toHaveAttribute('title', 'Sign in to access the course')
  })

  test('should redirect to signin when accessing protected routes', async ({ page }) => {
    // Try to access day 1 page
    await page.goto('/day/1')

    // Should redirect to signin with redirectTo parameter
    await expect(page).toHaveURL('/signin')
    const url = page.url()
    expect(url).toContain('redirectTo=%2Fday%2F1')

    // Try to access profile page
    await page.goto('/profile')
    await expect(page).toHaveURL('/signin')
    expect(page.url()).toContain('redirectTo=%2Fprofile')
  })

  test('should show preview modal for non-authenticated users on home page', async ({ page }) => {
    // Click on a day card
    await page.click('[data-testid="card-day-1"]')

    // Modal should open
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await expect(page.getByRole('dialog').getByText('Day 1:')).toBeVisible()

    // Close modal
    await page.click('button[aria-label="Close"]')
    await expect(page.locator('[role="dialog"]')).toHaveCount(0)
  })

  test('should not show sidebar on day pages for non-authenticated users', async ({ page }) => {
    // Since we can't directly access day pages without auth,
    // let's test by going through the modal
    await page.click('[data-testid="card-day-1"]')
    await expect(page.locator('[role="dialog"]')).toBeVisible()

    // The modal should show preview content, not the actual page
    // Sidebar should not be visible in the modal
    await expect(page.locator('[data-testid="sidebar-course"]')).toHaveCount(0)
  })
})