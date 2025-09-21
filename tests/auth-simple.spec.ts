import { test, expect } from '@playwright/test';

test.describe('Simple Auth Test', () => {
  test('debug sign in process', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/signin');

    // Fill in form
    await page.fill('#email', 'test@example.com');
    await page.fill('#password', 'password123');

    // Submit form
    await page.click('form button[type="submit"]');

    // Wait for any response
    await page.waitForTimeout(3000);

    // Take screenshot
    await page.screenshot({ path: 'signin-result.png', fullPage: true });

    // Check current URL
    console.log('URL after sign in:', page.url());

    // Check for any alerts or messages
    const alerts = page.locator('.alert');
    const alertCount = await alerts.count();
    console.log('Number of alerts:', alertCount);

    for (let i = 0; i < alertCount; i++) {
      const alertText = await alerts.nth(i).textContent();
      console.log(`Alert ${i + 1}:`, alertText);
    }

    // Check if we have an error
    const errorAlert = page.locator('.alert-destructive');
    if (await errorAlert.isVisible()) {
      console.log('Error:', await errorAlert.textContent());
    }

    // Check if we have success
    const successAlert = page.locator('.border-green-200');
    if (await successAlert.isVisible()) {
      console.log('Success:', await successAlert.textContent());
    }
  });
});