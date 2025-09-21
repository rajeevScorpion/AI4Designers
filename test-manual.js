const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Testing header persistence...');

  // Navigate to home page
  await page.goto('http://localhost:3000');
  console.log('✓ Home page loaded');

  // Check if header exists
  const header = await page.locator('header').isVisible();
  console.log(`Header visible on home: ${header}`);

  // Check navigation links
  const profileLinks = await page.locator('nav >> text=Profile').count();
  console.log(`Profile links in navigation: ${profileLinks} (should be 0)`);

  // Navigate to day 1
  await page.click('text=Course');
  await page.waitForTimeout(1000);
  await page.click('[data-testid="button-sidebar-day-1"]');
  await page.waitForURL('/day/1');
  console.log('✓ Navigated to day 1');

  // Check header on day page
  const dayHeader = await page.locator('header').isVisible();
  console.log(`Header visible on day page: ${dayHeader}`);

  // Navigate to day 2
  await page.click('[data-testid="button-sidebar-day-2"]');
  await page.waitForURL('/day/2');
  console.log('✓ Navigated to day 2');

  // Check header again
  const day2Header = await page.locator('header').isVisible();
  console.log(`Header visible on day 2: ${day2Header}`);

  // Go back to home
  await page.click('text=AI4Designers');
  await page.waitForURL('/');
  console.log('✓ Back to home');

  // Final check
  const finalHeader = await page.locator('header').isVisible();
  console.log(`Header visible on final home: ${finalHeader}`);

  console.log('\nTest Summary:');
  console.log(`- Header persistence: ${header && dayHeader && day2Header && finalHeader ? 'PASS' : 'FAIL'}`);
  console.log(`- Profile link removed: ${profileLinks === 0 ? 'PASS' : 'FAIL'}`);

  await browser.close();
})();