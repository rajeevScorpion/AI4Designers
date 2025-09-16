import { test, expect } from '../fixtures/auth-fixtures';

test.describe('Sign In Flow', () => {
  test('should redirect to day 01 after successful sign in', async ({ page }) => {
    // Start from landing page
    await page.goto('/');

    // Click on sign in
    await page.click('[data-testid="button-login"]');

    // Should be on signin page
    await expect(page).toHaveURL('/signin');

    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to day 01 after successful sign in
    await expect(page).toHaveURL('/day/1');

    // Should see authenticated UI (sidebar and profile)
    await expect(page.locator('[data-testid="button-sidebar-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-login"]')).toBeHidden();
  });

  test('should not show sign in form when already authenticated', async ({ page, authenticatedPage }) => {
    // Sign in first
    await authenticatedPage.goto('/signin');

    // Should redirect to day 01 instead of showing sign in form
    await expect(authenticatedPage).toHaveURL('/day/1');

    // Should not see sign in form
    await expect(authenticatedPage.locator('form')).not.toBeVisible();
  });

  test('should maintain authentication state across navigation', async ({ authenticatedPage }) => {
    // Go to landing page
    await authenticatedPage.goto('/');

    // Should show profile button, not sign in
    await expect(authenticatedPage.locator('[data-testid="button-user-menu"]')).toBeVisible();
    await expect(authenticatedPage.locator('[data-testid="button-login"]')).toBeHidden();

    // Should have sidebar
    await expect(authenticatedPage.locator('[data-testid="button-sidebar-toggle"]')).toBeVisible();
  });

  test('should handle sign in correctly from protected routes', async ({ page }) => {
    // Try to access protected route without auth
    await page.goto('/day/1');

    // Should redirect to sign in or show auth UI
    await expect(page.locator('[data-testid="button-login"]')).toBeVisible();

    // Click sign in
    await page.click('[data-testid="button-login"]');

    // Should be on signin page
    await expect(page).toHaveURL('/signin');

    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect back to day 1 (original destination)
    await expect(page).toHaveURL('/day/1');
  });
});