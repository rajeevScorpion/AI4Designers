import { test, expect } from '@playwright/test'

test.describe('Authentication Persistence', () => {
  test('should maintain authentication state across all pages', async ({ page }) => {
    // Navigate to sign in page directly
    await page.goto('/signin')

    // Wait for page to load
    await expect(page).toHaveURL('/signin')

    // Fill in sign in form with test credentials
    await page.fill('#email', 'test@example.com')
    await page.fill('#password', 'password123')

    // Submit form
    await page.click('button:has-text("Sign In")')

    // Wait for successful sign in message
    await expect(page.locator('text=Successfully signed in!')).toBeVisible({ timeout: 10000 })

    // Wait for redirect to complete
    await page.waitForURL('/profile', { timeout: 10000 })

    // Verify user avatar button is visible using the dropdown trigger
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Navigate to day 1 page using direct URL
    await page.goto('/day/1')

    // Wait for day 1 page to load
    await expect(page).toHaveURL('/day/1')

    // Verify user avatar is still visible on day page
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Navigate through different days using direct URLs
    await page.goto('/day/2')
    await expect(page).toHaveURL('/day/2')

    // Verify authentication persists
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Navigate to day 3
    await page.goto('/day/3')
    await expect(page).toHaveURL('/day/3')

    // Verify authentication persists
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Go back to home page
    await page.goto('/')
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

    // Wait for sign out to complete
    await expect(page.locator('a[href="/signin"] >> text=Sign In')).toBeVisible({ timeout: 5000 })
  })

  test('should not show profile link in navigation for non-authenticated users', async ({ page }) => {
    // Navigate to home page
    await page.goto('/')

    // Verify navigation doesn't contain Profile link
    await expect(page.locator('nav >> text=Profile')).toHaveCount(0)

    // Verify Sign In button is visible using the correct selector
    await expect(page.locator('a[href="/signin"] >> text=Sign In')).toBeVisible()

    // Navigate to day pages (if accessible)
    try {
      await page.click('text=Course')
      await page.click('[data-testid="button-sidebar-day-1"]')
    } catch (e) {
      // Course might not be accessible without auth
      console.log('Course navigation not available without authentication')
    }
  })

  test('should maintain authentication after page refresh', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/signin')

    // Sign in
    await page.fill('#email', 'test@example.com')
    await page.fill('#password', 'password123')
    await page.click('button:has-text("Sign In")')

    // Wait for successful sign in and redirect
    await expect(page.locator('text=Successfully signed in!')).toBeVisible({ timeout: 10000 })
    await page.waitForURL('/profile', { timeout: 10000 })

    // Refresh the page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload({ waitUntil: 'networkidle' })

      // Wait for page to load
      await page.waitForLoadState('domcontentloaded')

      // Verify authentication persists after refresh
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible({ timeout: 5000 })
      console.log(`Authentication persisted after refresh ${i + 1}`)
    }

    // Navigate to day page
    await page.goto('/day/1')

    // Refresh again on day page
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForLoadState('domcontentloaded')

    // Verify authentication still persists
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible()

    // Navigate to different pages and refresh
    const pages = ['/day/2', '/day/3', '/']

    for (const url of pages) {
      await page.goto(url)
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForLoadState('domcontentloaded')

      // Verify authentication persists
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible({ timeout: 5000 })
      console.log(`Authentication persisted on ${url} after refresh`)
    }
  })
})