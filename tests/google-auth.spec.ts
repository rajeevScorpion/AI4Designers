import { test, expect } from '@playwright/test'

test.describe('Google Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and localStorage before each test
    await page.context().clearCookies()
    await page.goto('/')
  })

  test('should show Google sign-in button on sign-in page', async ({ page }) => {
    await page.goto('/signin')

    // Check if Google sign-in button is present
    const googleButton = page.locator('button', { hasText: 'Sign in with Google' })
    await expect(googleButton).toBeVisible()
    await expect(googleButton).toBeEnabled()
  })

  test('should show Google sign-up button on sign-up page', async ({ page }) => {
    await page.goto('/signup')

    // Check if Google sign-up button is present
    const googleButton = page.locator('button', { hasText: 'Sign up with Google' })
    await expect(googleButton).toBeVisible()
    await expect(googleButton).toBeEnabled()
  })

  test('should not show error when Google auth is properly configured', async ({ page }) => {
    await page.goto('/signin')

    // Click Google sign-in button
    await page.click('button', { hasText: 'Sign in with Google' })

    // Wait for potential redirect or error
    await page.waitForTimeout(2000)

    // Should not show error message for missing API endpoint
    const errorAlert = page.locator('[role="alert"].destructive')
    if (await errorAlert.isVisible()) {
      const errorText = await errorAlert.textContent()
      expect(errorText).not.toContain('Google sign in failed')
    }
  })

  test('should not make API call to /api/auth/google when clicking Google button', async ({ page }) => {
    await page.goto('/signin')

    // Listen for network requests to the old API endpoint
    let apiCallMade = false

    page.on('request', request => {
      if (request.url().includes('/api/auth/google')) {
        apiCallMade = true
      }
    })

    // Click Google sign-in button
    await page.click('button', { hasText: 'Sign in with Google' })

    // Wait for potential redirect
    await page.waitForTimeout(2000)

    // Should not have made API call to the old endpoint
    expect(apiCallMade).toBe(false)
  })

  test('should show loading state when clicking Google button', async ({ page }) => {
    await page.goto('/signin')

    const googleButton = page.locator('button', { hasText: 'Sign in with Google' })

    // Click the button
    await googleButton.click()

    // Check if button shows loading state (should be disabled)
    await expect(googleButton).toBeDisabled()

    // Wait a bit - the user should be redirected to Google OAuth
    await page.waitForTimeout(2000)

    // At this point, user should be redirected to Google or staying on page with button disabled
    // The exact behavior depends on OAuth configuration
    // For now, just verify the button was disabled during loading
    console.log('Google OAuth flow initiated - user would be redirected to Google')
  })
})