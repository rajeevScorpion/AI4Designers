import { test, expect } from '@playwright/test'

test.describe('Authentication Persistence', () => {
  test('should maintain authentication state across all pages', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Click sign in button
    await page.click('text=Sign In')

    // Wait for sign in page to load
    await expect(page).toHaveURL('/signin')

    // Fill in sign in form with test credentials
    await page.fill('[type="email"]', 'test@example.com')
    await page.fill('[type="password"]', 'password123')

    // Submit form
    await page.click('button:has-text("Sign In")')

    // Wait for successful sign in and redirect
    await expect(page).toHaveURL('/profile', { timeout: 10000 })

    // Verify user avatar is visible
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Navigate to day 1 page
    await page.click('text=Course')
    await page.click('[data-testid="button-sidebar-day-1"]')

    // Wait for day 1 page to load
    await expect(page).toHaveURL('/day/1')

    // Verify user avatar is still visible on day page
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Navigate through different days using sidebar
    await page.click('[data-testid="button-sidebar-day-2"]')
    await expect(page).toHaveURL('/day/2')

    // Verify authentication persists
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Navigate to day 3
    await page.click('[data-testid="button-sidebar-day-3"]')
    await expect(page).toHaveURL('/day/3')

    // Verify authentication persists
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Go back to home page
    await page.click('text=AI4Designers')
    await expect(page).toHaveURL('/')

    // Verify authentication persists on home page
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Open user dropdown and verify profile options
    await page.click('button[aria-label*="avatar"]')
    await expect(page.locator('text=Profile')).toBeVisible()
    await expect(page.locator('text=Badges')).toBeVisible()
    await expect(page.locator('text=Certificate')).toBeVisible()
    await expect(page.locator('text=Sign out')).toBeVisible()

    // Close dropdown
    await page.keyboard.press('Escape')

    // Navigate to profile page
    await page.click('button[aria-label*="avatar"]')
    await page.click('text=Profile')
    await expect(page).toHaveURL('/profile')

    // Verify authentication persists on profile page
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Sign out
    await page.click('button[aria-label*="avatar"]')
    await page.click('text=Sign out')

    // Verify sign out and redirect to home
    await expect(page).toHaveURL('/')
    await expect(page.locator('text=Sign In')).toBeVisible()
  })

  test('should not show profile link in navigation for non-authenticated users', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Verify navigation doesn't contain Profile link
    await expect(page.locator('nav >> text=Profile')).toHaveCount(0)

    // Verify Sign In button is visible
    await expect(page.locator('text=Sign In')).toBeVisible()

    // Navigate to day pages
    await page.click('text=Course')
    await page.click('[data-testid="button-sidebar-day-1"]')

    // Verify no Profile link in mobile menu
    await page.click('button[aria-label="Toggle mobile menu"]')
    await expect(page.locator('.mobile-menu >> text=Profile')).toHaveCount(0)
  })

  test('should maintain authentication after page refresh', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Sign in
    await page.click('text=Sign In')
    await page.fill('[type="email"]', 'test@example.com')
    await page.fill('[type="password"]', 'password123')
    await page.click('button:has-text("Sign In")')

    // Wait for redirect to profile
    await expect(page).toHaveURL('/profile')

    // Refresh the page
    await page.reload()

    // Verify authentication persists after refresh
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Navigate to day page
    await page.goto('/day/1')

    // Refresh again
    await page.reload()

    // Verify authentication still persists
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()
  })
})