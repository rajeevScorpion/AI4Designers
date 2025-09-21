import { test, expect } from '@playwright/test';

test.describe('Authentication Persistence (Real)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session by signing out first
    try {
      await page.goto('/');
      const signOutButton = page.locator('button[aria-label*="avatar"]');
      if (await signOutButton.isVisible()) {
        await signOutButton.click();
        await page.click('text=Sign out');
        await page.waitForURL('/', { timeout: 5000 });
      }
    } catch (e) {
      // Ignore if not signed in
    }
  });

  test('should maintain authentication after page refresh', async ({ page }) => {
    // First, create a test user by signing up
    await page.goto('/signup');
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Sign Up")');

    // Wait for success message or redirect
    await expect(page.locator('text=Account created successfully')).toBeVisible({ timeout: 10000 });

    // Now navigate to sign in page
    await page.goto('/signin');

    // Fill in sign in form with test credentials
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    // Submit form
    await page.click('button:has-text("Sign In")');

    // Wait for successful sign in and redirect to profile
    await expect(page).toHaveURL('/profile', { timeout: 10000 });

    // Verify user is logged in by checking for user avatar or profile elements
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible({ timeout: 5000 });

    // Refresh the page using browser.reload()
    await page.reload();

    // Verify user remains logged in after refresh
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible({ timeout: 5000 });

    // Verify profile content is still visible
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });

  test('should persist authentication across different pages', async ({ page }) => {
    // Sign in first
    await page.goto('/signin');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL('/profile', { timeout: 10000 });

    // Verify authentication on profile page
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible();

    // Navigate to day 1 page
    await page.click('text=Course');
    await page.click('[data-testid="button-sidebar-day-1"]');
    await expect(page).toHaveURL('/day/1');

    // Verify authentication persists on day page
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible();

    // Refresh the day page
    await page.reload();

    // Verify authentication still persists after refresh
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible();

    // Navigate to day 2
    await page.click('[data-testid="button-sidebar-day-2"]');
    await expect(page).toHaveURL('/day/2');

    // Verify authentication persists
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible();

    // Navigate to home page
    await page.click('text=AI4Designers');
    await expect(page).toHaveURL('/');

    // Verify authentication persists on home page
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible();
  });

  test('should handle sign out properly', async ({ page }) => {
    // Sign in first
    await page.goto('/signin');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL('/profile', { timeout: 10000 });

    // Verify signed in state
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible();

    // Open user menu and click sign out
    await page.click('button[aria-label*="avatar"]');
    await page.click('text=Sign out');

    // Verify redirect to home page after sign out
    await expect(page).toHaveURL('/');

    // Verify user is signed out (Sign In button should be visible)
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('button[aria-label*="avatar"]')).not.toBeVisible();

    // Refresh the page after sign out
    await page.reload();

    // Verify user remains signed out after refresh
    await expect(page.locator('text=Sign In')).toBeVisible();
    await expect(page.locator('button[aria-label*="avatar"]')).not.toBeVisible();

    // Try to access profile page directly
    await page.goto('/profile');

    // Verify redirect to sign in or home page
    await expect(page).toHaveURL(/(\/signin|\/)/);
  });

  test('should maintain authentication session after browser restart simulation', async ({ page, context }) => {
    // Sign in
    await page.goto('/signin');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL('/profile', { timeout: 10000 });

    // Verify authentication
    await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible();

    // Close and reopen a new page (simulates browser restart)
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Verify authentication persists in new page
    await expect(newPage.locator('button[aria-label*="avatar"]')).toBeVisible({ timeout: 5000 });

    // Clean up
    await newPage.close();
  });

  test('should test all day pages with persistent authentication', async ({ page }) => {
    // Sign in
    await page.goto('/signin');
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');
    await page.click('button:has-text("Sign In")');
    await expect(page).toHaveURL('/profile', { timeout: 10000 });

    // Test navigation through all days
    const days = [1, 2, 3, 4, 5];

    for (const day of days) {
      // Navigate to day
      await page.click('text=Course');
      await page.click(`[data-testid="button-sidebar-day-${day}"]`);
      await expect(page).toHaveURL(`/day/${day}`);

      // Verify authentication
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible();

      // Refresh the page
      await page.reload();

      // Verify authentication persists after refresh
      await expect(page.locator('button[aria-label*="avatar"]')).toBeVisible();

      // Verify day content loads properly
      await expect(page.locator(`text=Day ${day}`)).toBeVisible();
    }
  });
});