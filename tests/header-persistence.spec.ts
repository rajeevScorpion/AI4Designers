import { test, expect } from '@playwright/test';

test.describe('Header Persistence', () => {
  test('should show header on all pages including day pages', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Verify header is visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=AI4Designers')).toBeVisible();

    // Navigate to day 1 page
    await page.click('text=Course');
    await page.click('[data-testid="button-sidebar-day-1"]');

    // Wait for day 1 page to load
    await expect(page).toHaveURL('/day/1');

    // Verify header is visible on day page
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=AI4Designers')).toBeVisible();

    // Navigate to day 2 page
    await page.click('[data-testid="button-sidebar-day-2"]');
    await expect(page).toHaveURL('/day/2');

    // Verify header is still visible
    await expect(page.locator('header')).toBeVisible();

    // Go back to home
    await page.click('text=AI4Designers');
    await expect(page).toHaveURL('/');

    // Verify header is visible on home page
    await expect(page.locator('header')).toBeVisible();
  });

  test('should not show profile link in navigation menu', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Verify navigation doesn't contain Profile link
    await expect(page.locator('nav >> text=Profile')).toHaveCount(0);

    // Check desktop navigation
    const desktopNav = page.locator('nav.hidden.md\\:flex');
    await expect(desktopNav.locator('text=Profile')).toHaveCount(0);

    // Navigate to day page
    await page.click('text=Course');
    await page.click('[data-testid="button-sidebar-day-1"]');
    await expect(page).toHaveURL('/day/1');

    // Open mobile menu
    await page.click('button[aria-label="Toggle mobile menu"]');
    const mobileMenu = page.locator('.md\\:hidden.border-t');
    await expect(mobileMenu.locator('text=Profile')).toHaveCount(0);

    // Close mobile menu
    await page.click('button[aria-label="Toggle mobile menu"]');
  });

  test('should show consistent navigation elements', async ({ page }) => {
    // Check home page
    await page.goto('/');

    // Verify main navigation elements
    await expect(page.locator('text=Home')).toBeVisible();
    await expect(page.locator('text=Course')).toBeVisible();
    await expect(page.locator('text=Profile')).toHaveCount(0); // Should not exist

    // Verify sidebar trigger exists
    await expect(page.locator('button[aria-label="Toggle Sidebar"]')).toBeVisible();

    // Check day page
    await page.goto('/day/1');

    // Verify same navigation elements exist
    await expect(page.locator('button[aria-label="Toggle Sidebar"]')).toBeVisible();

    // Navigate back to home
    await page.click('text=AI4Designers');
    await expect(page).toHaveURL('/');
  });
});