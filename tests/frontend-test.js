const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  try {
    // 1. Go to profile page directly
    console.log('Navigating to profile...');
    await page.goto('http://localhost:3009/profile');
    await page.waitForLoadState('networkidle');

    // 2. Check if form loads
    console.log('Checking if form exists...');
    const formExists = await page.$('form');
    console.log('Form exists:', !!formExists);

    // 3. Fill form with test data
    console.log('Filling profile form...');
    await page.fill('#fullName', 'Test User');
    await page.fill('#phone', '9876543210');
    await page.click('#student');
    await page.fill('#courseType', 'UG');
    await page.fill('#stream', 'Graphic Design');
    await page.fill('#organization', 'Test College');
    await page.fill('#dateOfBirth', '2000-01-01');

    // 4. Check if save button exists and is clickable
    console.log('Checking save button...');
    const saveButton = await page.$('button[type="submit"]');
    console.log('Save button exists:', !!saveButton);

    // 5. Click save and see what happens
    console.log('Clicking save button...');
    await page.click('button[type="submit"]');

    // Wait a bit to see the result
    await page.waitForTimeout(5000);

    // Check for any error messages
    const errorMsg = await page.$('.border-red-200, .bg-red-50');
    if (errorMsg) {
      const errorText = await errorMsg.textContent();
      console.log('Error message found:', errorText);
    }

    // Check for success messages
    const successMsg = await page.$('.border-green-200, .bg-green-50');
    if (successMsg) {
      const successText = await successMsg.textContent();
      console.log('Success message found:', successText);
    }

    // Take screenshot
    await page.screenshot({ path: 'frontend-test-result.png', fullPage: true });

    console.log('Test completed');

  } catch (error) {
    console.error('Test failed:', error);
    await page.screenshot({ path: 'frontend-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
})();