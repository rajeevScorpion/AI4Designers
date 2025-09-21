import { test, expect } from '@playwright/test';

test.describe('Authentication Debug', () => {
  test('debug sign in flow', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/signin');

    // Take a screenshot to see the page
    await page.screenshot({ path: 'signin-page.png', fullPage: true });

    // Check if the form elements exist
    const emailInput = page.locator('#email');
    const passwordInput = page.locator('#password');
    const signInButton = page.locator('form button[type="submit"]');

    console.log('Email input visible:', await emailInput.isVisible());
    console.log('Password input visible:', await passwordInput.isVisible());
    console.log('Sign In button visible:', await signInButton.isVisible());

    // Fill in form
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    // Click sign in
    await signInButton.click();

    // Wait a bit to see what happens
    await page.waitForTimeout(5000);

    // Take another screenshot
    await page.screenshot({ path: 'after-signin.png', fullPage: true });

    // Check current URL
    console.log('Current URL:', page.url());

    // Check for any error messages
    const errorAlert = page.locator('.alert-destructive');
    if (await errorAlert.isVisible()) {
      console.log('Error message:', await errorAlert.textContent());
    }
  });
});