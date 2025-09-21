import { test, expect } from '@playwright/test';

test.describe('Auth Response Test', () => {
  test('check API response during sign in', async ({ page }) => {
    // Capture network requests
    let apiResponse: any = null;
    page.on('response', async response => {
      if (response.url().includes('/api/auth/signin')) {
        apiResponse = await response.json();
        console.log('API Response body:', apiResponse);
      }
    });

    // Navigate to sign in page
    await page.goto('/signin');

    // Fill in form
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    // Submit form
    await page.click('form button[type="submit"]');

    // Wait for response
    await page.waitForTimeout(3000);

    // Check if we got a successful response
    if (apiResponse && apiResponse.success) {
      console.log('Sign in was successful!');

      // Check if we're redirected after a delay
      await page.waitForTimeout(2000);
      console.log('URL after 2 more seconds:', page.url());

      // Look for user avatar in the header
      const avatar = page.locator('button[aria-label*="avatar"]');
      const isVisible = await avatar.isVisible();
      console.log('Avatar visible:', isVisible);

      if (isVisible) {
        console.log('User is signed in!');
      }
    } else {
      console.log('Sign in failed or no response');
    }
  });
});