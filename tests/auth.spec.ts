import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the sign in page
    await page.goto('/signin');
  });

  test('successful login with valid credentials', async ({ page }) => {
    // Fill in the login form
    await page.fill('[type="email"]', 'test@example.com');
    await page.fill('[type="password"]', '123456');

    // Click the sign in button
    await page.click('button[type="submit"]');

    // Wait for navigation or success message
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('failed login with invalid credentials', async ({ page }) => {
    // Fill in invalid credentials
    await page.fill('[type="email"]', 'invalid@example.com');
    await page.fill('[type="password"]', 'wrongpassword');

    // Click the sign in button
    await page.click('button[type="submit"]');

    // Check for error message
    await expect(page.locator('.alert-destructive')).toBeVisible();
    await expect(page.locator('.alert-destructive')).toContainText('Invalid login credentials');
  });

  test('login with empty fields shows validation', async ({ page }) => {
    // Click sign in without filling fields
    await page.click('button[type="submit"]');

    // Check for HTML5 validation
    const emailInput = page.locator('[type="email"]');
    const passwordInput = page.locator('[type="password"]');

    await expect(emailInput).toBeRequired();
    await expect(passwordInput).toBeRequired();
  });

  test('password visibility toggle works', async ({ page }) => {
    const passwordInput = page.locator('[type="password"]');
    const toggleButton = page.locator('button[type="button"]').filter({ hasText: '' });

    // Fill password
    await passwordInput.fill('123456');

    // Check initial type
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click toggle button
    await toggleButton.click();

    // Check if password is now visible
    await expect(page.locator('[type="text"]')).toBeVisible();

    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Google sign in button is present', async ({ page }) => {
    const googleButton = page.locator('button', { hasText: 'Sign in with Google' });
    await expect(googleButton).toBeVisible();
  });

  test('navigation links work', async ({ page }) => {
    // Check if there's a link back to home
    const homeLink = page.locator('a[href="/"]');
    if (await homeLink.count() > 0) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});