import { test, expect } from '@playwright/test';

test.describe('Auth Network Test', () => {
  test('check network requests during sign in', async ({ page }) => {
    // Capture network requests
    const apiResponses: string[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push(response.url());
        console.log('API Response:', response.url(), response.status());
      }
    });

    // Navigate to sign in page
    await page.goto('/signin');

    // Fill in form
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    // Submit form
    await page.click('form button[type="submit"]');

    // Wait for any response
    await page.waitForTimeout(5000);

    // Check if API call was made
    console.log('API responses captured:', apiResponses);

    // Check current URL
    console.log('URL after sign in:', page.url());

    // Check form state
    const emailValue = await page.inputValue('#email');
    console.log('Email input value:', emailValue);
  });
});