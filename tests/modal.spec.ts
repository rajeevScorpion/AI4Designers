import { test, expect } from '@playwright/test';

test.describe('Login Modal', () => {
  test('should appear when navigating to a day page', async ({ page }) => {
    // Clear sessionStorage to ensure modal appears
    await page.addInitScript(() => {
      sessionStorage.clear();
    });

    // Navigate to day 1
    await page.goto('/day/1');

    // Wait for page to load
    await page.waitForSelector('h1');

    // Check if modal backdrop is visible (darkened screen)
    const backdrop = page.locator('.fixed.inset-0.z-50.flex');
    await expect(backdrop).toBeVisible();

    // Check if modal content is visible
    const modalContent = page.locator('.bg-background.border.rounded-lg.shadow-xl');
    await expect(modalContent).toBeVisible();

    // Check if modal text is present
    await expect(page.locator('text=Login to save and track your progress')).toBeVisible();
    await expect(page.locator('text=Registered users get certificate and full access')).toBeVisible();

    // Check if buttons are present
    await expect(page.locator('text=Just Browsing!')).toBeVisible();
    await expect(page.locator('text=Give me Certificate')).toBeVisible();
  });

  test('should close when clicking Just Browsing', async ({ page }) => {
    // Clear sessionStorage to ensure modal appears
    await page.addInitScript(() => {
      sessionStorage.clear();
    });

    await page.goto('/day/1');
    await page.waitForSelector('h1');

    // Wait for modal to appear
    await page.waitForSelector('.fixed.inset-0.z-50.flex');

    // Click Just Browsing button
    await page.click('text=Just Browsing!');

    // Wait for modal to disappear
    await page.waitForSelector('.fixed.inset-0.z-50.flex', { state: 'hidden' });

    // Verify modal is no longer visible
    const backdrop = page.locator('.fixed.inset-0.z-50.flex');
    await expect(backdrop).toBeHidden();
  });

  test('should not appear on refresh of same day', async ({ page }) => {
    // Clear sessionStorage and set last seen day
    await page.addInitScript(() => {
      sessionStorage.clear();
      sessionStorage.setItem('lastSeenDay', '1');
    });

    await page.goto('/day/1');
    await page.waitForSelector('h1');

    // Wait a bit to ensure modal doesn't appear
    await page.waitForTimeout(1000);

    // Verify modal is not visible
    const backdrop = page.locator('.fixed.inset-0.z-50.flex');
    await expect(backdrop).toBeHidden();
  });

  test('should appear when navigating to different day', async ({ page }) => {
    // Set last seen day to 1
    await page.addInitScript(() => {
      sessionStorage.setItem('lastSeenDay', '1');
    });

    await page.goto('/day/2');
    await page.waitForSelector('h1');

    // Modal should appear since we're navigating to a different day
    const backdrop = page.locator('.fixed.inset-0.z-50.flex');
    await expect(backdrop).toBeVisible();

    const modalContent = page.locator('.bg-background.border.rounded-lg.shadow-xl');
    await expect(modalContent).toBeVisible();
  });
});